# Fixing Database Query Error

## Error Description
The error `Query error {}` occurs when trying to fetch a blog post by slug. This typically happens due to:

1. **Missing DATABASE_URL** - The environment variable is not set
2. **Table doesn't exist** - The `blog_posts` table hasn't been created
3. **Connection issues** - Database connection is failing

## What I've Fixed

### 1. Enhanced Error Handling
- Added better error logging with full error details
- Added checks for DATABASE_URL before attempting queries
- Improved error messages for common issues (authentication, table not found, timeouts)

### 2. Better Error Messages
The error handler now provides:
- Full error message
- Error code
- Database detail and hint (if available)
- Connection string (masked for security)

### 3. Connection Pool Initialization
- Added lazy initialization of the connection pool
- Better error handling during pool creation

## How to Fix

### Step 1: Check DATABASE_URL
Make sure your `DATABASE_URL` environment variable is set in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Ensure `DATABASE_URL` is set with format:
   ```
   postgresql://user:password@host:port/database
   ```

### Step 2: Verify Database Tables Exist
The `blog_posts` table needs to exist. Check your Supabase database:

1. Go to Supabase Dashboard → SQL Editor
2. Run this query to check if table exists:
   ```sql
   SELECT EXISTS (
     SELECT FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name = 'blog_posts'
   );
   ```

### Step 3: Create Tables if Missing
If the table doesn't exist, create it:

```sql
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  author VARCHAR(255),
  featured_image TEXT,
  category VARCHAR(255),
  tags TEXT,
  published BOOLEAN DEFAULT false,
  publish_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
```

### Step 4: Test the Connection
After fixing the above, the error should be resolved. The improved error handling will now show you exactly what's wrong if there are still issues.

## Common Error Messages and Solutions

### "DATABASE_URL environment variable is not set"
**Solution:** Set the DATABASE_URL in Vercel environment variables

### "relation 'blog_posts' does not exist"
**Solution:** Run the CREATE TABLE SQL above

### "password authentication failed"
**Solution:** Check your DATABASE_URL password is correct

### "Connection timeout"
**Solution:** 
- Check your network connection
- If using Supabase, try the pooler connection (port 6543)
- Verify your database is accessible

## Next Steps

After fixing the database connection:
1. The blog post page should load correctly
2. You can create blog posts via the admin interface
3. All database queries should work properly

If you're still seeing errors, check the console logs - they now provide much more detailed information about what's failing.


