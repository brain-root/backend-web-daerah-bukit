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
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
};

// Create a function to get connection instead of maintaining a pool
// This is better for serverless environments
const getConnection = async () => {
  return await mysql.createConnection(dbConfig);
};

// For compatibility with existing code
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async (): Promise<void> => {
  try {
    const connection = await getConnection();
    console.log("Database connection established successfully.");
    await connection.end();
  } catch (error) {
    console.error("Error connecting to database:", error);
    // Don't exit process in production as it will terminate the serverless function
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  }
};

// Export connection functions
export { pool, getConnection, testConnection };
