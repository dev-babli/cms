-- Quick Fix: Add created_by column to news_announcements table
-- Run this in your Supabase SQL Editor or PostgreSQL client

-- Add created_by column if it doesn't exist
ALTER TABLE news_announcements 
ADD COLUMN IF NOT EXISTS created_by TEXT;

-- Create index for faster ownership queries
CREATE INDEX IF NOT EXISTS idx_news_announcements_created_by ON news_announcements(created_by);

-- Verify the column was added
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'news_announcements' AND column_name = 'created_by';

