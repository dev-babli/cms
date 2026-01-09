-- Fix: Change created_by column from INTEGER to TEXT for case_studies table
-- Supabase Auth uses UUIDs (strings) for user IDs, not integers
-- The created_by column stores Supabase Auth UUIDs, NOT internal users table IDs
-- Run this in Supabase SQL Editor or PostgreSQL client

-- Step 1: Drop foreign key constraints first (if they exist)
-- Note: We need to drop constraints BEFORE changing column types
-- The created_by column stores Supabase Auth UUIDs, NOT internal users table IDs
-- So we don't want a foreign key constraint referencing users(id)

DO $$ 
DECLARE
  constraint_name_var TEXT;
BEGIN
  -- Drop all foreign key constraints on created_by column for case_studies
  FOR constraint_name_var IN
    SELECT conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
    AND rel.relname = 'case_studies'
    AND con.contype = 'f'
    AND EXISTS (
      SELECT 1 FROM pg_attribute
      WHERE attrelid = con.conrelid
      AND attnum = ANY(con.conkey)
      AND attname = 'created_by'
    )
  LOOP
    EXECUTE 'ALTER TABLE case_studies DROP CONSTRAINT IF EXISTS ' || constraint_name_var;
    RAISE NOTICE 'Dropped constraint: %', constraint_name_var;
  END LOOP;
  
  -- Drop all foreign key constraints on created_by column for ebooks
  FOR constraint_name_var IN
    SELECT conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
    AND rel.relname = 'ebooks'
    AND con.contype = 'f'
    AND EXISTS (
      SELECT 1 FROM pg_attribute
      WHERE attrelid = con.conrelid
      AND attnum = ANY(con.conkey)
      AND attname = 'created_by'
    )
  LOOP
    EXECUTE 'ALTER TABLE ebooks DROP CONSTRAINT IF EXISTS ' || constraint_name_var;
    RAISE NOTICE 'Dropped constraint: %', constraint_name_var;
  END LOOP;
  
  -- Drop all foreign key constraints on created_by column for whitepapers
  FOR constraint_name_var IN
    SELECT conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
    AND rel.relname = 'whitepapers'
    AND con.contype = 'f'
    AND EXISTS (
      SELECT 1 FROM pg_attribute
      WHERE attrelid = con.conrelid
      AND attnum = ANY(con.conkey)
      AND attname = 'created_by'
    )
  LOOP
    EXECUTE 'ALTER TABLE whitepapers DROP CONSTRAINT IF EXISTS ' || constraint_name_var;
    RAISE NOTICE 'Dropped constraint: %', constraint_name_var;
  END LOOP;
  
  -- Also check blog_posts and content_templates if they have created_by
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'created_by') THEN
    FOR constraint_name_var IN
      SELECT conname
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
      WHERE nsp.nspname = 'public'
      AND rel.relname = 'blog_posts'
      AND con.contype = 'f'
      AND EXISTS (
        SELECT 1 FROM pg_attribute
        WHERE attrelid = con.conrelid
        AND attnum = ANY(con.conkey)
        AND attname = 'created_by'
      )
    LOOP
      EXECUTE 'ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS ' || constraint_name_var;
      RAISE NOTICE 'Dropped constraint: %', constraint_name_var;
    END LOOP;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_templates' AND column_name = 'created_by') THEN
    FOR constraint_name_var IN
      SELECT conname
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
      WHERE nsp.nspname = 'public'
      AND rel.relname = 'content_templates'
      AND con.contype = 'f'
      AND EXISTS (
        SELECT 1 FROM pg_attribute
        WHERE attrelid = con.conrelid
        AND attnum = ANY(con.conkey)
        AND attname = 'created_by'
      )
    LOOP
      EXECUTE 'ALTER TABLE content_templates DROP CONSTRAINT IF EXISTS ' || constraint_name_var;
      RAISE NOTICE 'Dropped constraint: %', constraint_name_var;
    END LOOP;
  END IF;
END $$;

-- Step 2: Change created_by column type to TEXT for case_studies
ALTER TABLE case_studies 
ALTER COLUMN created_by TYPE TEXT;

-- Step 3: Also fix ebooks and whitepapers if they have the same issue
DO $$ 
BEGIN
  -- Fix ebooks table if created_by exists and is INTEGER
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ebooks' 
    AND column_name = 'created_by' 
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE ebooks ALTER COLUMN created_by TYPE TEXT;
  END IF;
  
  -- Fix whitepapers table if created_by exists and is INTEGER
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'whitepapers' 
    AND column_name = 'created_by' 
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE whitepapers ALTER COLUMN created_by TYPE TEXT;
  END IF;
END $$;

-- Verify the changes
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('case_studies', 'ebooks', 'whitepapers')
  AND column_name = 'created_by';

