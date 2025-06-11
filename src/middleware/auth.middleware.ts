import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";

/**
 * Interface for JWT payload
 */
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    console.log(`[Auth Debug] Request to ${req.method} ${req.path}`);
    console.log(
      `[Auth Debug] Auth header: ${
        authHeader ? `Bearer ${authHeader.substring(7, 17)}...` : "missing"
      }`
    );

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[Auth Debug] No bearer token provided");
      res
        .status(401)
        .json({ error: "Authentication required. No token provided." });
      return;
    }

    // Extract the token
    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("[Auth Debug] Token is empty");
      res.status(401).json({ error: "Token is missing or malformed" });
      return;
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      console.log(
        `[Auth Debug] Token verified successfully for user: ${decoded.id}, role: ${decoded.role}`
      );

      // Ensure role is correctly formatted - normalize to lowercase for comparison
      if (decoded.role) {
        decoded.role = decoded.role.toLowerCase();
      }

      // Attach the user data to the request object
      (req as any).user = decoded;
      console.log(
        `[Auth Debug] User attached to request:`,
        JSON.stringify((req as any).user)
      );

      next();
    } catch (jwtError: unknown) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        console.log("[Auth Debug] Token expired");
        res.status(401).json({ error: "Token expired", code: "TOKEN_EXPIRED" });
      } else {
        // Fixed: Type-check before accessing message property
        const errorMessage =
          jwtError instanceof Error ? jwtError.message : String(jwtError);
        console.log("[Auth Debug] Invalid token:", errorMessage);
        res.status(401).json({ error: "Invalid token", code: "INVALID_TOKEN" });
      }
    }
  } catch (error) {
    console.error("[Auth Debug] Authentication error:", error);
    res.status(500).json({ error: "Authentication error" });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 * Useful for routes that work for both authenticated and unauthenticated users
 */
export const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token provided, continue without user
      next();
      return;
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify the token
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Attach the user data to the request object
    (req as any).user = decoded;

    next();
  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      if (!roles.includes(user.role)) {
        res.status(403).json({ error: "Insufficient permissions" });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ error: "Authorization error" });
    }
  };
};

/**
 * Middleware specifically for admin users
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  requireRole(["admin"])(req, res, next);
};
