# Quick Fix: Missing Database Tables

## Problem
You're getting "Database Table Not Found" error because the `blog_posts` table doesn't exist in your Supabase database.

## Solution: Run Migrations in Supabase

### Option 1: Run Full Migration (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to **SQL Editor**

2. **Run the Consolidated Migration**
   - Open `cms/consolidated-migrations.sql` in your editor
   - Copy the entire file content
   - Paste it into the Supabase SQL Editor
   - Click **Run** or press `Ctrl+Enter`

3. **Verify Tables Created**
   - Go to **Table Editor** in Supabase
   - You should see `blog_posts` and other tables

### Option 2: Create Only blog_posts Table (Quick Fix)

If you only need the blog_posts table right now, run this SQL in Supabase SQL Editor:

```sql
-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  author TEXT,
  featured_image TEXT,
  banner_image TEXT,
  category TEXT,
  tags TEXT,
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
  custom_tracking_script TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on slug
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at 
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Option 3: Use Node Script (Alternative)

If you prefer to run it from your local machine:

```bash
# Install tsx if not already installed
npm install -g tsx

# Run the check script
npx tsx scripts/check-and-create-tables.ts
```

## After Running Migrations

1. **Restart your dev server** if it's running:
   ```bash
   npm run dev
   ```

2. **Test the blog page** - it should now work without errors

## Verify Tables Exist

You can verify tables exist by running this in Supabase SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%blog%';
```

You should see `blog_posts` in the results.

## Need Help?

If you still get errors:
1. Check your `DATABASE_URL` in `.env.local` is correct
2. Verify you're connected to the right Supabase project
3. Check Supabase project logs for any errors





