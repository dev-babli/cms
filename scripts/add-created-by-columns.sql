-- Migration: Add created_by column to blog_posts and news_announcements tables
-- This enables ownership tracking for content
-- Run this in Supabase SQL Editor

-- Add created_by column to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS created_by TEXT;

-- Add created_by column to news_announcements table  
ALTER TABLE news_announcements 
ADD COLUMN IF NOT EXISTS created_by TEXT;

-- Create index for faster ownership queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_by ON blog_posts(created_by);
CREATE INDEX IF NOT EXISTS idx_news_announcements_created_by ON news_announcements(created_by);

-- Verify columns were added
SELECT 
  'blog_posts' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'blog_posts' AND column_name = 'created_by'
UNION ALL
SELECT 
  'news_announcements' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'news_announcements' AND column_name = 'created_by';

