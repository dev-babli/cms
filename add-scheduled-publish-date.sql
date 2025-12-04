-- Migration: Add scheduled_publish_date column and create eBooks tables
-- Run this in Supabase SQL Editor if you get: "column scheduled_publish_date does not exist"
-- OR if you get: "relation 'ebooks' does not exist"

-- ============================================
-- STEP 1: Add scheduled_publish_date to blog_posts
-- ============================================

ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS scheduled_publish_date TIMESTAMP;

-- Also add to other content tables (only if they exist)
-- These will fail gracefully if tables don't exist yet - that's okay!

DO $$
BEGIN
    -- Add to ebooks if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ebooks') THEN
        ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS scheduled_publish_date TIMESTAMP;
        RAISE NOTICE 'Added scheduled_publish_date to ebooks';
    ELSE
        RAISE NOTICE 'ebooks table does not exist - skipping';
    END IF;

    -- Add to case_studies if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'case_studies') THEN
        ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS scheduled_publish_date TIMESTAMP;
        RAISE NOTICE 'Added scheduled_publish_date to case_studies';
    ELSE
        RAISE NOTICE 'case_studies table does not exist - skipping';
    END IF;

    -- Add to whitepapers if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'whitepapers') THEN
        ALTER TABLE whitepapers ADD COLUMN IF NOT EXISTS scheduled_publish_date TIMESTAMP;
        RAISE NOTICE 'Added scheduled_publish_date to whitepapers';
    ELSE
        RAISE NOTICE 'whitepapers table does not exist - skipping';
    END IF;
END $$;

-- Verify the column was added to blog_posts
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'blog_posts' 
AND column_name = 'scheduled_publish_date';

