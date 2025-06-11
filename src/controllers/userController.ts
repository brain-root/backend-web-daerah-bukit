import { Request, Response } from "express";
import bcrypt from "bcrypt";

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    const userRole = (req as any).user?.role;
    if (userRole !== "admin") {
      res.status(403).json({ error: "Not authorized to access this resource" });
      return;
    }

    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Query database for users (placeholder)
    // const users = await db.query...

    // For demo purposes
    const users = [
      {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "user1@example.com",
        fullName: "User One",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "223e4567-e89b-12d3-a456-426614174001",
        email: "user2@example.com",
        fullName: "User Two",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Get total count for pagination (placeholder)
    // const totalCount = await db.query...
    const totalCount = 2;
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      message: "Users retrieved successfully",
      data: users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    });
  } catch (error: any) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

/**
 * Get user profile (current user)
 */
export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    // Query database for user (placeholder)
    // const user = await db.query...

    // For demo purposes
    const user = {
      id: userId,
      email: "current@example.com",
      fullName: "Current User",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      message: "User profile retrieved successfully",
      data: user,
    });
  } catch (error: any) {
    console.error("Get user profile error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

/**
 * Get a specific user by ID (admin only)
 */
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    const userRole = (req as any).user?.role;
    if (userRole !== "admin") {
      res.status(403).json({ error: "Not authorized to access this resource" });
      return;
    }

    const { id } = req.params;

    // Query database for user (placeholder)
    // const user = await db.query...

    // For demo purposes
    const user = {
      id,
      email: "user@example.com",
      fullName: "Example User",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error: any) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

/**
 * Update user profile (current user)
 */
export const updateUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { fullName, email, currentPassword, newPassword } = req.body;

    // Query database for user (placeholder)
    // const user = await db.query...

    // For demo purposes
    const user = {
      id: userId,
      email: "current@example.com",
      password: "$2b$10$X/NeZsnngN0rSqi7Cnxuyehfklls7xSjPBEWrsgvnMsW0E9I0bVoS", // "password123"
      fullName: "Current User",
      role: "user",
    };

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Handle password change if requested
    if (currentPassword && newPassword) {
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        res.status(400).json({ error: "Current password is incorrect" });
        return;
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password in database (placeholder)
      // await db.query...
    }

    // Check if email is being changed and is not already taken
    if (email && email !== user.email) {
      // Check if email already exists (placeholder)
      // const existingUser = await db.query...
      // If email exists, return error
      // if (existingUser) {
      //   res.status(400).json({ error: 'Email already in use' });
      //   return;
      // }
    }

    // Update user in database (placeholder)
    // const result = await db.query...

    // For demo purposes
    const updatedUser = {
      ...user,
      fullName: fullName || user.fullName,
      email: email || user.email,
      // password is updated separately if needed
      updatedAt: new Date(),
    };

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      message: "User profile updated successfully",
      data: userWithoutPassword,
    });
  } catch (error: any) {
    console.error("Update user profile error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

/**
 * Update a user (admin only)
 */
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    const userRole = (req as any).user?.role;
    if (userRole !== "admin") {
      res.status(403).json({ error: "Not authorized to access this resource" });
      return;
    }

    const { id } = req.params;
    const { fullName, email, role, active } = req.body;

    // Query database for user (placeholder)
    // const user = await db.query...

    // For demo purposes
    const user = {
      id,
      email: "user@example.com",
      fullName: "Example User",
      role: "user",
      active: true,
    };

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Check if email is being changed and is not already taken
    if (email && email !== user.email) {
      // Check if email already exists (placeholder)
      // const existingUser = await db.query...
      // If email exists, return error
      // if (existingUser) {
      //   res.status(400).json({ error: 'Email already in use' });
      //   return;
      // }
    }

    // Update user in database (placeholder)
    // const result = await db.query...

    // For demo purposes
    const updatedUser = {
      ...user,
      fullName: fullName || user.fullName,
      email: email || user.email,
      role: role || user.role,
      active: active !== undefined ? active : user.active,
      updatedAt: new Date(),
    };

    res.json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

/**
 * Delete a user (admin only)
 */
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    const userRole = (req as any).user?.role;
    if (userRole !== "admin") {
      res.status(403).json({ error: "Not authorized to access this resource" });
      return;
    }

    const { id } = req.params;
    const currentUserId = (req as any).user?.id;

    // Prevent deleting yourself
    if (id === currentUserId) {
      res.status(400).json({ error: "You cannot delete your own account" });
      return;
    }

    // Check if user exists (placeholder)
    // const existingUser = await db.query...

    // For demo purposes
    const existingUser = {
      id,
      email: "user@example.com",
    };

    if (!existingUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Delete user from database (placeholder)
    // await db.query...

    res.json({
      message: "User deleted successfully",
      data: { id },
    });
  } catch (error: any) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};
