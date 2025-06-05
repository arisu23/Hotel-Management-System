const express = require("express");
const router = express.Router();
const pool = require("../config/db.config");
const {
  verifyToken,
  isAdmin,
  isReceptionist,
} = require("../middleware/auth.middleware");

// Get all bookings (admin/receptionist only)
router.get("/", verifyToken, isReceptionist, async (req, res) => {
  try {
    const [bookings] = await pool.execute(`
      SELECT b.*, u.username, u.email, r.room_number, r.room_type
      FROM bookings b
      JOIN users u ON b.user_id = u.id
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
    const { roomId, checkInDate, checkOutDate, totalPrice } = req.body;

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
        roomId,
        checkOutDate,
        checkInDate,
        checkInDate,
        checkInDate,
        checkInDate,
        checkOutDate,
      ]
    );

    if (existingBookings.length > 0) {
      return res
        .status(400)
        .json({ message: "Room is not available for the selected dates" });
    }

    // Create booking
    const [result] = await pool.execute(
      "INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, total_price) VALUES (?, ?, ?, ?, ?)",
      [req.userId, roomId, checkInDate, checkOutDate, totalPrice]
    );

    res
      .status(201)
      .json({ message: "Booking created successfully", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating booking" });
  }
});

// Update booking status (admin/receptionist only)
router.put("/:id/status", verifyToken, isReceptionist, async (req, res) => {
  try {
    const { status } = req.body;

    const [result] = await pool.execute(
      "UPDATE bookings SET status = ? WHERE id = ?",
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating booking status" });
  }
});

// Cancel booking
router.put("/:id/cancel", verifyToken, async (req, res) => {
  try {
    const [booking] = await pool.execute(
      "SELECT * FROM bookings WHERE id = ? AND user_id = ?",
      [req.params.id, req.userId]
    );

    if (booking.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking[0].status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    const [result] = await pool.execute(
      'UPDATE bookings SET status = "cancelled" WHERE id = ?',
      [req.params.id]
    );

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error cancelling booking" });
  }
});

// Get booking by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const [bookings] = await pool.execute(
      `
      SELECT b.*, u.username, u.email, r.room_number, r.room_type
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ?
    `,
      [req.params.id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user has permission to view this booking
    if (
      req.userRole !== "admin" &&
      req.userRole !== "receptionist" &&
      bookings[0].user_id !== req.userId
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this booking" });
    }

    res.json(bookings[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching booking" });
  }
});

module.exports = router;
