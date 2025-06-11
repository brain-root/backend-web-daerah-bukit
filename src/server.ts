import express, { Request, Response, NextFunction, Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// Import database
import { testConnection } from "./config/db";
// Import database initialization
import { initializeTables } from "./database/init";

// Import routes
import authRoutes from "./routes/authRoutes";
import tourismRoutes from "./routes/tourismRoutes";
import businessRoutes from "./routes/businessRoutes";
import eventRoutes from "./routes/eventRoutes";
import forumRoutes from "./routes/forumRoutes";
import userRoutes from "./routes/userRoutes";

// Import middleware
import { allowCors } from "./middleware/allowCors.middleware";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware";

// Initialize dotenv config
dotenv.config();

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 3000;

// Test database connection and initialize tables
testConnection()
  .then(async () => {
    try {
      // Initialize all required tables
      await initializeTables();
      console.log("Database tables initialized successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });

// Configure middleware
// Apply our custom CORS middleware first
app.use(allowCors);
// Then apply the regular cors middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Simple logger middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Set up routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tourism", tourismRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/forum", forumRoutes); // Add forum routes

// Base route
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to Bukittinggi API" });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
