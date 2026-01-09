-- Create news_announcements table
CREATE TABLE IF NOT EXISTS news_announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,
  published BOOLEAN DEFAULT false,
  publish_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  author VARCHAR(255),
  category VARCHAR(100),
  tags TEXT[]
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_news_announcements_published ON news_announcements(published);
CREATE INDEX IF NOT EXISTS idx_news_announcements_publish_date ON news_announcements(publish_date);
CREATE INDEX IF NOT EXISTS idx_news_announcements_slug ON news_announcements(slug);










