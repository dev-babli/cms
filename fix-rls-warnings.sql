-- Fix RLS Security Warnings
-- This script addresses the remaining security warnings from Supabase Database Linter
-- Run this in Supabase SQL Editor after running enable-rls-migration.sql

-- ============================================
-- 1. FIX FUNCTION SEARCH_PATH SECURITY ISSUE
-- ============================================

-- Recreate the function with a fixed search_path to prevent search_path injection attacks
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- ============================================
-- 2. FIX OVERLY PERMISSIVE INSERT POLICIES
-- Make INSERT policies more restrictive while still allowing public inserts
-- ============================================

-- Leads: Public can insert but with basic validation
-- Require at least first_name and email (required fields)
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;
CREATE POLICY "Public can insert leads"
ON public.leads FOR INSERT
TO public
WITH CHECK (
  first_name IS NOT NULL 
  AND first_name != '' 
  AND email IS NOT NULL 
  AND email != ''
);

-- Lead Downloads: Public can insert but require lead_id, content_type, and content_id
DROP POLICY IF EXISTS "Public can insert lead_downloads" ON public.lead_downloads;
CREATE POLICY "Public can insert lead_downloads"
ON public.lead_downloads FOR INSERT
TO public
WITH CHECK (
  lead_id IS NOT NULL 
  AND content_type IS NOT NULL 
  AND content_type != ''
  AND content_id IS NOT NULL
);

-- Analytics Events: Public can insert but require event_type
DROP POLICY IF EXISTS "Public can insert analytics_events" ON public.analytics_events;
CREATE POLICY "Public can insert analytics_events"
ON public.analytics_events FOR INSERT
TO public
WITH CHECK (
  event_type IS NOT NULL 
  AND event_type != ''
);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'RLS warnings fixed successfully!';
  RAISE NOTICE 'Function search_path secured.';
  RAISE NOTICE 'INSERT policies made more restrictive with validation.';
END $$;

