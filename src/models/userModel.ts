import { pool } from "../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import bcrypt from "bcrypt";

export interface User {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role: "admin" | "user";
  created_at: Date;
  updated_at: Date;
}

export const userModel = {
  // Find a user by email
  async findByEmail(email: string): Promise<User | null> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM users WHERE email = ?`,
        [email]
      );

      if (rows.length === 0) {
        return null;
      }

      return rows[0] as User;
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  },

  // Find user by ID
  async findById(id: string): Promise<User | null> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM users WHERE id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      return rows[0] as User;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  },

  // Create a new user
  async create(user: {
    id: string;
    email: string;
    password: string;
    fullName: string;
    role: string;
  }): Promise<void> {
    try {
      await pool.query<ResultSetHeader>(
        `INSERT INTO users (id, email, password, full_name, role) 
         VALUES (?, ?, ?, ?, ?)`,
        [user.id, user.email, user.password, user.fullName, user.role]
      );
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  // Update user
  async update(
    id: string,
    updates: {
      email?: string;
      password?: string;
      fullName?: string;
      role?: string;
    }
  ): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.email) {
        fields.push("email = ?");
        values.push(updates.email);
      }

      if (updates.fullName) {
        fields.push("full_name = ?");
        values.push(updates.fullName);
      }

      if (updates.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(updates.password, salt);
        fields.push("password = ?");
        values.push(hashedPassword);
      }

      if (updates.role) {
        fields.push("role = ?");
        values.push(updates.role);
      }

      if (fields.length === 0) {
        return false;
      }

      values.push(id);

      const [result] = await pool.query<ResultSetHeader>(
        `UPDATE users 
         SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  // Delete user
  async delete(id: string): Promise<boolean> {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        `DELETE FROM users WHERE id = ?`,
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
};
