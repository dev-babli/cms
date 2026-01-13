-- Performance Optimization: Database Indexes
-- Run this in Supabase SQL Editor to improve query performance

-- Blog Posts Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_date ON blog_posts(published, publish_date DESC NULLS LAST) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- Job Postings Indexes
CREATE INDEX IF NOT EXISTS idx_job_postings_published ON job_postings(published, created_at DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_job_postings_slug ON job_postings(slug);

-- eBooks Indexes
CREATE INDEX IF NOT EXISTS idx_ebooks_published_date ON ebooks(published, publish_date DESC NULLS LAST) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_ebooks_slug ON ebooks(slug);

-- Case Studies Indexes
CREATE INDEX IF NOT EXISTS idx_case_studies_published ON case_studies(published, created_at DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies(slug);

-- Leads Indexes
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_content ON leads(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Team Members Indexes
CREATE INDEX IF NOT EXISTS idx_team_members_created_at ON team_members(created_at DESC);

-- Categories Indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Pages Indexes
CREATE INDEX IF NOT EXISTS idx_pages_visible_published ON pages(is_visible, published) WHERE is_visible = true AND published = true;
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);

-- Analytics Events Indexes (already exist, but ensure they're optimized)
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at_desc ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created ON analytics_events(event_type, created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_created ON blog_posts(published, created_at DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_analytics_events_date_range ON analytics_events(event_type, created_at) WHERE event_type = 'page_view';

