import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "webdaerah",
  waitForConnections: true,
  connectionLimit: process.env.NODE_ENV === "production" ? 5 : 10, // Lower limit for production
  queueLimit: 0,
  namedPlaceholders: true,
  connectTimeout: 60000, // Longer timeout for cloud deployments
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    console.log("Database connection established successfully.");
    connection.release();
  } catch (error) {
    console.error("Error connecting to database:", error);
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  }
};

// Export pool and connection test function
export { pool, testConnection };
