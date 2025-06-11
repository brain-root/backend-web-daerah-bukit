import { Request, Response, NextFunction } from "express";

/**
 * Middleware to handle CORS (Cross-Origin Resource Sharing)
 */
export const allowCors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Get allowed origin from environment variable or use a default
  const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.CORS_ORIGIN,
  ].filter(Boolean);

  // Extract the origin from the request
  const origin = req.headers.origin;

  // Set CORS headers if origin matches allowed origins or allow all during development
  if (
    origin &&
    (process.env.NODE_ENV === "development" || allowedOrigins.includes(origin))
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");

    console.log(
      `[CORS] Allowed origin: ${origin} for ${req.method} ${req.path}`
    );
  }

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Continue to the next middleware
  next();
};
