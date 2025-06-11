import { pool } from "../config/db";
import { RowDataPacket, OkPacket, ResultSetHeader } from "mysql2/promise";

export interface TourismImage {
  id: number;
  tourism_id: number;
  url: string;
  is_primary: boolean;
  display_order: number;
}

export interface TourismDestination {
  id: number;
  name: string;
  description: string;
  location: string;
  category: string;
  image_url: string; // Keep for backward compatibility
  featured: boolean;
  created_at: string;
  updated_at: string;
  images?: TourismImage[]; // Add images property
}

export interface TourismDestinationInput {
  name: string;
  description?: string;
  location?: string;
  category?: string;
  image_url?: string;
  featured?: boolean;
}

export interface TourismFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

class TourismModel {
  /**
   * Get all tourism destinations with pagination and filtering
   */
  async findAll(filters: TourismFilters = {}) {
    try {
      const { category, search, page = 1, limit = 10 } = filters;
      const offset = (page - 1) * limit;

      // Build WHERE clause
      let whereClause = "";
      const params: any[] = [];

      if (category) {
        whereClause = "WHERE category = ?";
        params.push(category);
      }

      if (search) {
        whereClause = whereClause
          ? `${whereClause} AND (name LIKE ? OR description LIKE ? OR location LIKE ?)`
          : "WHERE (name LIKE ? OR description LIKE ? OR location LIKE ?)";
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
      }

      // Count total matching records
      const [countRows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM tourism_destinations ${whereClause}`,
        params
      );
      const totalCount = countRows[0].total;

      // Clone params for pagination query
      const queryParams = [...params];

      // Add pagination parameters as numbers (not strings)
      queryParams.push(offset, limit); // Remove toString() conversion

      console.log(
        "SQL Query:",
        `SELECT * FROM tourism_destinations ${whereClause} ORDER BY created_at DESC LIMIT ?, ?`
      );
      console.log("Query params:", queryParams);

      // Query with pagination
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM tourism_destinations ${whereClause} ORDER BY created_at DESC LIMIT ?, ?`,
        queryParams
      );

      const totalPages = Math.ceil(totalCount / limit);

      return {
        destinations: rows as TourismDestination[],
        totalCount,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      console.error("Error in TourismModel.findAll:", error);
      throw error;
    }
  }

  /**
   * Find tourism destination by ID
   */
  async findById(id: number): Promise<TourismDestination | null> {
    try {
      console.log(`Finding tourism destination with ID: ${id}`);
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM tourism_destinations WHERE id = ?",
        [id]
      );

      return rows.length > 0 ? (rows[0] as TourismDestination) : null;
    } catch (error) {
      console.error(`Error in TourismModel.findById:`, error);
      throw error;
    }
  }

  /**
   * Find tourism destination by ID with images
   */
  async findByIdWithImages(id: number): Promise<TourismDestination | null> {
    try {
      console.log(
        `Finding tourism destination with ID: ${id} including images`
      );

      // Get the destination
      const destination = await this.findById(id);

      if (!destination) {
        return null;
      }

      // Get all images for this destination
      const [imageRows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM tourism_images WHERE tourism_id = ? ORDER BY is_primary DESC, display_order ASC",
        [id]
      );

      // Add images to destination
      destination.images = imageRows as TourismImage[];

      return destination;
    } catch (error) {
      console.error(`Error in TourismModel.findByIdWithImages:`, error);
      throw error;
    }
  }

  /**
   * Create new tourism destination
   */
  async create(data: TourismDestinationInput): Promise<number> {
    try {
      const { name, description, location, category, image_url, featured } =
        data;

      console.log("Creating tourism destination with data:", data);

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO tourism_destinations 
         (name, description, location, category, image_url, featured) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          name,
          description || "",
          location || "",
          category || "",
          image_url || "",
          featured || false,
        ]
      );

      console.log("Insert result:", result);
      return result.insertId;
    } catch (error) {
      console.error("Error in TourismModel.create:", error);
      throw error;
    }
  }

  /**
   * Update tourism destination
   */
  async update(
    id: number,
    data: Partial<TourismDestinationInput>
  ): Promise<TourismDestination | null> {
    try {
      console.log(`Updating tourism destination with ID: ${id}, data:`, data);

      // Create SET clause dynamically based on provided data
      const fields = Object.keys(data).filter(
        (key) => data[key as keyof typeof data] !== undefined
      );
      if (fields.length === 0) return this.findById(id);

      const setClause = fields.map((field) => `${field} = ?`).join(", ");
      const values = fields.map((field) => data[field as keyof typeof data]);

      console.log(
        "Update SQL:",
        `UPDATE tourism_destinations SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      );
      console.log("Update values:", [...values, id]);

      await pool.query<OkPacket>(
        `UPDATE tourism_destinations SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id]
      );

      return this.findById(id);
    } catch (error) {
      console.error(`Error in TourismModel.update:`, error);
      throw error;
    }
  }

  /**
   * Delete tourism destination
   */
  async delete(id: number): Promise<boolean> {
    try {
      console.log(`Deleting tourism destination with ID: ${id}`);

      // First check if the destination exists
      const destination = await this.findById(id);
      if (!destination) {
        console.log(`No destination found with ID ${id}`);
        return false;
      }

      const [result] = await pool.query<OkPacket>(
        "DELETE FROM tourism_destinations WHERE id = ?",
        [id]
      );

      console.log("Delete result:", result);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error in TourismModel.delete:`, error);
      throw error;
    }
  }

  /**
   * Get featured tourism destinations
   */
  async findFeatured(limit: number = 5): Promise<TourismDestination[]> {
    try {
      console.log(`Finding featured destinations with limit: ${limit}`);

      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM tourism_destinations WHERE featured = TRUE ORDER BY created_at DESC LIMIT ?",
        [limit] // Remove the toString() conversion - pass limit as a number
      );

      return rows as TourismDestination[];
    } catch (error) {
      console.error("Error in TourismModel.findFeatured:", error);
      throw error;
    }
  }

  /**
   * Synchronize the primary image with the tourism destination's image_url
   */
  async syncPrimaryImage(id: number): Promise<boolean> {
    try {
      console.log(`Synchronizing primary image for tourism destination ${id}`);

      // First, find the primary image for this tourism destination
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM tourism_images WHERE tourism_id = ? AND is_primary = TRUE LIMIT 1",
        [id]
      );

      // If no primary image found, don't update
      if (rows.length === 0) {
        console.log(`No primary image found for tourism destination ${id}`);
        return false;
      }

      const primaryImage = rows[0];
      console.log(`Found primary image for tourism ${id}:`, primaryImage);

      // Update the main tourism destination with this image URL
      const [result] = await pool.query<ResultSetHeader>(
        "UPDATE tourism_destinations SET image_url = ? WHERE id = ?",
        [primaryImage.image_url, id]
      );

      console.log(
        `Updated tourism ${id} with primary image URL: ${primaryImage.image_url}`
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error(
        `Error synchronizing primary image for tourism ${id}:`,
        error
      );
      throw error;
    }
  }
}

export default new TourismModel();
