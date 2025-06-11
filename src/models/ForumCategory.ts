import { pool } from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export interface ForumCategory extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface ForumCategoryWithCount extends ForumCategory {
  thread_count: number;
}

export interface ForumCategoryInput {
  name: string;
  description: string;
}

export default class ForumCategoryModel {
  /**
   * Find all forum categories
   */
  static async findAll(): Promise<ForumCategory[]> {
    const query = `
      SELECT * FROM forum_categories
      ORDER BY name ASC
    `;

    const [rows] = await pool.query<ForumCategory[]>(query);
    return rows;
  }

  /**
   * Get categories with thread count
   */
  static async getCategoriesWithThreadCount(): Promise<
    ForumCategoryWithCount[]
  > {
    const query = `
      SELECT c.*,
        COUNT(t.id) AS thread_count
      FROM forum_categories c
      LEFT JOIN forum_threads t ON c.id = t.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `;

    const [rows] = await pool.query<ForumCategoryWithCount[]>(query);
    return rows;
  }

  /**
   * Find category by ID
   */
  static async findById(id: number): Promise<ForumCategory | null> {
    const query = `
      SELECT * FROM forum_categories
      WHERE id = ?
    `;

    const [rows] = await pool.query<ForumCategory[]>(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Create a new forum category
   */
  static async create(data: ForumCategoryInput): Promise<number> {
    const { name, description } = data;

    const query = `
      INSERT INTO forum_categories (name, description)
      VALUES (?, ?)
    `;

    const [result] = await pool.query<ResultSetHeader>(query, [
      name,
      description,
    ]);
    return result.insertId;
  }

  /**
   * Update a forum category
   */
  static async update(
    id: number,
    data: Partial<ForumCategoryInput>
  ): Promise<boolean> {
    const { name, description } = data;

    // Build update query dynamically based on provided fields
    const updateFields = [];
    const values = [];

    if (name !== undefined) {
      updateFields.push("name = ?");
      values.push(name);
    }

    if (description !== undefined) {
      updateFields.push("description = ?");
      values.push(description);
    }

    // If no fields to update, return false
    if (updateFields.length === 0) {
      return false;
    }

    const query = `
      UPDATE forum_categories
      SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    values.push(id);
    const [result] = await pool.query<ResultSetHeader>(query, values);
    return result.affectedRows > 0;
  }

  /**
   * Delete a forum category
   */
  static async delete(id: number): Promise<boolean> {
    // Check if category has threads
    const checkQuery = `
      SELECT COUNT(*) as thread_count
      FROM forum_threads
      WHERE category_id = ?
    `;

    const [checkResult] = await pool.query<
      (RowDataPacket & { thread_count: number })[]
    >(checkQuery, [id]);

    // Don't allow deletion if category has threads
    if (checkResult[0].thread_count > 0) {
      throw new Error("Cannot delete category with existing threads");
    }

    const query = `
      DELETE FROM forum_categories
      WHERE id = ?
    `;

    const [result] = await pool.query<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  }
}
