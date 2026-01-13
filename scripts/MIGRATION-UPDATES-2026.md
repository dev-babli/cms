# Consolidated Migrations Update Summary - 2026

## Overview
The `consolidated-migrations.sql` file has been reviewed and updated to match all current database requirements from the codebase.

## ✅ Updates Made

### 1. **Team Members Table**
**Added Missing Field:**
- `qualification TEXT` - Used in API for team member qualifications

**Migration Added:**
```sql
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS qualification TEXT;
```

### 2. **Categories Table**
**Added Missing Fields:**
- `content_type TEXT DEFAULT 'blog'` - Supports 'blog', 'ebook', 'case_study', 'whitepaper', 'all'
- `order_index INTEGER DEFAULT 0` - For sorting categories
- `parent_id INTEGER REFERENCES categories(id)` - For hierarchical categories

**Migration Added:**
```sql
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'blog',
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES categories(id);
```

**New Indexes Added:**
- `idx_categories_content_type` - For filtering by content type
- `idx_categories_parent_id` - For hierarchical queries
- `idx_categories_order_index` - For sorting

### 3. **Content Categories Table** (NEW)
**Added Complete Table:**
- Many-to-many relationship between content and categories
- Supports multiple categories per content item

**Table Structure:**
```sql
CREATE TABLE IF NOT EXISTS content_categories (
  id SERIAL PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(content_type, content_id, category_id)
);
```

**Indexes:**
- `idx_content_categories_content` - For content lookups
- `idx_content_categories_category` - For category lookups

### 4. **Analytics Events Table** (NEW)
**Added Complete Table:**
- Tracks analytics events (page views, downloads, form submissions, etc.)
- Flexible JSONB field for custom event data
- UTM parameter tracking

**Table Structure:**
```sql
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  content_type TEXT,
  content_id INTEGER,
  user_id INTEGER REFERENCES users(id),
  session_id TEXT,
  event_name TEXT,
  event_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_analytics_events_content` - For content-based analytics
- `idx_analytics_events_user` - For user-based analytics
- `idx_analytics_events_type` - For event type filtering
- `idx_analytics_events_created_at` - For time-based queries

## 📋 Complete Table List

The consolidated migration now includes:

1. ✅ `pages` - Static pages
2. ✅ `blog_posts` - Blog posts with SEO fields
3. ✅ `services` - Service listings
4. ✅ `team_members` - Team members (with qualification)
5. ✅ `testimonials` - Customer testimonials
6. ✅ `media` - Media library
7. ✅ `users` - User accounts
8. ✅ `user_sessions` - User sessions
9. ✅ `categories` - Categories (with content_type, parent_id, order_index)
10. ✅ `job_postings` - Job postings
11. ✅ `news_announcements` - News & announcements
12. ✅ `ebooks` - eBooks
13. ✅ `case_studies` - Case studies
14. ✅ `whitepapers` - Whitepapers
15. ✅ `leads` - Lead management
16. ✅ `lead_downloads` - Lead download tracking
17. ✅ `notifications` - System notifications
18. ✅ `content_templates` - Content templates
19. ✅ `content_categories` - Content-category mapping (NEW)
20. ✅ `analytics_events` - Analytics tracking (NEW)

## 🔍 Verification

All tables and fields used in:
- `cms/lib/cms/api.ts` ✅
- `cms/lib/cms/types.ts` ✅
- All API routes ✅

## 🚀 Next Steps

1. **Run the Updated Migration:**
   - Copy `consolidated-migrations.sql`
   - Paste into Supabase SQL Editor
   - Run the migration

2. **Verify Tables:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

3. **Test the Application:**
   - All API endpoints should work
   - No "table not found" errors
   - Categories with content_type filtering works
   - Analytics tracking works

## 📝 Notes

- All migrations use `IF NOT EXISTS` - safe to run multiple times
- All ALTER statements use `ADD COLUMN IF NOT EXISTS` - won't fail if column exists
- All indexes use `IF NOT EXISTS` - won't create duplicates
- Foreign key constraints are properly set up
- Triggers for `updated_at` are included for all tables

---

**Last Updated:** January 2026
**Migration Version:** 2026.1.0









