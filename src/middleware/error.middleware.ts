import { Request, Response, NextFunction } from "express";
import multer from "multer";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/**
 * Not found error middleware
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new ApiError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  console.error(err.stack || err);

  // Handle specific error types
  if (err instanceof ApiError) {
    res.status(err.status).json({
      error: {
        message: err.message,
        status: err.status,
      },
    });
    return;
  }

  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    let message = "File upload error";
    let status = 400;

    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        message = "File too large: Maximum size is 5MB";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "Unexpected file field";
        break;
      default:
        message = err.message;
    }

    res.status(status).json({
      error: {
        message,
        status,
      },
    });
    return;
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      error: {
        message: "Invalid JSON",
        status: 400,
      },
    });
    return;
  }

  // Default to 500 server error
  const statusCode = err.status || 500;
  const message = statusCode === 500 ? "Internal Server Error" : err.message;

  res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
    },
  });
};
