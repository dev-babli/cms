-- Diagnostic Script: Check for Content Creation Issues
-- Run this to identify what's missing or misconfigured

-- ============================================
-- 1. CHECK BLOG_POSTS TABLE
-- ============================================
SELECT 
  'blog_posts table check' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blog_posts') 
    THEN '✅ Table exists'
    ELSE '❌ Table missing - Run consolidated-migrations.sql'
  END as status;

-- Check for created_by column
SELECT 
  'blog_posts.created_by column' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'blog_posts' AND column_name = 'created_by'
    ) 
    THEN '✅ Column exists'
    ELSE '❌ Column missing - Run fix-blog-posts-created-by.sql'
  END as status;

-- List all blog_posts columns
SELECT 
  'blog_posts columns' as check_type,
  string_agg(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns
WHERE table_name = 'blog_posts';

-- ============================================
-- 2. CHECK MEDIA TABLE
-- ============================================
SELECT 
  'media table check' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media') 
    THEN '✅ Table exists'
    ELSE '❌ Table missing - Will be created by fix-all-creation-issues.sql'
  END as status;

-- ============================================
-- 3. CHECK OTHER CONTENT TABLES
-- ============================================
SELECT 
  'pages table' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pages') 
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END as status
UNION ALL
SELECT 
  'categories table' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') 
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END as status
UNION ALL
SELECT 
  'job_postings table' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_postings') 
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END as status
UNION ALL
SELECT 
  'ebooks table' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ebooks') 
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END as status
UNION ALL
SELECT 
  'case_studies table' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'case_studies') 
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END as status;

-- ============================================
-- 4. CHECK RLS STATUS
-- ============================================
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('blog_posts', 'media', 'pages', 'categories', 'job_postings', 'ebooks', 'case_studies')
ORDER BY tablename;

-- ============================================
-- 5. CHECK UPDATE FUNCTION
-- ============================================
SELECT 
  'update_updated_at_column function' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column'
    )
    THEN '✅ Function exists'
    ELSE '❌ Function missing - Run consolidated-migrations.sql'
  END as status;

-- ============================================
-- SUMMARY
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Diagnostic Check Complete';
  RAISE NOTICE 'Review the results above';
  RAISE NOTICE '========================================';
END $$;

