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
// Import the debug routes
import debugRoutes from "./routes/debugRoutes";

// Import middleware
import { allowCors } from "./middleware/allowCors.middleware";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware";

// Initialize dotenv config
dotenv.config();

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 3000;

// Configure middleware
// Apply our custom CORS middleware first
app.use(allowCors);
// Then apply the regular cors middleware with more permissive settings for Vercel
app.use(
  cors({
    origin: "*", // More permissive for debugging - change to specific origins later
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Special handling for uploads directory in serverless environment
if (process.env.NODE_ENV === "production") {
  // In production/Vercel, we don't really use the local filesystem for uploads
  // Instead, you would typically use S3 or another storage service
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
} else {
  // For local development
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
}

// Simple logger middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Test database connection only (without initialization in production)
// This prevents potential issues with serverless cold starts
if (process.env.NODE_ENV !== "test") {
  testConnection().catch((err) => {
    console.error("Database connection failed:", err);
  });
}

// Set up routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tourism", tourismRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/debug", debugRoutes); // Add debug routes

// Base route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Welcome to Solok Selatan API",
    environment: process.env.NODE_ENV,
    endpoints: {
      tourism: "/api/tourism",
      business: "/api/business",
      events: "/api/event",
      forum: "/api/forum",
      auth: "/api/auth",
    },
  });
});

// Health check endpoint for Vercel
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server in non-Vercel environments
if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
