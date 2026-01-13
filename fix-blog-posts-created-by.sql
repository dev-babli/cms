-- Fix: Add created_by column to blog_posts table
-- This column is required by the API but was missing from the table definition

-- Add created_by column if it doesn't exist
ALTER TABLE IF EXISTS public.blog_posts 
ADD COLUMN IF NOT EXISTS created_by TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_by ON public.blog_posts(created_by);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Blog posts created_by column added successfully!';
END $$;

