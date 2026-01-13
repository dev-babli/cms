-- URL Shortener Table
-- Creates a table to store short URL mappings

CREATE TABLE IF NOT EXISTS url_shortener (
  id SERIAL PRIMARY KEY,
  short_hash VARCHAR(20) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id),
  clicks INTEGER DEFAULT 0,
  last_accessed TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_url_shortener_hash ON url_shortener(short_hash);
CREATE INDEX IF NOT EXISTS idx_url_shortener_created_by ON url_shortener(created_by);
CREATE INDEX IF NOT EXISTS idx_url_shortener_created_at ON url_shortener(created_at);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'URL shortener table created successfully!';
END $$;

