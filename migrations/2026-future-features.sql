-- Intellectt CMS - Future Features Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Date: 2026
-- Features: Hero Slides, Office Addresses, Page Visibility

-- ============================================
-- 1. HERO SLIDES TABLES
-- ============================================

-- Hero slides table
CREATE TABLE IF NOT EXISTS hero_slides (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_text TEXT,
  cta_link TEXT,
  background_image TEXT NOT NULL,
  accent_color TEXT DEFAULT '#667eea',
  has_light_background BOOLEAN DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Hero slides configuration table
CREATE TABLE IF NOT EXISTS hero_slides_config (
  id SERIAL PRIMARY KEY,
  max_slides_displayed INTEGER DEFAULT 5,
  auto_advance_enabled BOOLEAN DEFAULT true,
  auto_advance_interval INTEGER DEFAULT 8000,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER
);

-- Insert default config if not exists
INSERT INTO hero_slides_config (max_slides_displayed, auto_advance_enabled, auto_advance_interval)
VALUES (5, true, 8000)
ON CONFLICT DO NOTHING;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_hero_slides_active ON hero_slides(is_active, display_order) WHERE is_active = true;

-- ============================================
-- 2. OFFICE ADDRESSES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS office_addresses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  coordinates_lat DECIMAL(10, 8),
  coordinates_lng DECIMAL(11, 8),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_office_addresses_active ON office_addresses(country, is_active, display_order) WHERE is_active = true;

-- ============================================
-- 3. PAGE VISIBILITY COLUMNS
-- ============================================

-- Add visibility columns to existing pages table
ALTER TABLE pages ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS visibility_changed_at TIMESTAMP;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS visibility_changed_by INTEGER;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_pages_visible ON pages(is_visible, published) WHERE is_visible = true AND published = true;

-- Set homepage and contact page as always visible (protected)
-- Note: Update slugs based on your actual page slugs
UPDATE pages SET is_visible = true 
WHERE slug IN ('home', '/', 'index', 'contact', 'contact-us', 'contactus')
AND is_visible IS NULL;

-- ============================================
-- 4. AUDIT LOG TABLE (for compliance)
-- ============================================

CREATE TABLE IF NOT EXISTS content_audit_log (
  id SERIAL PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'hero_slide', 'office_address', 'page_visibility'
  content_id INTEGER,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'visibility_change'
  user_id INTEGER,
  user_email TEXT,
  ip_address TEXT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_content ON content_audit_log(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON content_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON content_audit_log(created_at DESC);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE hero_slides IS 'Hero section slides for homepage carousel';
COMMENT ON TABLE hero_slides_config IS 'Configuration for hero slides display';
COMMENT ON TABLE office_addresses IS 'Office addresses for contact page';
COMMENT ON TABLE content_audit_log IS 'Audit log for all content modifications (compliance)';





