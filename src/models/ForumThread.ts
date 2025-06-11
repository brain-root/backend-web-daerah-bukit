import { pool } from "../config/db";
import { ResultSetHeader, RowDataPacket, FieldPacket } from "mysql2/promise";

export interface ForumThread extends RowDataPacket {
  id: number;
  title: string;
  content: string | null;
  user_id: string;
  category_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ForumThreadWithUser extends ForumThread {
  user_full_name: string;
  category_name: string;
  post_count: number;
}

export interface ForumThreadCreationData {
  title: string;
  content: string;
  user_id: string;
  category_id: number;
}

export interface ForumThreadUpdateData {
  title?: string;
  content?: string | null;
}

export default class ForumThreadModel {
  /**
   * Create a new forum thread
   */
  static async create(data: ForumThreadCreationData): Promise<number> {
    const { title, content, user_id, category_id } = data;

    const query = `
      INSERT INTO forum_threads (title, content, user_id, category_id)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      title,
      content,
      user_id,
      category_id,
    ]);

    if (result.affectedRows === 0) {
      throw new Error("Failed to create forum thread");
    }

    return result.insertId;
  }

  /**
   * Find thread by ID
   */
  static async findById(id: number): Promise<ForumThreadWithUser | null> {
    try {
      console.log(`[Debug] ForumThread.findById called with ID: ${id}`);

      // First check if forum_reactions table exists
      const [tablesResult] = await pool.query<RowDataPacket[]>(
        "SHOW TABLES LIKE 'forum_reactions'"
      );

      const reactionsTableExists = tablesResult.length > 0;

      // Build query based on whether reactions table exists
      let query;
      if (reactionsTableExists) {
        query = `
          SELECT t.*, 
            u.full_name AS author_name,
            c.name AS category_name,
            (SELECT COUNT(*) FROM forum_posts WHERE thread_id = t.id) AS reply_count,
            (SELECT COUNT(*) FROM forum_reactions WHERE thread_id = t.id AND reaction_type = 'like') AS like_count,
            (SELECT COUNT(*) FROM forum_reactions WHERE thread_id = t.id AND reaction_type = 'dislike') AS dislike_count
          FROM forum_threads t
          JOIN users u ON t.user_id = u.id
          LEFT JOIN forum_categories c ON t.category_id = c.id
          WHERE t.id = ?
        `;
      } else {
        // Fallback query without reactions
        query = `
          SELECT t.*, 
            u.full_name AS author_name,
            c.name AS category_name,
            (SELECT COUNT(*) FROM forum_posts WHERE thread_id = t.id) AS reply_count,
            0 AS like_count,
            0 AS dislike_count
          FROM forum_threads t
          JOIN users u ON t.user_id = u.id
          LEFT JOIN forum_categories c ON t.category_id = c.id
          WHERE t.id = ?
        `;
      }

      // Use query instead of execute for better parameter handling
      const [rows] = await pool.query<RowDataPacket[]>(query, [id]);

      console.log(
        `[Debug] ForumThread.findById result:`,
        rows.length ? `Found thread: ${rows[0].id}` : "No thread found"
      );

      return rows.length > 0 ? (rows[0] as ForumThreadWithUser) : null;
    } catch (error) {
      console.error(`[Debug] Error in ForumThread.findById(${id}):`, error);
      throw error;
    }
  }

  /**
   * Update forum thread by ID
   */
  static async update(
    id: number,
    data: ForumThreadUpdateData
  ): Promise<boolean> {
    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return false; // Nothing to update
    }

    const query = `
      UPDATE forum_threads
      SET ${updates.join(", ")}
      WHERE id = ?
    `;

    values.push(id);

    const [result] = await pool.execute<ResultSetHeader>(query, values);

    return result.affectedRows > 0;
  }

  /**
   * Delete forum thread by ID
   */
  static async delete(id: number): Promise<boolean> {
    // Note: This will cascade delete all posts in the thread due to foreign key constraints
    const query = `
      DELETE FROM forum_threads
      WHERE id = ?
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [id]);

    return result.affectedRows > 0;
  }

  /**
   * Find all threads by category with pagination
   */
  static async findByCategory(
    categoryId: number,
    options: {
      page?: number;
      limit?: number;
      sortBy?: string;
    } = {}
  ): Promise<{
    threads: ForumThreadWithUser[];
    totalCount: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, sortBy = "newest" } = options;
    const offset = (page - 1) * limit;

    // Determine the ORDER BY clause based on sortBy
    let orderBy = "t.created_at DESC";
    if (sortBy === "popular") {
      orderBy =
        "(SELECT COUNT(*) FROM forum_posts WHERE thread_id = t.id) DESC, t.created_at DESC";
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM forum_threads
      WHERE category_id = ?
    `;

    const query = `
      SELECT t.*, 
        u.full_name AS user_full_name,
        c.name AS category_name,
        (SELECT COUNT(*) FROM forum_posts WHERE thread_id = t.id) AS post_count
      FROM forum_threads t
      JOIN users u ON t.user_id = u.id
      JOIN forum_categories c ON t.category_id = c.id
      WHERE t.category_id = ?
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    try {
      // Fix: Properly destructure and type the count result
      const [countRows] = await pool.query<RowDataPacket[]>(countQuery, [
        categoryId,
      ]);
      const totalCount = countRows[0].total;

      // Fix: Properly destructure the rows result
      const [rows] = await pool.query<ForumThreadWithUser[]>(query, [
        categoryId,
        Number(limit),
        Number(offset),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        threads: rows,
        totalCount,
        totalPages,
      };
    } catch (error) {
      console.error("Error in findByCategory:", error);
      throw error;
    }
  }

  /**
   * Get recent threads across all categories
   */
  static async getRecentThreads(
    limit: number = 5
  ): Promise<ForumThreadWithUser[]> {
    const query = `
      SELECT t.*, 
        u.full_name AS user_full_name,
        c.name AS category_name,
        (SELECT COUNT(*) FROM forum_posts WHERE thread_id = t.id) AS post_count
      FROM forum_threads t
      JOIN users u ON t.user_id = u.id
      JOIN forum_categories c ON t.category_id = c.id
      ORDER BY t.created_at DESC
      LIMIT ?
    `;

    // Fix: Use query instead of execute and ensure limit is passed as a number
    const [rows] = await pool.query(query, [Number(limit)]);

    // Return the result
    return rows as ForumThreadWithUser[];
  }

  /**
   * Get user ID of thread creator
   */
  static async getThreadOwnerId(threadId: number): Promise<string | null> {
    const query = `
      SELECT user_id
      FROM forum_threads
      WHERE id = ?
    `;

    const [rows] = await pool.execute<(RowDataPacket & { user_id: string })[]>(
      query,
      [threadId]
    );

    return rows.length > 0 ? rows[0].user_id : null;
  }
}
