import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import env from "../config/env";
import { userModel } from "../models/userModel";

/**
 * Define TokenPayload interface for JWT payload
 */
export interface TokenPayload {
  id: string;
  email?: string;
  fullName?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

// Generate JWT token
const generateToken = (
  payload: object,
  expiresIn: string = env.JWT_EXPIRES_IN
): string => {
  const options: SignOptions = {
    // Use type assertion to any to bypass TypeScript's type checking
    expiresIn: expiresIn as any,
  };
  return jwt.sign(payload, String(env.JWT_SECRET), options);
};

// Generate refresh token
const generateRefreshToken = (payload: object): string => {
  const options: SignOptions = {
    // Use type assertion to any to bypass TypeScript's type checking
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  };
  return jwt.sign(payload, String(env.JWT_SECRET), options);
};

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userId = uuidv4();
    const user = {
      id: userId,
      email,
      password: hashedPassword,
      fullName,
      role: "user",
    };

    await userModel.create(user);

    // Generate tokens
    const tokenPayload = {
      id: userId,
      email,
      fullName,
      role: user.role,
    };
    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken({ id: userId });

    // Return user info and tokens
    res.status(201).json({
      user: {
        id: userId,
        email,
        fullName,
        role: user.role,
        createdAt: new Date().toISOString(),
      },
      token,
      refreshToken,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await userModel.findByEmail(email);

    // If user not found or password doesn't match
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Ensure role is always a string and lowercase for consistency
    const userRole = (user.role || "user").toLowerCase();

    // Generate tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: userRole, // Use normalized role
    };

    console.log(
      "[Auth Debug] Login - Creating token with payload:",
      JSON.stringify(tokenPayload)
    );

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Return user data and tokens
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: userRole,
        createdAt: user.created_at,
      },
      token,
      refreshToken,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};

/**
 * Get current user profile
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // User is attached by the authentication middleware
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    // Get user from database
    const user = await userModel.findById(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        createdAt: user.created_at,
      },
    });
  } catch (error: any) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Server error while fetching user profile" });
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token is required" });
      return;
    }

    // Verify refresh token
    try {
      const decoded = jwt.verify(
        refreshToken,
        String(env.JWT_SECRET)
      ) as TokenPayload;

      // Check if user still exists
      const user = await userModel.findById(decoded.id);

      if (!user) {
        res.status(401).json({ error: "User no longer exists" });
        return;
      }

      // Generate new access token
      const newToken = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.json({
        token: newToken,
      });
    } catch (error) {
      res.status(401).json({ error: "Invalid or expired refresh token" });
    }
  } catch (error: any) {
    console.error("Refresh token error:", error);
    res.status(500).json({ error: "Server error while refreshing token" });
  }
};

/**
 * Logout user
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const userId = (req as any).user?.id;

    // If a refresh token is provided, invalidate it
    if (refreshToken && userId) {
      // For enhanced security: Remove the refresh token from database
      // await RefreshTokenModel.invalidateToken(userId, refreshToken);
    }

    // Since JWT tokens are stateless, actual "invalidation" happens client-side
    res.json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Server error during logout" });
  }
};

/**
 * Forgot password - send password reset email
 * Note: In a production app, this would send an actual email
 */
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    // Check if user exists
    const user = await userModel.findByEmail(email);

    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      res.json({
        message:
          "If your email is registered, you will receive a password reset link shortly",
      });
      return;
    }

    // Generate reset token (in production, would be used in an email link)
    const resetToken = generateToken(
      { id: user.id, email: user.email, role: user.role },
      "1h"
    );

    // In production: Send email with reset link
    // await sendResetEmail(email, resetToken);

    // For demo, return the token directly
    res.json({
      message:
        "If your email is registered, you will receive a password reset link shortly",
      // In production, don't return this - for demo purposes only
      resetToken,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({ error: "Server error during password reset request" });
  }
};

/**
 * Reset password using token
 */
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ error: "Token and new password are required" });
      return;
    }

    try {
      // Verify reset token
      const decoded = jwt.verify(token, String(env.JWT_SECRET)) as TokenPayload;

      // Update user password
      const updated = await userModel.update(decoded.id, { password });

      if (!updated) {
        res.status(400).json({ error: "Password reset failed" });
        return;
      }

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      res.status(400).json({ error: "Invalid or expired token" });
    }
  } catch (error: any) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error during password reset" });
  }
};
