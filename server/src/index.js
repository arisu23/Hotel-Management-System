const express = require("express");
const mysql2 = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.routes");
const roomRoutes = require("./routes/room.routes");
const bookingRoutes = require("./routes/booking.routes");
const userRoutes = require("./routes/user.routes");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const db = mysql2.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  port: 4438,
  database: process.env.DB_NAME || "hotel_reservation",
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to database successfully");

  // Test the users table
  db.query("SHOW TABLES LIKE 'users'", (err, results) => {
    if (err) {
      console.error("Error checking users table:", err);
      return;
    }
    if (results.length === 0) {
      console.error("Users table does not exist!");
    } else {
      console.log("Users table exists");
    }
  });
});

// Test database connection
app.get("/api/test-db", (req, res) => {
  db.query("SELECT 1", (err, results) => {
    if (err) {
      console.error("Database test error:", err);
      return res
        .status(500)
        .json({ error: "Database connection failed", details: err.message });
    }
    res.json({ message: "Database connection successful", results });
  });
});

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

    // Insert user into database
    const query =
      "INSERT INTO users (username, email, password, role, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [
      username,
      email,
      hashedPassword,
      role,
      firstName || null,
      lastName || null,
      phone || null,
    ];

    console.log("Executing query with values:", {
      ...req.body,
      password: "[HIDDEN]",
    });

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error registering user:", err);
        return res.status(500).json({
          message: "Error registering user",
          error: err.message,
          code: err.code,
        });
      }
      console.log("User registered successfully:", result);
      res.status(201).json({ message: "User registered successfully!" });
    });
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
    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], async (err, results) => {
      if (err) {
        console.error("Error finding user:", err);
        return res.status(500).json({ message: "Error logging in" });
      }

      if (results.length === 0) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      const user = results[0];

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
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
        email: user.email,
        role: user.role,
        token: token,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
});

// User Management Routes
app.get("/api/users", authenticateToken, (req, res) => {
  console.log("Fetching users...");
  const query =
    "SELECT id, username, email, role, first_name, last_name, phone, created_at FROM users";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res
        .status(500)
        .json({ message: "Error fetching users", error: err.message });
    }
    console.log("Users fetched successfully:", results.length, "users found");
    res.json(results);
  });
});

app.put("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, firstName, lastName, phone } = req.body;

    const query = `
      UPDATE users 
      SET username = ?, 
          email = ?, 
          role = ?, 
          first_name = ?, 
          last_name = ?, 
          phone = ?
      WHERE id = ?
    `;

    db.query(
      query,
      [username, email, role, firstName, lastName, phone, id],
      (err, result) => {
        if (err) {
          console.error("Error updating user:", err);
          return res
            .status(500)
            .json({ message: "Error updating user", error: err.message });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User updated successfully" });
      }
    );
  } catch (error) {
    console.error("Update user error:", error);
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
});

app.delete("/api/users/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM users WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res
        .status(500)
        .json({ message: "Error deleting user", error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  });
});

// Room Management Routes
app.get("/api/rooms", (req, res) => {
  const query = "SELECT * FROM rooms";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching rooms:", err);
      return res
        .status(500)
        .json({ message: "Error fetching rooms", error: err.message });
    }
    res.json(results);
  });
});

app.post("/api/rooms", (req, res) => {
  const {
    room_number,
    room_type,
    capacity,
    price_per_night,
    description,
    image_url,
  } = req.body;

  const query = `
    INSERT INTO rooms (room_number, room_type, capacity, price_per_night, description, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [room_number, room_type, capacity, price_per_night, description, image_url],
    (err, result) => {
      if (err) {
        console.error("Error adding room:", err);
        return res
          .status(500)
          .json({ message: "Error adding room", error: err.message });
      }
      res
        .status(201)
        .json({ message: "Room added successfully", roomId: result.insertId });
    }
  );
});

app.put("/api/rooms/:id", (req, res) => {
  const { id } = req.params;
  const {
    room_number,
    room_type,
    capacity,
    price_per_night,
    description,
    image_url,
  } = req.body;

  const query = `
    UPDATE rooms 
    SET room_number = ?, room_type = ?, capacity = ?, price_per_night = ?, description = ?, image_url = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [
      room_number,
      room_type,
      capacity,
      price_per_night,
      description,
      image_url,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating room:", err);
        return res
          .status(500)
          .json({ message: "Error updating room", error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json({ message: "Room updated successfully" });
    }
  );
});

app.delete("/api/rooms/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM rooms WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting room:", err);
      return res
        .status(500)
        .json({ message: "Error deleting room", error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.json({ message: "Room deleted successfully" });
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
