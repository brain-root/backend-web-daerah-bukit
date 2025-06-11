import express, { Request, Response } from "express";
import { pool } from "../config/db";

const router = express.Router();

// Debug endpoint to check environment
router.get("/environment", (req: Request, res: Response) => {
  res.json({
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });
});

// Debug endpoint to test database connection
router.get("/database", async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    await connection.query("SELECT 1 as test");
    connection.release();
    res.json({ status: "Database connection successful" });
  } catch (error: any) {
    res.status(500).json({
      error: "Database connection failed",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

export default router;
