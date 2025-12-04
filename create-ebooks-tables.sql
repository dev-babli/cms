-- Migration: Create eBooks, Case Studies, and Whitepapers Tables
-- Run this in Supabase SQL Editor to create all required content tables

-- ============================================
-- 1. CREATE EBOOKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ebooks (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  description TEXT,
  content TEXT, -- WYSIWYG content
  cover_image TEXT,
  pdf_url TEXT, -- PDF file URL
  pdf_size INTEGER, -- File size in bytes
  author TEXT,
  category_id INTEGER REFERENCES categories(id),
  category_ids TEXT, -- JSON array for multiple categories
  tags TEXT, -- Comma-separated or JSON array
  featured BOOLEAN DEFAULT false,
  gated BOOLEAN DEFAULT true, -- Whether download requires lead form
  download_count INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  publish_date TIMESTAMP,
  scheduled_publish_date TIMESTAMP,
  -- SEO Fields
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  canonical_url TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_type TEXT DEFAULT 'book',
  schema_markup TEXT, -- JSON schema markup
  -- Analytics
  google_analytics_id TEXT,
  custom_tracking_script TEXT,
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id)
);

-- ============================================
-- 2. CREATE CASE STUDIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS case_studies (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  description TEXT,
  content TEXT, -- WYSIWYG content
  featured_image TEXT,
  pdf_url TEXT, -- Optional PDF download
  pdf_size INTEGER,
  client TEXT, -- Client name
  industry TEXT,
  challenge TEXT, -- Challenge section
  solution TEXT, -- Solution section
  results TEXT, -- Results/metrics section
  author TEXT,
  category_id INTEGER REFERENCES categories(id),
  category_ids TEXT, -- JSON array
  tags TEXT,
  featured BOOLEAN DEFAULT false,
  gated BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  publish_date TIMESTAMP,
  scheduled_publish_date TIMESTAMP,
  -- SEO Fields
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  canonical_url TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_type TEXT DEFAULT 'article',
  schema_markup TEXT,
  -- Analytics
  google_analytics_id TEXT,
  custom_tracking_script TEXT,
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id)
);

-- ============================================
-- 3. CREATE WHITEPAPERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS whitepapers (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  description TEXT,
  content TEXT, -- WYSIWYG content
  cover_image TEXT,
  pdf_url TEXT, -- PDF file URL
  pdf_size INTEGER,
  author TEXT,
  category_id INTEGER REFERENCES categories(id),
  category_ids TEXT, -- JSON array
  tags TEXT,
  featured BOOLEAN DEFAULT false,
  gated BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  publish_date TIMESTAMP,
  scheduled_publish_date TIMESTAMP,
  -- SEO Fields
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  canonical_url TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_type TEXT DEFAULT 'article',
  schema_markup TEXT,
  -- Analytics
  google_analytics_id TEXT,
  custom_tracking_script TEXT,
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id)
);

-- ============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- eBooks indexes
CREATE INDEX IF NOT EXISTS idx_ebooks_slug ON ebooks(slug);
CREATE INDEX IF NOT EXISTS idx_ebooks_published ON ebooks(published);
CREATE INDEX IF NOT EXISTS idx_ebooks_gated ON ebooks(gated);
CREATE INDEX IF NOT EXISTS idx_ebooks_category ON ebooks(category_id);
CREATE INDEX IF NOT EXISTS idx_ebooks_publish_date ON ebooks(publish_date);

-- Case Studies indexes
CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies(slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_published ON case_studies(published);
CREATE INDEX IF NOT EXISTS idx_case_studies_gated ON case_studies(gated);
CREATE INDEX IF NOT EXISTS idx_case_studies_category ON case_studies(category_id);

-- Whitepapers indexes
CREATE INDEX IF NOT EXISTS idx_whitepapers_slug ON whitepapers(slug);
CREATE INDEX IF NOT EXISTS idx_whitepapers_published ON whitepapers(published);
CREATE INDEX IF NOT EXISTS idx_whitepapers_gated ON whitepapers(gated);
CREATE INDEX IF NOT EXISTS idx_whitepapers_category ON whitepapers(category_id);

-- ============================================
-- 5. ADD scheduled_publish_date TO blog_posts (if not already added)
-- ============================================

ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS scheduled_publish_date TIMESTAMP;

-- ============================================
-- 6. VERIFY TABLES WERE CREATED
-- ============================================

SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('ebooks', 'case_studies', 'whitepapers', 'blog_posts')
  AND column_name = 'scheduled_publish_date'
ORDER BY table_name, column_name;

