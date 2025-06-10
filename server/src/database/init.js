const mysql = require("mysql2/promise");
const fs = require("fs").promises;
const path = require("path");

async function initializeDatabase() {
  let connection;

  try {
    // Create connection without database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      port: process.env.DB_PORT || 4438,
    });

    console.log("Connected to MySQL server");

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = await fs.readFile(schemaPath, "utf8");

    // Split the schema into individual statements
    const statements = schema
      .split(";")
      .filter((statement) => statement.trim())
      .map((statement) => statement + ";");

    // Execute each statement
    for (const statement of statements) {
      await connection.query(statement);
      console.log("Executed:", statement.split("\n")[0]);
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if this file is executed directly
if (require.main === module) {
  require("dotenv").config();
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = initializeDatabase;
