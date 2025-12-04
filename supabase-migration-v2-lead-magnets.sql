-- Intellectt CMS - Lead Magnets Migration (v2)
-- New Content Types: eBooks, Case Studies, Whitepapers
-- Lead Capture Functionality
-- Enhanced SEO Fields

-- ============================================
-- 1. ENHANCE EXISTING TABLES WITH SEO FIELDS
-- ============================================

-- Add SEO fields to blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS meta_keywords TEXT,
ADD COLUMN IF NOT EXISTS canonical_url TEXT,
ADD COLUMN IF NOT EXISTS og_title TEXT,
ADD COLUMN IF NOT EXISTS og_description TEXT,
ADD COLUMN IF NOT EXISTS og_image TEXT,
ADD COLUMN IF NOT EXISTS og_type TEXT DEFAULT 'article',
ADD COLUMN IF NOT EXISTS schema_markup TEXT, -- JSON schema markup
ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id),
ADD COLUMN IF NOT EXISTS tag_ids TEXT, -- JSON array of tag IDs
ADD COLUMN IF NOT EXISTS scheduled_publish_date TIMESTAMP;

-- Add SEO fields to services
ALTER TABLE services
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS meta_keywords TEXT,
ADD COLUMN IF NOT EXISTS canonical_url TEXT,
ADD COLUMN IF NOT EXISTS og_title TEXT,
ADD COLUMN IF NOT EXISTS og_description TEXT,
ADD COLUMN IF NOT EXISTS og_image TEXT;

-- ============================================
-- 2. NEW CONTENT TYPE TABLES
-- ============================================

-- eBooks table
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

-- Case Studies table
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
  client_name TEXT,
  client_logo TEXT,
  industry TEXT,
  challenge TEXT, -- Challenge section
  solution TEXT, -- Solution section
  results TEXT, -- Results/metrics section
  testimonial TEXT, -- Client testimonial
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

-- Whitepapers table
CREATE TABLE IF NOT EXISTS whitepapers (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  description TEXT,
  content TEXT, -- WYSIWYG content summary
  cover_image TEXT,
  pdf_url TEXT NOT NULL, -- PDF is required for whitepapers
  pdf_size INTEGER,
  author TEXT,
  pages INTEGER, -- Number of pages
  reading_time INTEGER, -- Estimated reading time in minutes
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
-- 3. LEAD CAPTURE TABLES
-- ============================================

-- Leads table (captured from gated content forms)
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  -- Contact Information
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  role TEXT,
  industry TEXT,
  -- Lead Source
  content_type TEXT NOT NULL, -- 'ebook', 'case_study', 'whitepaper'
  content_id INTEGER NOT NULL,
  content_title TEXT,
  -- Marketing
  lead_source TEXT, -- 'organic', 'paid', 'referral', etc.
  campaign TEXT,
  medium TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  -- Status & Follow-up
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
  notes TEXT,
  assigned_to INTEGER REFERENCES users(id),
  -- CRM Integration
  crm_id TEXT, -- External CRM ID if synced
  crm_synced BOOLEAN DEFAULT false,
  crm_synced_at TIMESTAMP,
  -- Consent & Privacy
  consent_marketing BOOLEAN DEFAULT false,
  consent_data_processing BOOLEAN DEFAULT true,
  ip_address TEXT,
  user_agent TEXT,
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lead downloads tracking
CREATE TABLE IF NOT EXISTS lead_downloads (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id INTEGER NOT NULL,
  downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_url TEXT,
  file_size INTEGER,
  download_method TEXT DEFAULT 'direct', -- 'direct', 'email', 'redirect'
  UNIQUE(lead_id, content_type, content_id)
);

-- ============================================
-- 4. ENHANCE CATEGORIES TABLE
-- ============================================

-- Add content type support to categories
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'blog', -- 'blog', 'ebook', 'case_study', 'whitepaper', 'all'
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES categories(id);

-- ============================================
-- 5. CONTENT-CATEGORY MAPPING (Many-to-Many)
-- ============================================

CREATE TABLE IF NOT EXISTS content_categories (
  id SERIAL PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'blog', 'ebook', 'case_study', 'whitepaper'
  content_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(content_type, content_id, category_id)
);

-- ============================================
-- 6. ANALYTICS & TRACKING
-- ============================================

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'page_view', 'download', 'form_submit', 'click', 'custom'
  content_type TEXT,
  content_id INTEGER,
  user_id INTEGER REFERENCES users(id),
  session_id TEXT,
  -- Event Data
  event_name TEXT,
  event_data JSONB, -- Flexible JSON for custom events
  -- Tracking
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. INDEXES FOR PERFORMANCE
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
CREATE INDEX IF NOT EXISTS idx_case_studies_industry ON case_studies(industry);

-- Whitepapers indexes
CREATE INDEX IF NOT EXISTS idx_whitepapers_slug ON whitepapers(slug);
CREATE INDEX IF NOT EXISTS idx_whitepapers_published ON whitepapers(published);
CREATE INDEX IF NOT EXISTS idx_whitepapers_gated ON whitepapers(gated);
CREATE INDEX IF NOT EXISTS idx_whitepapers_category ON whitepapers(category_id);

-- Leads indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_content ON leads(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_crm_synced ON leads(crm_synced);

-- Lead Downloads indexes
CREATE INDEX IF NOT EXISTS idx_lead_downloads_lead ON lead_downloads(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_downloads_content ON lead_downloads(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_lead_downloads_date ON lead_downloads(downloaded_at DESC);

-- Content Categories indexes
CREATE INDEX IF NOT EXISTS idx_content_categories_content ON content_categories(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_categories_category ON content_categories(category_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_content ON analytics_events(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_content_type ON categories(content_type);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(order_index);

-- ============================================
-- 8. TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ============================================

-- Triggers for new tables
CREATE TRIGGER update_ebooks_updated_at BEFORE UPDATE ON ebooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_studies_updated_at BEFORE UPDATE ON case_studies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whitepapers_updated_at BEFORE UPDATE ON whitepapers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. INSERT DEFAULT CATEGORIES FOR BLOGS
-- ============================================

INSERT INTO categories (name, slug, description, content_type, color, icon) VALUES
  ('Industry Insights', 'industry-insights', 'Deep dive into industry trends and analysis', 'blog', '#3b82f6', '📊'),
  ('Technology & Innovation', 'technology-innovation', 'Latest tech trends and innovations', 'blog', '#8b5cf6', '💡'),
  ('AI & Automation', 'ai-automation', 'Artificial intelligence and automation insights', 'blog', '#ec4899', '🤖'),
  ('Product Updates', 'product-updates', 'Product features and release notes', 'blog', '#10b981', '🚀'),
  ('Thought Leadership', 'thought-leadership', 'Expert opinions and industry perspectives', 'blog', '#f59e0b', '💭'),
  ('Company News', 'company-news', 'Updates and announcements from Intellectt', 'blog', '#ef4444', '📢')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Lead Magnets Migration (v2) completed successfully!';
  RAISE NOTICE '📚 New tables: ebooks, case_studies, whitepapers';
  RAISE NOTICE '👥 Lead capture: leads, lead_downloads';
  RAISE NOTICE '📊 Analytics: analytics_events';
  RAISE NOTICE '🏷️ Enhanced: categories, content_categories';
  RAISE NOTICE '🔍 SEO fields added to all content types';
  RAISE NOTICE '📈 Performance indexes created';
END $$;

