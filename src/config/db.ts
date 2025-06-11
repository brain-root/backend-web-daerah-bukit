import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "aws-mysql.cnoiawuws42w.ap-southeast-1.rds.amazonaws.com",
  port: parseInt(process.env.DB_PORT || "3306", 10), 
  user: process.env.DB_USER || "adminrian001",
  password: process.env.DB_PASSWORD || "MySQLamazonadminrian001",
  database: process.env.DB_NAME || "solok_selatan_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
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
    process.exit(1);
  }
};

// Export pool and connection test function
export { pool, testConnection };
