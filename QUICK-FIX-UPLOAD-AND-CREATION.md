# Quick Fix: Upload & Content Creation Issues

## 🚨 Immediate Fixes Required

### Step 1: Run Database Fixes (2 minutes)

1. **Open Supabase Dashboard** → **SQL Editor**
2. **Run this SQL** (copy from `cms/fix-all-creation-issues.sql`):

```sql
-- Add created_by column to blog_posts
ALTER TABLE IF EXISTS public.blog_posts 
ADD COLUMN IF NOT EXISTS created_by TEXT;

CREATE INDEX IF NOT EXISTS idx_blog_posts_created_by ON public.blog_posts(created_by);

-- Ensure media table exists
CREATE TABLE IF NOT EXISTS public.media (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT,
  url TEXT NOT NULL,
  mime_type TEXT,
  size INTEGER,
  alt_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add custom_tracking_script if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'custom_tracking_script'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN custom_tracking_script TEXT;
  END IF;
END $$;
```

### Step 2: Verify Supabase Storage

1. Go to **Supabase Dashboard** → **Storage**
2. Check if `cms-media` bucket exists
3. If missing, create it:
   - Name: `cms-media`
   - Public: ✅ Checked
   - MIME types: Leave empty (allows all)

### Step 3: Check Environment Variables

Verify these are set in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
DATABASE_URL=your_connection_string
```

## ✅ Code Fixes Applied

The following have been fixed:
- ✅ Blog post creation - Now uses PostgreSQL syntax directly
- ✅ Job posting creation - Fixed
- ✅ Page creation - Fixed
- ✅ Category creation - Fixed
- ✅ Content category mapping - Fixed

## Test After Fixes

1. **Create a blog post** - Should work now
2. **Upload an image** - Should work now
3. **Create other content** - Should work now

## Still Failing?

Check the browser console (F12) for the exact error message and share it.

---

**Time Required**: 2 minutes
**Files to Run**: `cms/fix-all-creation-issues.sql`

