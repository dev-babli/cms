# Complete Database Setup Guide

## Overview

This guide will help you set up all required database tables for the CMS, including:
- ✅ Blog Posts (with scheduled_publish_date)
- ✅ eBooks (lead magnets)
- ✅ Case Studies (lead magnets)
- ✅ Whitepapers (lead magnets)
- ✅ Categories
- ✅ Leads (for lead capture)
- ✅ All required indexes

## Step 1: Run Complete Migration

### Option A: Run All-in-One Migration (Recommended)

1. **Go to Supabase Dashboard:**
   - Open your Supabase project
   - Navigate to **SQL Editor**
   - Click **"New query"**

2. **Run the complete migration:**
   - Open file: `cms/supabase-migration-v2-lead-magnets.sql`
   - Copy the **entire contents**
   - Paste into Supabase SQL Editor
   - Click **"Run"** (or press Ctrl+Enter)

This will create:
- ✅ All content tables (ebooks, case_studies, whitepapers)
- ✅ All SEO fields
- ✅ Lead capture tables
- ✅ Categories and content-category mapping
- ✅ Analytics tables
- ✅ All indexes

### Option B: Quick Setup (Just eBooks + scheduled_publish_date)

If you just need to fix the immediate issue:

1. **Run this SQL in Supabase SQL Editor:**

```sql
-- Create eBooks table
CREATE TABLE IF NOT EXISTS ebooks (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  description TEXT,
  content TEXT,
  cover_image TEXT,
  pdf_url TEXT,
  pdf_size INTEGER,
  author TEXT,
  category_id INTEGER REFERENCES categories(id),
  category_ids TEXT,
  tags TEXT,
  featured BOOLEAN DEFAULT false,
  gated BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  publish_date TIMESTAMP,
  scheduled_publish_date TIMESTAMP,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  canonical_url TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_type TEXT DEFAULT 'book',
  schema_markup TEXT,
  google_analytics_id TEXT,
  custom_tracking_script TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id)
);

-- Add scheduled_publish_date to blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS scheduled_publish_date TIMESTAMP;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ebooks_slug ON ebooks(slug);
CREATE INDEX IF NOT EXISTS idx_ebooks_published ON ebooks(published);
```

Or use the file: `cms/create-ebooks-tables.sql`

## Step 2: Verify Tables Were Created

Run this SQL to check:

```sql
SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name IN ('blog_posts', 'ebooks', 'case_studies', 'whitepapers')
GROUP BY table_name
ORDER BY table_name;
```

You should see:
- ✅ `blog_posts` - exists
- ✅ `ebooks` - exists (if you ran the migration)
- ✅ `case_studies` - exists (if you ran the migration)
- ✅ `whitepapers` - exists (if you ran the migration)

## Step 3: Verify scheduled_publish_date Column

```sql
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE column_name = 'scheduled_publish_date'
ORDER BY table_name;
```

Should show `scheduled_publish_date` in:
- ✅ `blog_posts`
- ✅ `ebooks` (if table exists)
- ✅ `case_studies` (if table exists)
- ✅ `whitepapers` (if table exists)

## What Each Table Does

### eBooks
- Lead magnets for capturing leads
- PDF downloads with gated access
- SEO fields for optimization
- Analytics tracking

### Case Studies
- Client success stories
- Challenge/Solution/Results format
- Gated downloads for lead capture

### Whitepapers
- In-depth research documents
- PDF downloads
- Lead capture functionality

### Blog Posts
- Regular blog content
- SEO optimized
- Scheduled publishing support

## Troubleshooting

### Error: "relation 'categories' does not exist"

Run the base migration first:
- File: `cms/supabase-migration.sql`
- This creates the `categories` table

### Error: "relation 'users' does not exist"

The `users` table should be created by Supabase Auth automatically. If not:
- Check Supabase Auth is enabled
- Or remove the `created_by INTEGER REFERENCES users(id)` line temporarily

### Error: "column already exists"

That's okay! The `IF NOT EXISTS` clauses prevent errors. The migration is idempotent (safe to run multiple times).

## Next Steps

After running the migration:

1. ✅ Try creating a blog post - should work now
2. ✅ Try creating an eBook - should work now
3. ✅ Check the CMS admin - all modules should be accessible
4. ✅ Test lead capture forms - should work with eBooks/Case Studies/Whitepapers

## Files Reference

- `cms/supabase-migration-v2-lead-magnets.sql` - Complete migration (all tables)
- `cms/create-ebooks-tables.sql` - Quick setup (just eBooks + scheduled_publish_date)
- `cms/add-scheduled-publish-date.sql` - Just adds scheduled_publish_date column

