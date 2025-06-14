const express = require("express");
const mysql2 = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const dotenv = require("dotenv");
const { pool, testConnection } = require("./config/db.config");
const initializeDatabase = require("./database/init");
const authRoutes = require("./routes/auth.routes");
const roomRoutes = require("./routes/room.routes");
const bookingRoutes = require("./routes/booking.routes");
const userRoutes = require("./routes/user.routes");
const paymentRoutes = require("./routes/payment.routes");
const reportsRouter = require("./routes/reports");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Test database connection
testConnection();

// Define routes
const router = express.Router();

// Check-in endpoint
router.post("/bookings/:bookingId/check-in", async (req, res) => {
  console.log("Check-in endpoint hit:", req.params);
  const { bookingId } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // First verify the booking exists and is in the correct state
    const [booking] = await connection.query(
      "SELECT * FROM bookings WHERE id = ? AND status = 'success' AND payment_status = 'paid'",
      [bookingId]
    );

    if (booking.length === 0) {
      throw new Error("Booking not found or not in correct state for check-in");
    }

    // Update booking status to checked_in
    await connection.query(
      "UPDATE bookings SET status = 'checked_in' WHERE id = ?",
      [bookingId]
    );

    // Update room status to occupied
    await connection.query(
      "UPDATE rooms SET status = 'occupied' WHERE id = ?",
      [booking[0].room_id]
    );

    await connection.commit();
    res.json({
      message: "Check-in successful",
      booking: {
        ...booking[0],
        status: "checked_in",
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Check-in error:", error);
    res.status(500).json({
      message: error.message || "Failed to process check-in",
    });
  } finally {
    connection.release();
  }
});

// Check-out endpoint
router.post("/bookings/:bookingId/check-out", async (req, res) => {
  console.log("Check-out endpoint hit:", req.params);
  const { bookingId } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // First verify the booking exists and is in the correct state
    const [booking] = await connection.query(
      "SELECT * FROM bookings WHERE id = ? AND status = 'checked_in'",
      [bookingId]
    );

    if (booking.length === 0) {
      throw new Error(
        "Booking not found or not in correct state for check-out"
      );
    }

    // Update booking status to checked_out
    await connection.query(
      "UPDATE bookings SET status = 'checked_out' WHERE id = ?",
      [bookingId]
    );

    // Update room status to available
    await connection.query(
      "UPDATE rooms SET status = 'available' WHERE id = ?",
      [booking[0].room_id]
    );

    await connection.commit();
    res.json({
      message: "Check-out successful",
      booking: {
        ...booking[0],
        status: "checked_out",
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Check-out error:", error);
    res.status(500).json({
      message: error.message || "Failed to process check-out",
    });
  } finally {
    connection.release();
  }
});

// Mount the router
app.use("/api", router);

// Initialize database and test connection
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    console.log("Database initialized");

    // Test connection
    await testConnection();
    console.log("Database connection tested");

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log("Available endpoints:");
      console.log("- POST /api/bookings/:bookingId/check-in");
      console.log("- POST /api/bookings/:bookingId/check-out");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key",
    (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
      req.user = user;
      next();
    }
  );
};

// Routes
app.post("/api/register", async (req, res) => {
  try {
    console.log("Registration request received:", req.body);
    const { username, email, password, role, firstName, lastName, phone } =
      req.body;

    // Validate required fields
    if (!username || !email || !password || !role) {
      console.log("Missing required fields:", { username, email, role });
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert into useraccounts_tbl
      const [userResult] = await connection.query(
        "INSERT INTO useraccounts_tbl (username, password, role) VALUES (?, ?, ?)",
        [username, hashedPassword, role]
      );

      const userId = userResult.insertId;

      // Insert into appropriate table based on role
      if (role === "guest") {
        await connection.query(
          "INSERT INTO guest_tbl (user_id, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)",
          [userId, firstName, lastName, email, phone]
        );
      } else if (role === "receptionist") {
        await connection.query(
          "INSERT INTO employee_tbl (user_id, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)",
          [userId, firstName, lastName, email, phone]
        );
      }

      await connection.commit();
      console.log("User registered successfully");
      res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Error registering user",
      error: error.message,
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Get user from database
    const [users] = await pool.query(
      "SELECT * FROM useraccounts_tbl WHERE username = ?",
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Get additional user info based on role
    let userInfo = {};
    if (user.role === "guest") {
      const [guestInfo] = await pool.query(
        "SELECT * FROM guest_tbl WHERE user_id = ?",
        [user.id]
      );
      if (guestInfo.length > 0) {
        userInfo = guestInfo[0];
      }
    } else if (user.role === "receptionist") {
      const [employeeInfo] = await pool.query(
        "SELECT * FROM employee_tbl WHERE user_id = ?",
        [user.id]
      );
      if (employeeInfo.length > 0) {
        userInfo = employeeInfo[0];
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      ...userInfo,
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
});

// User Management Routes
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT u.id, u.username, u.role, u.created_at, " +
        "COALESCE(g.first_name, e.first_name) as first_name, " +
        "COALESCE(g.last_name, e.last_name) as last_name, " +
        "COALESCE(g.email, e.email) as email, " +
        "COALESCE(g.phone, e.phone) as phone " +
        "FROM useraccounts_tbl u " +
        "LEFT JOIN guest_tbl g ON u.id = g.user_id " +
        "LEFT JOIN employee_tbl e ON u.id = e.user_id"
    );
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
});

app.put("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, firstName, lastName, phone } = req.body;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update useraccounts_tbl
      await connection.query(
        "UPDATE useraccounts_tbl SET username = ?, role = ? WHERE id = ?",
        [username, role, id]
      );

      // Update role-specific table
      if (role === "guest") {
        await connection.query(
          "UPDATE guest_tbl SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE user_id = ?",
          [firstName, lastName, email, phone, id]
        );
      } else if (role === "receptionist") {
        await connection.query(
          "UPDATE employee_tbl SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE user_id = ?",
          [firstName, lastName, email, phone, id]
        );
      }

      await connection.commit();
      res.json({ message: "User updated successfully" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Update user error:", error);
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
});

app.delete("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete from role-specific table first
      await connection.query("DELETE FROM guest_tbl WHERE user_id = ?", [id]);
      await connection.query("DELETE FROM employee_tbl WHERE user_id = ?", [
        id,
      ]);

      // Then delete from useraccounts_tbl
      await connection.query("DELETE FROM useraccounts_tbl WHERE id = ?", [id]);

      await connection.commit();
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Delete user error:", error);
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
});

// Room Management Routes
app.use("/api/rooms", roomRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportsRouter);

// Payment endpoint
app.post("/api/payments", async (req, res) => {
  const { booking_id, amount, payment_method, transaction_id } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Create payment record
    const [result] = await connection.query(
      "INSERT INTO payments (booking_id, amount, payment_method, transaction_id, status) VALUES (?, ?, ?, ?, 'paid')",
      [booking_id, amount, payment_method, transaction_id]
    );

    // Update booking payment status
    await connection.query(
      "UPDATE bookings SET payment_status = 'paid' WHERE id = ?",
      [booking_id]
    );

    await connection.commit();
    res.json({
      message: "Payment processed successfully",
      paymentId: result.insertId,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Payment error:", error);
    res.status(500).json({ message: "Failed to process payment" });
  } finally {
    connection.release();
  }
});

// Get all bookings with guest information
app.get("/api/bookings", async (req, res) => {
  try {
    const [bookings] = await pool.query(`
      SELECT 
        b.*,
        r.room_number,
        CONCAT(g.first_name, ' ', g.last_name) as guest_name,
        g.email as guest_email,
        g.phone as guest_phone,
        u.username
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN useraccounts_tbl u ON b.user_id = u.id
      LEFT JOIN guest_tbl g ON u.id = g.user_id
      ORDER BY b.created_at DESC
    `);
    console.log("Bookings query result:", bookings); // Debug log
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});
