# Fix: scheduled_publish_date Column Missing

## Error
```
Failed to create post: Database error: column "scheduled_publish_date" of relation "blog_posts" does not exist
```

## Solution

The `scheduled_publish_date` column is missing from your database. Here are two ways to fix it:

### Option 1: Run SQL Migration (Recommended - Fastest)

1. **Go to Supabase Dashboard:**
   - Open your Supabase project
   - Navigate to **SQL Editor**
   - Click **"New query"**

2. **Run this SQL (safe version - only adds to existing tables):**
   ```sql
   -- Add to blog_posts (required)
   ALTER TABLE blog_posts 
   ADD COLUMN IF NOT EXISTS scheduled_publish_date TIMESTAMP;
   ```

   **OR use the full migration file** (`cms/add-scheduled-publish-date.sql`) which safely handles tables that don't exist yet.

4. **Click "Run"** (or press Ctrl+Enter)

5. **Verify:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'blog_posts' 
   AND column_name = 'scheduled_publish_date';
   ```

### Option 2: Run Migration Script

1. **Make sure you're in the CMS directory:**
   ```bash
   cd cms
   ```

2. **Run the migration script:**
   ```bash
   npm run db:add-scheduled-date
   ```

   Or directly:
   ```bash
   node scripts/add-scheduled-publish-date.js
   ```

### Option 3: Run All Migrations

If you want to run all pending migrations:

```bash
cd cms
npm run db:migrate
```

This will run all migrations including the `scheduled_publish_date` column.

## Quick Fix SQL (Copy & Paste)

**Simple version (just blog_posts - recommended):**

```sql
-- Add scheduled_publish_date to blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS scheduled_publish_date TIMESTAMP;

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'blog_posts' 
AND column_name = 'scheduled_publish_date';
```

**Full version (handles all tables safely):**

Use the file `cms/add-scheduled-publish-date.sql` which includes conditional logic to only add columns to tables that exist.

## After Running Migration

1. **Try creating a blog post again** in the CMS
2. The error should be gone
3. You can now use the scheduled publishing feature

## What This Column Does

The `scheduled_publish_date` column allows you to:
- Schedule blog posts to be published at a future date/time
- The cron job (`/api/cron/publish-scheduled`) will automatically publish posts when the scheduled date arrives

## Need Help?

If you still get errors:
1. Check that `DATABASE_URL` is set correctly in your environment
2. Verify you have write permissions on the database
3. Check Supabase logs for any connection issues

