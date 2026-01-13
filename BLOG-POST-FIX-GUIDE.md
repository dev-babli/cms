# Blog Post Creation Fix Guide

## Problem

Blog posts are failing to create with error: "Failed to create blog post"

## Root Cause

The `blog_posts` table is missing the `created_by` column that the API route tries to set when creating blog posts.

## Quick Fix (2 minutes)

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Fix
1. Click **New Query**
2. Copy the contents of `cms/fix-blog-posts-created-by.sql`
3. Paste into SQL Editor
4. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

### Step 3: Verify
You should see: "Blog posts created_by column added successfully!"

### Step 4: Test
Try creating a blog post again - it should work now!

## What This Does

- Adds `created_by TEXT` column to `blog_posts` table
- Creates an index for better query performance
- Safe to run multiple times (uses `IF NOT EXISTS`)

## Alternative: Run via Command Line

If you prefer using Supabase CLI:

```bash
supabase db execute --file cms/fix-blog-posts-created-by.sql
```

## Verification Query

After running the fix, verify the column exists:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'blog_posts' 
AND column_name = 'created_by';
```

You should see:
```
column_name | data_type
------------+----------
created_by  | text
```

## Related Issues

This fix is separate from the RLS migration. The RLS migration (`enable-rls-migration.sql`) should be run separately to address security warnings.

---

**Status**: ✅ Ready to apply
**Time Required**: ~2 minutes
**Risk Level**: Low (adds column only, doesn't modify existing data)

