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

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});
