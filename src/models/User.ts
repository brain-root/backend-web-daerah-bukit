import { pool } from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export interface User extends RowDataPacket {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role: "admin" | "user";
  created_at: Date;
  updated_at: Date;
}

export interface UserCreationData {
  email: string;
  password: string;
  full_name: string;
  role?: "admin" | "user";
}

export interface UserUpdateData {
  email?: string;
  password?: string;
  full_name?: string;
  role?: "admin" | "user";
}

export default class UserModel {
  /**
   * Create a new user
   */
  static async create(userData: UserCreationData): Promise<string> {
    const { email, password, full_name, role = "user" } = userData;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate UUID
    const id = uuidv4();

    const query = `
      INSERT INTO users (id, email, password, full_name, role)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      id,
      email,
      hashedPassword,
      full_name,
      role,
    ]);

    if (result.affectedRows === 0) {
      throw new Error("Failed to create user");
    }

    return id;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, full_name, role, created_at, updated_at
      FROM users
      WHERE id = ?
    `;

    const [rows] = await pool.execute<User[]>(query, [id]);

    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Find user by email - includes password for authentication
   */
  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, password, full_name, role, created_at, updated_at
      FROM users
      WHERE email = ?
    `;

    const [rows] = await pool.execute<User[]>(query, [email]);

    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Update user by ID
   */
  static async update(id: string, userData: UserUpdateData): Promise<boolean> {
    const { email, password, full_name, role } = userData;

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    if (email !== undefined) {
      updates.push("email = ?");
      values.push(email);
    }

    if (password !== undefined) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      updates.push("password = ?");
      values.push(hashedPassword);
    }

    if (full_name !== undefined) {
      updates.push("full_name = ?");
      values.push(full_name);
    }

    if (role !== undefined) {
      updates.push("role = ?");
      values.push(role);
    }

    if (updates.length === 0) {
      return false; // Nothing to update
    }

    const query = `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = ?
    `;

    values.push(id);

    const [result] = await pool.execute<ResultSetHeader>(query, values);

    return result.affectedRows > 0;
  }

  /**
   * Delete user by ID
   */
  static async delete(id: string): Promise<boolean> {
    const query = `
      DELETE FROM users
      WHERE id = ?
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [id]);

    return result.affectedRows > 0;
  }

  /**
   * Find all users with pagination
   */
  static async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    users: Omit<User, "password">[];
    totalCount: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    const countQuery = "SELECT COUNT(*) as total FROM users";

    const query = `
      SELECT id, email, full_name, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [countResult, usersResult] = await Promise.all([
      pool.execute<(RowDataPacket & { total: number })[]>(countQuery),
      pool.execute<User[]>(query, [limit, offset]),
    ]);

    const totalCount = countResult[0][0].total;
    const rows = usersResult[0];
    const totalPages = Math.ceil(totalCount / limit);

    return {
      users: rows,
      totalCount,
      totalPages,
    };
  }

  /**
   * Check if an email already exists
   */
  static async emailExists(
    email: string,
    excludeId?: string
  ): Promise<boolean> {
    let query = "SELECT COUNT(*) as count FROM users WHERE email = ?";
    let params = [email];

    // Exclude current user when checking for email duplicates during update
    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }

    const [rows] = await pool.execute<(RowDataPacket & { count: number })[]>(
      query,
      params
    );

    return rows[0].count > 0;
  }
}
