-- Intellectt CMS - Enable Row Level Security (RLS) Migration
-- This script enables RLS on all public tables and creates appropriate security policies
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- 
-- This addresses the Supabase Database Linter security warnings:
-- - RLS Disabled in Public (ERROR)
-- - Sensitive Columns Exposed (ERROR)

-- ============================================
-- 1. ENABLE RLS ON ALL PUBLIC TABLES
-- ============================================

-- Content Tables (Public Read Access for Published Content)
ALTER TABLE IF EXISTS public.content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.whitepapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.news_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.content_categories ENABLE ROW LEVEL SECURITY;

-- User & Authentication Tables (Restricted Access)
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Lead Management Tables (Admin Only)
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lead_downloads ENABLE ROW LEVEL SECURITY;

-- System Tables (Admin Only)
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ip_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.login_attempts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. PUBLIC CONTENT TABLES - READ POLICIES
-- Allow public read access to published content only
-- ============================================

-- Pages: Public can read published pages
DROP POLICY IF EXISTS "Public can read published pages" ON public.pages;
CREATE POLICY "Public can read published pages"
ON public.pages FOR SELECT
TO public
USING (published = true);

-- Blog Posts: Public can read published blog posts
DROP POLICY IF EXISTS "Public can read published blog posts" ON public.blog_posts;
CREATE POLICY "Public can read published blog posts"
ON public.blog_posts FOR SELECT
TO public
USING (published = true AND (publish_date IS NULL OR publish_date <= NOW()));

-- Services: Public can read published services
DROP POLICY IF EXISTS "Public can read published services" ON public.services;
CREATE POLICY "Public can read published services"
ON public.services FOR SELECT
TO public
USING (published = true);

-- Team Members: Public can read published team members
DROP POLICY IF EXISTS "Public can read published team members" ON public.team_members;
CREATE POLICY "Public can read published team members"
ON public.team_members FOR SELECT
TO public
USING (published = true);

-- Testimonials: Public can read published testimonials
DROP POLICY IF EXISTS "Public can read published testimonials" ON public.testimonials;
CREATE POLICY "Public can read published testimonials"
ON public.testimonials FOR SELECT
TO public
USING (published = true);

-- Categories: Public can read all categories
DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
CREATE POLICY "Public can read categories"
ON public.categories FOR SELECT
TO public
USING (true);

-- Case Studies: Public can read published case studies
DROP POLICY IF EXISTS "Public can read published case studies" ON public.case_studies;
CREATE POLICY "Public can read published case studies"
ON public.case_studies FOR SELECT
TO public
USING (published = true AND (publish_date IS NULL OR publish_date <= NOW()));

-- Ebooks: Public can read published ebooks
DROP POLICY IF EXISTS "Public can read published ebooks" ON public.ebooks;
CREATE POLICY "Public can read published ebooks"
ON public.ebooks FOR SELECT
TO public
USING (published = true AND (publish_date IS NULL OR publish_date <= NOW()));

-- Whitepapers: Public can read published whitepapers
DROP POLICY IF EXISTS "Public can read published whitepapers" ON public.whitepapers;
CREATE POLICY "Public can read published whitepapers"
ON public.whitepapers FOR SELECT
TO public
USING (published = true AND (publish_date IS NULL OR publish_date <= NOW()));

-- Job Postings: Public can read published job postings
DROP POLICY IF EXISTS "Public can read published job postings" ON public.job_postings;
CREATE POLICY "Public can read published job postings"
ON public.job_postings FOR SELECT
TO public
USING (published = true);

-- News Announcements: Public can read published news
DROP POLICY IF EXISTS "Public can read published news announcements" ON public.news_announcements;
CREATE POLICY "Public can read published news announcements"
ON public.news_announcements FOR SELECT
TO public
USING (published = true AND (publish_date IS NULL OR publish_date <= NOW()));

-- Content Categories: Public can read all content category mappings
DROP POLICY IF EXISTS "Public can read content categories" ON public.content_categories;
CREATE POLICY "Public can read content categories"
ON public.content_categories FOR SELECT
TO public
USING (true);

-- Media: Public can read all media (for displaying images)
DROP POLICY IF EXISTS "Public can read media" ON public.media;
CREATE POLICY "Public can read media"
ON public.media FOR SELECT
TO public
USING (true);

-- ============================================
-- 3. SERVICE ROLE ACCESS - FULL ACCESS
-- Service role (backend) has full access to all tables
-- This allows the Next.js backend to manage all data
-- ============================================

-- Content Templates: Service role full access
DROP POLICY IF EXISTS "Service role full access to content_templates" ON public.content_templates;
CREATE POLICY "Service role full access to content_templates"
ON public.content_templates
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Media: Service role full access
DROP POLICY IF EXISTS "Service role full access to media" ON public.media;
CREATE POLICY "Service role full access to media"
ON public.media
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Pages: Service role full access
DROP POLICY IF EXISTS "Service role full access to pages" ON public.pages;
CREATE POLICY "Service role full access to pages"
ON public.pages
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Blog Posts: Service role full access
DROP POLICY IF EXISTS "Service role full access to blog_posts" ON public.blog_posts;
CREATE POLICY "Service role full access to blog_posts"
ON public.blog_posts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Services: Service role full access
DROP POLICY IF EXISTS "Service role full access to services" ON public.services;
CREATE POLICY "Service role full access to services"
ON public.services
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Team Members: Service role full access
DROP POLICY IF EXISTS "Service role full access to team_members" ON public.team_members;
CREATE POLICY "Service role full access to team_members"
ON public.team_members
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Testimonials: Service role full access
DROP POLICY IF EXISTS "Service role full access to testimonials" ON public.testimonials;
CREATE POLICY "Service role full access to testimonials"
ON public.testimonials
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Categories: Service role full access
DROP POLICY IF EXISTS "Service role full access to categories" ON public.categories;
CREATE POLICY "Service role full access to categories"
ON public.categories
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Case Studies: Service role full access
DROP POLICY IF EXISTS "Service role full access to case_studies" ON public.case_studies;
CREATE POLICY "Service role full access to case_studies"
ON public.case_studies
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Ebooks: Service role full access
DROP POLICY IF EXISTS "Service role full access to ebooks" ON public.ebooks;
CREATE POLICY "Service role full access to ebooks"
ON public.ebooks
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Whitepapers: Service role full access
DROP POLICY IF EXISTS "Service role full access to whitepapers" ON public.whitepapers;
CREATE POLICY "Service role full access to whitepapers"
ON public.whitepapers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Job Postings: Service role full access
DROP POLICY IF EXISTS "Service role full access to job_postings" ON public.job_postings;
CREATE POLICY "Service role full access to job_postings"
ON public.job_postings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- News Announcements: Service role full access
DROP POLICY IF EXISTS "Service role full access to news_announcements" ON public.news_announcements;
CREATE POLICY "Service role full access to news_announcements"
ON public.news_announcements
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Content Categories: Service role full access
DROP POLICY IF EXISTS "Service role full access to content_categories" ON public.content_categories;
CREATE POLICY "Service role full access to content_categories"
ON public.content_categories
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 4. SENSITIVE TABLES - SERVICE ROLE ONLY
-- These tables contain sensitive data and should only be accessible via service role
-- ============================================

-- Users: Service role only (contains password hashes, user data)
DROP POLICY IF EXISTS "Service role only access to users" ON public.users;
CREATE POLICY "Service role only access to users"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- User Sessions: Service role only (contains tokens)
DROP POLICY IF EXISTS "Service role only access to user_sessions" ON public.user_sessions;
CREATE POLICY "Service role only access to user_sessions"
ON public.user_sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Leads: Service role only (contains PII)
DROP POLICY IF EXISTS "Service role only access to leads" ON public.leads;
CREATE POLICY "Service role only access to leads"
ON public.leads
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Lead Downloads: Service role only
DROP POLICY IF EXISTS "Service role only access to lead_downloads" ON public.lead_downloads;
CREATE POLICY "Service role only access to lead_downloads"
ON public.lead_downloads
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Notifications: Service role only (user-specific data)
DROP POLICY IF EXISTS "Service role only access to notifications" ON public.notifications;
CREATE POLICY "Service role only access to notifications"
ON public.notifications
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Analytics Events: Service role only (contains session_id and tracking data)
-- Note: This table contains sensitive session_id column
DROP POLICY IF EXISTS "Service role only access to analytics_events" ON public.analytics_events;
CREATE POLICY "Service role only access to analytics_events"
ON public.analytics_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- IP Management: Service role only (security data)
DROP POLICY IF EXISTS "Service role only access to ip_management" ON public.ip_management;
CREATE POLICY "Service role only access to ip_management"
ON public.ip_management
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Login Attempts: Service role only (security data)
DROP POLICY IF EXISTS "Service role only access to login_attempts" ON public.login_attempts;
CREATE POLICY "Service role only access to login_attempts"
ON public.login_attempts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 5. PUBLIC INSERT POLICIES (for lead capture)
-- Allow public to insert leads (for contact forms and lead magnets)
-- ============================================

-- Leads: Public can insert (for lead capture forms)
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;
CREATE POLICY "Public can insert leads"
ON public.leads FOR INSERT
TO public
WITH CHECK (true);

-- Lead Downloads: Public can insert (for tracking downloads)
DROP POLICY IF EXISTS "Public can insert lead_downloads" ON public.lead_downloads;
CREATE POLICY "Public can insert lead_downloads"
ON public.lead_downloads FOR INSERT
TO public
WITH CHECK (true);

-- Analytics Events: Public can insert (for tracking page views, etc.)
-- Note: session_id is included but only for tracking purposes
DROP POLICY IF EXISTS "Public can insert analytics_events" ON public.analytics_events;
CREATE POLICY "Public can insert analytics_events"
ON public.analytics_events FOR INSERT
TO public
WITH CHECK (true);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'RLS migration completed successfully!';
  RAISE NOTICE 'Row Level Security has been enabled on all public tables.';
  RAISE NOTICE 'Public read access granted for published content.';
  RAISE NOTICE 'Sensitive tables restricted to service role only.';
  RAISE NOTICE 'Public insert access granted for lead capture and analytics.';
END $$;

