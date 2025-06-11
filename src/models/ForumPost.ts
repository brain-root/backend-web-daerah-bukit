import { pool } from "../config/db";
import { ResultSetHeader, RowDataPacket, FieldPacket } from "mysql2/promise";

export interface ForumPost extends RowDataPacket {
  id: number;
  content: string;
  user_id: string;
  thread_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ForumPostWithUser extends ForumPost {
  user_full_name: string;
}

export interface ForumPostCreationData {
  content: string;
  user_id: string;
  thread_id: number;
}

export interface ForumPostUpdateData {
  content?: string;
}

export default class ForumPostModel {
  /**
   * Create a new forum post
   */
  static async create(data: ForumPostCreationData): Promise<number> {
    const { content, user_id, thread_id } = data;

    const query = `
      INSERT INTO forum_posts (content, user_id, thread_id)
      VALUES (?, ?, ?)
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      content,
      user_id,
      thread_id,
    ]);

    if (result.affectedRows === 0) {
      throw new Error("Failed to create forum post");
    }

    return result.insertId;
  }

  /**
   * Find forum post by ID
   */
  static async findById(id: number): Promise<ForumPostWithUser | null> {
    const query = `
      SELECT p.*, u.full_name AS user_full_name
      FROM forum_posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `;

    const [rows] = await pool.execute<ForumPostWithUser[]>(query, [id]);

    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Update forum post by ID
   */
  static async update(id: number, data: ForumPostUpdateData): Promise<boolean> {
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
      UPDATE forum_posts
      SET ${updates.join(", ")}
      WHERE id = ?
    `;

    values.push(id);

    const [result] = await pool.execute<ResultSetHeader>(query, values);

    return result.affectedRows > 0;
  }

  /**
   * Delete forum post by ID
   */
  static async delete(id: number): Promise<boolean> {
    const query = `
      DELETE FROM forum_posts
      WHERE id = ?
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [id]);

    return result.affectedRows > 0;
  }

  /**
   * Find all posts by thread
   */
  static async findByThread(threadId: number): Promise<{
    posts: ForumPostWithUser[];
    totalCount: number;
  }> {
    try {
      console.log(
        `[Debug] ForumPost.findByThread called with threadId: ${threadId}`
      );

      const countQuery = `
        SELECT COUNT(*) as total
        FROM forum_posts
        WHERE thread_id = ?
      `;

      const query = `
        SELECT p.*, 
          u.full_name AS author_name,
          (SELECT COUNT(*) FROM forum_reactions WHERE post_id = p.id AND reaction_type = 'like') AS like_count,
          (SELECT COUNT(*) FROM forum_reactions WHERE post_id = p.id AND reaction_type = 'dislike') AS dislike_count
        FROM forum_posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.thread_id = ?
        ORDER BY p.created_at ASC
      `;

      // Use query instead of execute to fix parameter issues
      const [countResult] = await pool.query<RowDataPacket[]>(countQuery, [
        threadId,
      ]);
      const totalCount = countResult[0].total;

      const [rows] = await pool.query<RowDataPacket[]>(query, [threadId]);

      console.log(
        `[Debug] ForumPost.findByThread found ${rows.length} posts for thread ${threadId}`
      );

      return {
        posts: rows as ForumPostWithUser[],
        totalCount,
      };
    } catch (error) {
      console.error(
        `[Debug] Error in ForumPost.findByThread(${threadId}):`,
        error
      );
      throw error;
    }
  }

  /**
   * Get user ID of post creator
   */
  static async getPostOwnerId(postId: number): Promise<string | null> {
    const query = `
      SELECT user_id
      FROM forum_posts
      WHERE id = ?
    `;

    const [rows] = await pool.execute<(RowDataPacket & { user_id: string })[]>(
      query,
      [postId]
    );

    return rows.length > 0 ? rows[0].user_id : null;
  }
}
