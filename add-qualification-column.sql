-- Add qualification column to team_members table
-- Run this in Supabase SQL Editor

ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS qualification TEXT;

