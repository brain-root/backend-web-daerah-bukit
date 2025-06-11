import { pool } from "../config/db";
import { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2/promise";

// Define interface for Business
export interface Business {
  id: number;
  name: string;
  description: string;
  location: string;
  category: string;
  contact: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

// Define interface for creation data
export interface BusinessCreationData {
  name: string;
  description?: string;
  location?: string;
  category?: string;
  contact?: string;
  image_url?: string;
}

// Define interface for update data
export interface BusinessUpdateData {
  name?: string;
  description?: string;
  location?: string;
  category?: string;
  contact?: string;
  image_url?: string;
}

// Define interface for pagination parameters
interface PaginationParams {
  page?: number;
  limit?: number;
  category?: string;
}

// Define interface for total count result
interface CountResult extends RowDataPacket {
  total: number;
}

// Define interface for paginated response
interface PaginatedResponse {
  businesses: Business[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// Define Business model with static methods
const BusinessModel = {
  /**
   * Find all businesses with pagination
   */
  async findAll({
    page = 1,
    limit = 10,
    category,
  }: PaginationParams = {}): Promise<PaginatedResponse> {
    try {
      const offset = (page - 1) * limit;
      let query = "SELECT * FROM businesses";
      let countQuery = "SELECT COUNT(*) AS total FROM businesses";
      const queryParams: any[] = [];
      const countParams: any[] = [];

      if (category) {
        query += " WHERE category = ?";
        countQuery += " WHERE category = ?";
        queryParams.push(category);
        countParams.push(category);
      }

      query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
      queryParams.push(limit, offset);

      // Execute both queries in parallel
      const [countResult, [rows]] = await Promise.all([
        pool.query<CountResult[]>(countQuery, countParams),
        pool.query<Business[] & RowDataPacket[]>(query, queryParams),
      ]);

      // Safely extract the total count
      const total = countResult[0][0]?.total || 0;

      return {
        businesses: rows as Business[],
        totalCount: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error("Error in findAll method:", error);
      throw error;
    }
  },

  /**
   * Find business by ID
   */
  async findById(id: number): Promise<Business | null> {
    try {
      const [rows] = await pool.query<(Business & RowDataPacket)[]>(
        "SELECT * FROM businesses WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      return rows[0] as Business;
    } catch (error) {
      console.error(`Error finding business with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Search businesses by name, description, or location
   */
  async search(
    searchTerm: string,
    { page = 1, limit = 10 }: PaginationParams = {}
  ): Promise<PaginatedResponse> {
    try {
      const offset = (page - 1) * limit;
      const searchPattern = `%${searchTerm}%`;
      const queryParams = [
        searchPattern,
        searchPattern,
        searchPattern,
        limit,
        offset,
      ];
      const countParams = [searchPattern, searchPattern, searchPattern];

      const query = `
        SELECT * FROM businesses 
        WHERE name LIKE ? OR description LIKE ? OR location LIKE ? 
        ORDER BY created_at DESC LIMIT ? OFFSET ?
      `;

      const countQuery = `
        SELECT COUNT(*) AS total FROM businesses 
        WHERE name LIKE ? OR description LIKE ? OR location LIKE ?
      `;

      // Execute both queries in parallel
      const [countResult, [rows]] = await Promise.all([
        pool.query<CountResult[]>(countQuery, countParams),
        pool.query<Business[] & RowDataPacket[]>(query, queryParams),
      ]);

      // Safely extract the total count
      const total = countResult[0][0]?.total || 0;

      return {
        businesses: rows as Business[],
        totalCount: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error("Error searching businesses:", error);
      throw error;
    }
  },

  /**
   * Create a new business
   */
  async create(data: BusinessCreationData): Promise<number> {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO businesses 
         (name, description, location, category, contact, image_url) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          data.description || "",
          data.location || "",
          data.category || "",
          data.contact || "",
          data.image_url || "",
        ]
      );

      return result.insertId;
    } catch (error) {
      console.error("Error creating business:", error);
      throw error;
    }
  },

  /**
   * Update a business
   */
  async update(id: number, data: BusinessUpdateData): Promise<boolean> {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      // Build update query dynamically based on provided fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      });

      if (updates.length === 0) {
        return false;
      }

      values.push(id);

      const [result] = await pool.query<ResultSetHeader>(
        `UPDATE businesses 
         SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error updating business with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a business
   */
  async delete(id: number): Promise<boolean> {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        "DELETE FROM businesses WHERE id = ?",
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting business with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get featured businesses
   */
  async findFeatured(limit: number = 3): Promise<Business[]> {
    try {
      // For now, we'll just return the most recently added businesses
      // In the future, you might want to add a 'featured' column to the table
      const [rows] = await pool.query<Business[] & RowDataPacket[]>(
        "SELECT * FROM businesses ORDER BY created_at DESC LIMIT ?",
        [limit]
      );

      return rows as Business[];
    } catch (error) {
      console.error(`Error finding featured businesses:`, error);
      throw error;
    }
  },
};

export default BusinessModel;
