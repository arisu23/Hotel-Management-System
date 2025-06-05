const express = require("express");
const router = express.Router();
const pool = require("../config/db.config");
const {
  verifyToken,
  isAdmin,
  isReceptionist,
} = require("../middleware/auth.middleware");

// Get all rooms
router.get("/", async (req, res) => {
  try {
    const [rooms] = await pool.execute("SELECT * FROM rooms");
    res.json(rooms);
  } catch (error) {
    console.error(error);
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

// Get room by ID
router.get("/:id", async (req, res) => {
  try {
    const [rooms] = await pool.execute("SELECT * FROM rooms WHERE id = ?", [
      req.params.id,
    ]);

    if (rooms.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(rooms[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching room" });
  }
});

// Create new room (admin only)
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { roomNumber, roomType, pricePerNight, capacity, description } =
      req.body;

    const [result] = await pool.execute(
      "INSERT INTO rooms (room_number, room_type, price_per_night, capacity, description) VALUES (?, ?, ?, ?, ?)",
      [roomNumber, roomType, pricePerNight, capacity, description]
    );

    res
      .status(201)
      .json({ message: "Room created successfully", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating room" });
  }
});

// Update room (admin only)
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const {
      roomNumber,
      roomType,
      pricePerNight,
      capacity,
      description,
      status,
    } = req.body;

    const [result] = await pool.execute(
      "UPDATE rooms SET room_number = ?, room_type = ?, price_per_night = ?, capacity = ?, description = ?, status = ? WHERE id = ?",
      [
        roomNumber,
        roomType,
        pricePerNight,
        capacity,
        description,
        status,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({ message: "Room updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating room" });
  }
});

// Delete room (admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const [result] = await pool.execute("DELETE FROM rooms WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting room" });
  }
});

module.exports = router;
