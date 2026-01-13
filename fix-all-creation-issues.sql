-- Fix All Content Creation Issues
-- This script ensures all required columns exist for content creation
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. BLOG POSTS - Add missing created_by column
-- ============================================
ALTER TABLE IF EXISTS public.blog_posts 
ADD COLUMN IF NOT EXISTS created_by TEXT;

CREATE INDEX IF NOT EXISTS idx_blog_posts_created_by ON public.blog_posts(created_by);

-- ============================================
-- 2. MEDIA TABLE - Ensure it exists and has all columns
-- ============================================
CREATE TABLE IF NOT EXISTS public.media (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT,
  url TEXT NOT NULL,
  mime_type TEXT,
  size INTEGER,
  alt_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. VERIFY ALL REQUIRED COLUMNS EXIST
-- ============================================

-- Check blog_posts columns
DO $$
BEGIN
  -- Add custom_tracking_script if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'custom_tracking_script'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN custom_tracking_script TEXT;
  END IF;
  
  RAISE NOTICE 'Blog posts table verified';
END $$;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'All content creation fixes applied successfully!';
  RAISE NOTICE 'Blog posts: created_by column added';
  RAISE NOTICE 'Media table: verified';
END $$;

