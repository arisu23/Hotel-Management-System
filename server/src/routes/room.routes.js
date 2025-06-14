const express = require("express");
const router = express.Router();
const { pool } = require("../config/db.config");
const { verifyToken } = require("../middleware/auth.middleware");

// Get all available rooms
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM rooms WHERE status = 'available' ORDER BY room_number"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ message: "Error fetching rooms" });
  }
});

// Get available rooms
router.get("/available", async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;

    const [rooms] = await pool.execute(
      `
      SELECT r.* FROM rooms r
      WHERE r.status = 'available'
      AND r.id NOT IN (
        SELECT room_id FROM bookings
        WHERE (check_in_date <= ? AND check_out_date >= ?)
        OR (check_in_date <= ? AND check_out_date >= ?)
        OR (check_in_date >= ? AND check_out_date <= ?)
      )
    `,
      [checkOut, checkIn, checkIn, checkIn, checkIn, checkOut]
    );

    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching available rooms" });
  }
});

// Get room by ID (only if available)
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM rooms WHERE id = ? AND status = 'available'",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Room not found or not available" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ message: "Error fetching room" });
  }
});

// Update room status
router.put("/:id/status", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const roomId = req.params.id;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if room exists
      const [room] = await connection.execute(
        "SELECT * FROM rooms WHERE id = ?",
        [roomId]
      );

      if (room.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "Room not found" });
      }

      // Update room status
      await connection.execute("UPDATE rooms SET status = ? WHERE id = ?", [
        status,
        roomId,
      ]);

      await connection.commit();
      res.json({ message: "Room status updated successfully" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating room status" });
  }
});

// Create room (admin only)
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      room_number,
      room_type,
      capacity,
      price_per_night,
      description,
      image_url,
    } = req.body;

    // Validate required fields
    if (!room_number || !room_type || !capacity || !price_per_night) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if room number already exists
    const [existing] = await pool.execute(
      "SELECT id FROM rooms WHERE room_number = ?",
      [room_number]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Room number already exists" });
    }

    // Insert new room
    const [result] = await pool.execute(
      "INSERT INTO rooms (room_number, room_type, capacity, price_per_night, description, image_url, status) VALUES (?, ?, ?, ?, ?, ?, 'available')",
      [
        room_number,
        room_type,
        capacity,
        price_per_night,
        description,
        image_url,
      ]
    );

    res.status(201).json({
      id: result.insertId,
      room_number,
      room_type,
      capacity,
      price_per_night,
      description,
      image_url,
      status: "available",
    });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Error creating room" });
  }
});

// Update room (admin only)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const {
      room_number,
      room_type,
      capacity,
      price_per_night,
      description,
      image_url,
    } = req.body;
    const roomId = req.params.id;

    // Validate required fields
    if (!room_number || !room_type || !capacity || !price_per_night) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if room number already exists for other rooms
    const [existing] = await pool.execute(
      "SELECT id FROM rooms WHERE room_number = ? AND id != ?",
      [room_number, roomId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Room number already exists" });
    }

    // Update room
    const [result] = await pool.execute(
      "UPDATE rooms SET room_number = ?, room_type = ?, capacity = ?, price_per_night = ?, description = ?, image_url = ? WHERE id = ?",
      [
        room_number,
        room_type,
        capacity,
        price_per_night,
        description,
        image_url,
        roomId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({
      id: roomId,
      room_number,
      room_type,
      capacity,
      price_per_night,
      description,
      image_url,
    });
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ message: "Error updating room" });
  }
});

// Delete room (admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const [result] = await pool.execute("DELETE FROM rooms WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ message: "Error deleting room" });
  }
});

module.exports = router;
