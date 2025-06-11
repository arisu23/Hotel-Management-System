const express = require("express");
const router = express.Router();
const { pool } = require("../config/db.config");

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

// Create new room
router.post("/", async (req, res) => {
  try {
    const {
      room_number,
      room_type,
      price_per_night,
      capacity,
      description,
      image_url,
    } = req.body;

    const [result] = await pool.execute(
      "INSERT INTO rooms (room_number, room_type, price_per_night, capacity, description, image_url) VALUES (?, ?, ?, ?, ?, ?)",
      [
        room_number,
        room_type,
        price_per_night,
        capacity,
        description,
        image_url,
      ]
    );

    res
      .status(201)
      .json({ message: "Room created successfully", id: result.insertId });
  } catch (error) {
    console.error("Error creating room:", error);
    res
      .status(500)
      .json({ message: "Error creating room", error: error.message });
  }
});

// Update room
router.put("/:id", async (req, res) => {
  try {
    const {
      room_number,
      room_type,
      price_per_night,
      capacity,
      description,
      image_url,
    } = req.body;

    const [result] = await pool.execute(
      "UPDATE rooms SET room_number = ?, room_type = ?, price_per_night = ?, capacity = ?, description = ?, image_url = ? WHERE id = ?",
      [
        room_number,
        room_type,
        price_per_night,
        capacity,
        description,
        image_url,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({ message: "Room updated successfully" });
  } catch (error) {
    console.error("Error updating room:", error);
    res
      .status(500)
      .json({ message: "Error updating room", error: error.message });
  }
});

// Delete room
router.delete("/:id", async (req, res) => {
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
    res
      .status(500)
      .json({ message: "Error deleting room", error: error.message });
  }
});

module.exports = router;
