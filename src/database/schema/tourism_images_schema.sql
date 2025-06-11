-- Tourism Images Table
CREATE TABLE IF NOT EXISTS tourism_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tourism_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  caption VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tourism_id) REFERENCES tourism_destinations(id) ON DELETE CASCADE
);

-- Index for faster queries
CREATE INDEX idx_tourism_images_tourism_id ON tourism_images(tourism_id);
CREATE INDEX idx_tourism_images_is_primary ON tourism_images(is_primary);
