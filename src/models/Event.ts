import { pool } from "../config/db";
import { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { format } from "date-fns";

// Define interface for Event
export interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  date: string;
  time: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

// Define interface for creation data
export interface EventCreationData {
  name: string;
  description?: string;
  location?: string;
  date?: string;
  time?: string;
  image_url?: string;
}

// Define interface for update data
export interface EventUpdateData {
  name?: string;
  description?: string;
  location?: string;
  date?: string;
  time?: string;
  image_url?: string;
}

// Define interface for pagination parameters
interface PaginationParams {
  page?: number;
  limit?: number;
}

// Define interface for total count result
interface CountResult extends RowDataPacket {
  total: number;
}

// Define interface for paginated response
interface PaginatedResponse {
  events: Event[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// Define Event model with static methods
const EventModel = {
  /**
   * Find all events with pagination
   */
  async findAll({
    page = 1,
    limit = 10,
  }: PaginationParams = {}): Promise<PaginatedResponse> {
    try {
      const offset = (page - 1) * limit;
      const query = "SELECT * FROM events ORDER BY date DESC LIMIT ? OFFSET ?";
      const countQuery = "SELECT COUNT(*) AS total FROM events";

      // Execute both queries in parallel
      const [countResult, [rows]] = await Promise.all([
        pool.query<CountResult[]>(countQuery),
        pool.query<Event[] & RowDataPacket[]>(query, [limit, offset]),
      ]);

      // Safely extract the total count
      const total = countResult[0][0]?.total || 0;

      return {
        events: rows as Event[],
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
   * Find upcoming events
   */
  async findUpcoming(limit: number = 4): Promise<Event[]> {
    try {
      // Get current date
      const today = format(new Date(), "yyyy-MM-dd");

      const [rows] = await pool.query<(Event & RowDataPacket)[]>(
        "SELECT * FROM events WHERE date >= ? ORDER BY date ASC LIMIT ?",
        [today, limit]
      );

      return rows as Event[];
    } catch (error) {
      console.error("Error finding upcoming events:", error);
      throw error;
    }
  },

  /**
   * Find event by ID
   */
  async findById(id: number): Promise<Event | null> {
    try {
      const [rows] = await pool.query<(Event & RowDataPacket)[]>(
        "SELECT * FROM events WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      return rows[0] as Event;
    } catch (error) {
      console.error(`Error finding event with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Search events by name, description, or location
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
        SELECT * FROM events 
        WHERE name LIKE ? OR description LIKE ? OR location LIKE ? 
        ORDER BY date DESC LIMIT ? OFFSET ?
      `;

      const countQuery = `
        SELECT COUNT(*) AS total FROM events 
        WHERE name LIKE ? OR description LIKE ? OR location LIKE ?
      `;

      // Execute both queries in parallel
      const [countResult, [rows]] = await Promise.all([
        pool.query<CountResult[]>(countQuery, countParams),
        pool.query<Event[] & RowDataPacket[]>(query, queryParams),
      ]);

      // Safely extract the total count
      const total = countResult[0][0]?.total || 0;

      return {
        events: rows as Event[],
        totalCount: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error("Error searching events:", error);
      throw error;
    }
  },

  /**
   * Create a new event
   */
  async create(data: EventCreationData): Promise<number> {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO events 
         (name, description, location, date, time, image_url) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          data.description || "",
          data.location || "",
          data.date || "",
          data.time || "",
          data.image_url || "",
        ]
      );

      return result.insertId;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },

  /**
   * Update an event
   */
  async update(id: number, data: EventUpdateData): Promise<boolean> {
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
        `UPDATE events 
         SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error updating event with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an event
   */
  async delete(id: number): Promise<boolean> {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        "DELETE FROM events WHERE id = ?",
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting event with id ${id}:`, error);
      throw error;
    }
  },
};

export default EventModel;
