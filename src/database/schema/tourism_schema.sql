-- Tourism Destinations Table
CREATE TABLE IF NOT EXISTS tourism_destinations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  category VARCHAR(100),
  image_url VARCHAR(255),
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert some sample data for testing
INSERT INTO tourism_destinations (name, description, location, category, featured)
VALUES
  ('Jam Gadang', 'Menara jam ikonik Bukittinggi yang menjadi landmark kota dengan arsitektur khas Minangkabau.', 'Pusat Kota Bukittinggi', 'Sejarah', TRUE),
  ('Ngarai Sianok', 'Jurang spektakuler dengan pemandangan tebing tinggi dan lembah hijau yang memukau.', 'Bukittinggi', 'Pemandangan', TRUE),
  ('Pasar Atas dan Pasar Bawah', 'Pasar tradisional bersejarah dengan arsitektur unik dan berbagai produk lokal.', 'Bukittinggi', 'Budaya', TRUE);

-- Index for faster searches
CREATE INDEX idx_tourism_category ON tourism_destinations(category);
CREATE INDEX idx_tourism_featured ON tourism_destinations(featured);
