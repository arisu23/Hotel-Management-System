const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../config/db.config");
const { verifyToken, isAdmin } = require("../middleware/auth.middleware");

// Get all users (admin only)
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, username, email, role, first_name, last_name, phone, created_at FROM users"
    );
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Create receptionist account (admin only)
router.post("/receptionist", verifyToken, isAdmin, async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert receptionist into database
    const [result] = await pool.execute(
      "INSERT INTO users (username, email, password, role, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        username,
        email,
        hashedPassword,
        "receptionist",
        firstName,
        lastName,
        phone,
      ]
    );

    res.status(201).json({
      message: "Receptionist account created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating receptionist account" });
  }
});

// Update user (admin only)
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { username, email, firstName, lastName, phone, role } = req.body;

    const [result] = await pool.execute(
      "UPDATE users SET username = ?, email = ?, first_name = ?, last_name = ?, phone = ?, role = ? WHERE id = ?",
      [username, email, firstName, lastName, phone, role, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user" });
  }
});

// Delete user (admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user" });
  }
});

// Get sales report (admin only)
router.get("/sales/report", verifyToken, isAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const [report] = await pool.execute(
      `
      SELECT 
        DATE(b.created_at) as date,
        COUNT(*) as total_bookings,
        SUM(b.total_price) as total_revenue,
        COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings
      FROM bookings b
      WHERE b.created_at BETWEEN ? AND ?
      GROUP BY DATE(b.created_at)
      ORDER BY date DESC
    `,
      [startDate, endDate]
    );

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating sales report" });
  }
});

module.exports = router;
