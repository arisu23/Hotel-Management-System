const express = require("express");
const router = express.Router();
const { pool } = require("../config/db.config");
const {
  verifyToken,
  isAdmin,
  isReceptionist,
} = require("../middleware/auth.middleware");

// Get all bookings (admin/receptionist only)
router.get("/", verifyToken, isReceptionist, async (req, res) => {
  try {
    const [bookings] = await pool.execute(`
      SELECT b.*, u.username, 
        COALESCE(g.email, e.email) as email,
        COALESCE(g.first_name, e.first_name) as first_name,
        COALESCE(g.last_name, e.last_name) as last_name,
        r.room_number, r.room_type
      FROM bookings b
      JOIN useraccounts_tbl u ON b.user_id = u.id
      LEFT JOIN guest_tbl g ON u.id = g.user_id
      LEFT JOIN employee_tbl e ON u.id = e.user_id
      JOIN rooms r ON b.room_id = r.id
      ORDER BY b.created_at DESC
    `);
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

// Get user's bookings
router.get("/my-bookings", verifyToken, async (req, res) => {
  try {
    const [bookings] = await pool.execute(
      `
      SELECT b.*, r.room_number, r.room_type
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `,
      [req.userId]
    );
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

// Create new booking
router.post("/", verifyToken, async (req, res) => {
  try {
    const { room_id, check_in_date, check_out_date, totalPrice } = req.body;

    // Validate required fields
    if (!room_id || !check_in_date || !check_out_date || !totalPrice) {
      return res
        .status(400)
        .json({ message: "Missing required booking fields" });
    }

    // Check if room is available for the selected dates
    const [existingBookings] = await pool.execute(
      `
      SELECT * FROM bookings
      WHERE room_id = ?
      AND ((check_in_date <= ? AND check_out_date >= ?)
      OR (check_in_date <= ? AND check_out_date >= ?)
      OR (check_in_date >= ? AND check_out_date <= ?))
    `,
      [
        room_id,
        check_out_date,
        check_in_date,
        check_in_date,
        check_in_date,
        check_in_date,
        check_out_date,
      ]
    );

    if (existingBookings.length > 0) {
      return res
        .status(400)
        .json({ message: "Room is not available for the selected dates" });
    }

    // Create booking
    const [result] = await pool.execute(
      "INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, total_price, status, payment_status) VALUES (?, ?, ?, ?, ?, 'pending', 'pending')",
      [req.userId, room_id, check_in_date, check_out_date, totalPrice]
    );

    res
      .status(201)
      .json({ message: "Booking created successfully", id: result.insertId });
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({ message: "Error creating booking" });
  }
});

// Update booking status (admin/receptionist only)
router.put("/:id/status", verifyToken, async (req, res) => {
  try {
    const { status, payment_status } = req.body;
    const bookingId = req.params.id;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if booking exists and belongs to the user (unless admin/receptionist)
      const [booking] = await connection.execute(
        "SELECT * FROM bookings WHERE id = ? AND (user_id = ? OR ? IN ('admin', 'receptionist'))",
        [bookingId, req.userId, req.userRole]
      );

      if (booking.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "Booking not found" });
      }

      // Update booking status and payment status
      const updateFields = [];
      const updateValues = [];

      if (status) {
        updateFields.push("status = ?");
        updateValues.push(status);
      }

      if (payment_status) {
        updateFields.push("payment_status = ?");
        updateValues.push(payment_status);
      }

      if (updateFields.length > 0) {
        updateValues.push(bookingId);
        await connection.execute(
          `UPDATE bookings SET ${updateFields.join(", ")} WHERE id = ?`,
          updateValues
        );
      }

      await connection.commit();
      res.json({ message: "Booking status updated successfully" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating booking status" });
  }
});

// Get booking by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if booking exists and belongs to the user
      const [booking] = await connection.execute(
        "SELECT * FROM bookings WHERE id = ? AND user_id = ?",
        [bookingId, req.userId]
      );

      if (booking.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "Booking not found" });
      }

      // Get booking details with user and room information
      const [bookings] = await connection.execute(
        `
        SELECT b.*, u.username, r.room_number, r.room_type
        FROM bookings b
        JOIN useraccounts_tbl u ON b.user_id = u.id
        JOIN rooms r ON b.room_id = r.id
        WHERE b.id = ?
        `,
        [bookingId]
      );

      // Check if user has permission to view this booking
      if (
        req.userRole !== "admin" &&
        req.userRole !== "receptionist" &&
        bookings[0].user_id !== req.userId
      ) {
        await connection.rollback();
        return res
          .status(403)
          .json({ message: "Not authorized to view this booking" });
      }

      await connection.commit();
      res.json(bookings[0]);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching booking" });
  }
});

// Delete booking
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if booking exists and belongs to the user
      const [booking] = await connection.execute(
        "SELECT * FROM bookings WHERE id = ? AND user_id = ?",
        [bookingId, req.userId]
      );

      if (booking.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "Booking not found" });
      }

      // Delete any associated payment records
      await connection.execute("DELETE FROM payments WHERE booking_id = ?", [
        bookingId,
      ]);

      // Delete the booking
      await connection.execute("DELETE FROM bookings WHERE id = ?", [
        bookingId,
      ]);

      await connection.commit();
      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Error deleting booking" });
  }
});

module.exports = router;
