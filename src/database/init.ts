import { pool } from "../config/db";
import fs from "fs";
import path from "path";

/**
 * Initialize database tables
 */
export const initializeTables = async (): Promise<void> => {
  try {
    console.log("Initializing database tables...");

    // Forum schema
    const forumSchemaPath = path.join(__dirname, "schema", "forum_schema.sql");
    let forumSchema = "";

    try {
      forumSchema = fs.readFileSync(forumSchemaPath, "utf8");
    } catch (error) {
      console.error(
        `Error reading forum schema file: ${forumSchemaPath}`,
        error
      );
      // Create the tables manually if the file doesn't exist
      forumSchema = `
        -- Forum Categories Table
        CREATE TABLE IF NOT EXISTS forum_categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
        
        -- Forum Threads Table
        CREATE TABLE IF NOT EXISTS forum_threads (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT,
          user_id VARCHAR(36) NOT NULL,
          category_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE
        );
        
        -- Forum Posts Table
        CREATE TABLE IF NOT EXISTS forum_posts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          content TEXT NOT NULL,
          user_id VARCHAR(36) NOT NULL,
          thread_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE
        );
        
        -- Forum Reactions Table
        CREATE TABLE IF NOT EXISTS forum_reactions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          thread_id INT NULL,
          post_id INT NULL,
          reaction_type ENUM('like', 'dislike') NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE,
          FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
          CONSTRAINT unique_thread_reaction UNIQUE (user_id, thread_id),
          CONSTRAINT unique_post_reaction UNIQUE (user_id, post_id)
        );
      `;
    }

    // Execute forum schema
    const statements = forumSchema
      .split(";")
      .filter((statement) => statement.trim() !== "");

    for (const statement of statements) {
      await pool.query(statement);
    }

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database tables:", error);
    throw error;
  }
};

// Call this function from server.ts before starting the server
