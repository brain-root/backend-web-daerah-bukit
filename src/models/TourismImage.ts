import { pool } from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export interface TourismImage {
  id: number;
  tourism_id: number;
  image_url: string;
  caption?: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface TourismImageInput {
  tourism_id: number;
  image_url: string;
  caption?: string;
  is_primary?: boolean;
  display_order?: number;
}

class TourismImageModel {
  /**
   * Find all images for a tourism destination
   */
  async findByTourismId(tourismId: number): Promise<TourismImage[]> {
    try {
      console.log(`Finding images for tourism ID: ${tourismId}`);
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM tourism_images WHERE tourism_id = ? ORDER BY is_primary DESC, display_order ASC",
        [tourismId]
      );

      return rows as TourismImage[];
    } catch (error) {
      console.error(`Error finding images for tourism ID ${tourismId}:`, error);
      throw error;
    }
  }

  /**
   * Find image by ID
   */
  async findById(id: number): Promise<TourismImage | null> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM tourism_images WHERE id = ?",
        [id]
      );

      return rows.length > 0 ? (rows[0] as TourismImage) : null;
    } catch (error) {
      console.error(`Error finding image with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new tourism image
   */
  async create(data: TourismImageInput): Promise<number> {
    try {
      console.log("Creating tourism image with data:", data);

      // If this is set as primary, unset all other primary images for this tourism
      if (data.is_primary) {
        await pool.query(
          "UPDATE tourism_images SET is_primary = FALSE WHERE tourism_id = ?",
          [data.tourism_id]
        );
      }

      // Get the next display order if not provided
      if (!data.display_order) {
        const [orderRows] = await pool.query<RowDataPacket[]>(
          "SELECT COALESCE(MAX(display_order), 0) as max_order FROM tourism_images WHERE tourism_id = ?",
          [data.tourism_id]
        );
        data.display_order = orderRows[0].max_order
          ? Number(orderRows[0].max_order) + 1
          : 1;
      }

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO tourism_images 
         (tourism_id, image_url, caption, is_primary, display_order) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          data.tourism_id,
          data.image_url,
          data.caption || null,
          data.is_primary || false,
          data.display_order,
        ]
      );

      return result.insertId;
    } catch (error) {
      console.error("Error creating tourism image:", error);
      throw error;
    }
  }

  /**
   * Update a tourism image
   */
  async update(id: number, data: Partial<TourismImageInput>): Promise<boolean> {
    try {
      console.log(`Updating tourism image ${id} with data:`, data);

      // Find the existing image first
      const image = await this.findById(id);
      if (!image) {
        return false;
      }

      // If setting this as primary, unset all others
      if (data.is_primary) {
        await pool.query(
          "UPDATE tourism_images SET is_primary = FALSE WHERE tourism_id = ?",
          [image.tourism_id]
        );
      }

      // Build the update query
      const updates: string[] = [];
      const values: any[] = [];

      if (data.caption !== undefined) {
        updates.push("caption = ?");
        values.push(data.caption);
      }

      if (data.is_primary !== undefined) {
        updates.push("is_primary = ?");
        values.push(data.is_primary);
      }

      if (data.display_order !== undefined) {
        updates.push("display_order = ?");
        values.push(data.display_order);
      }

      if (updates.length === 0) {
        return true; // Nothing to update
      }

      values.push(id); // Add the ID for WHERE clause

      const [result] = await pool.query<ResultSetHeader>(
        `UPDATE tourism_images SET ${updates.join(", ")} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error updating tourism image ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a tourism image
   */
  async delete(id: number): Promise<boolean> {
    try {
      console.log(`Deleting tourism image with ID: ${id}`);

      const [result] = await pool.query<ResultSetHeader>(
        "DELETE FROM tourism_images WHERE id = ?",
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting tourism image ${id}:`, error);
      throw error;
    }
  }

  /**
   * Set a specific image as the primary image for a tourism destination
   */
  async setPrimary(id: number): Promise<boolean> {
    try {
      const image = await this.findById(id);
      if (!image) {
        return false;
      }

      // First, unset primary flag on all images for this tourism
      await pool.query(
        "UPDATE tourism_images SET is_primary = FALSE WHERE tourism_id = ?",
        [image.tourism_id]
      );

      // Then set this image as primary
      const [result] = await pool.query<ResultSetHeader>(
        "UPDATE tourism_images SET is_primary = TRUE WHERE id = ?",
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error setting image ${id} as primary:`, error);
      throw error;
    }
  }
}

export default new TourismImageModel();
