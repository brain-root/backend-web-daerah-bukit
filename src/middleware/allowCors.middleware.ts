import { Request, Response, NextFunction } from "express";

/**
 * Middleware to handle CORS (Cross-Origin Resource Sharing)
 */
export const allowCors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Allow requests from any origin during development
  res.header("Access-Control-Allow-Origin", "*");

  // Allow specific headers
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Allow specific methods
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );

  // Allow credentials
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
};
