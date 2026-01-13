# Row Level Security (RLS) Migration Guide

## Overview

This migration enables Row Level Security (RLS) on all public tables in your Supabase database to address security warnings from the Supabase Database Linter.

## Security Issues Addressed

### 1. RLS Disabled in Public (ERROR)
- **Issue**: Tables in the `public` schema exposed to PostgREST don't have RLS enabled
- **Risk**: Unauthorized access to database tables via the API
- **Solution**: Enable RLS on all public tables and create appropriate policies

### 2. Sensitive Columns Exposed (ERROR)
- **Issue**: Tables with sensitive data (PII, credentials, session data) are exposed without RLS protection
- **Affected Tables**:
  - `analytics_events` (contains `session_id`)
  - `user_sessions` (contains `token`)
- **Solution**: Restrict these tables to service role access only

## Tables Covered

### Public Content Tables (Public Read for Published Content)
- `pages`
- `blog_posts`
- `services`
- `team_members`
- `testimonials`
- `categories`
- `case_studies`
- `ebooks`
- `whitepapers`
- `job_postings`
- `news_announcements`
- `content_categories`
- `media`
- `content_templates`

### Sensitive Tables (Service Role Only)
- `users` (password hashes, user data)
- `user_sessions` (tokens)
- `leads` (PII)
- `lead_downloads`
- `notifications` (user-specific data)
- `analytics_events` (session tracking data)
- `ip_management` (security data)
- `login_attempts` (security data)

## How to Run the Migration

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Migration
1. Click **New Query**
2. Open the file: `cms/enable-rls-migration.sql`
3. Copy the **entire contents** of the file
4. Paste into the Supabase SQL Editor
5. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

### Step 3: Verify Success
You should see:
- ✅ "RLS migration completed successfully!"
- ✅ No errors in the output

### Step 4: Verify RLS is Enabled
Run this query to verify RLS is enabled on all tables:

```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'content_templates', 'media', 'users', 'user_sessions',
    'categories', 'case_studies', 'ebooks', 'whitepapers',
    'leads', 'lead_downloads', 'notifications', 'testimonials',
    'job_postings', 'pages', 'blog_posts', 'services',
    'team_members', 'news_announcements', 'content_categories',
    'analytics_events', 'ip_management', 'login_attempts'
  )
ORDER BY tablename;
```

All tables should show `rls_enabled = true`.

## Security Policies Explained

### Public Content Policies
- **SELECT**: Public can read published content only
- **INSERT/UPDATE/DELETE**: Service role only (backend operations)

### Sensitive Tables Policies
- **ALL Operations**: Service role only
- **Public INSERT**: Allowed for `leads`, `lead_downloads`, and `analytics_events` (for lead capture and tracking)
- **Public SELECT**: Denied (prevents data exposure)

### Service Role Access
- Your Next.js backend uses the `SUPABASE_SERVICE_ROLE_KEY`
- This key bypasses RLS and has full access to all tables
- This is secure because the key is only used server-side

## Important Notes

### 1. Backend Operations Unaffected
- Your Next.js API routes use the service role key
- All backend operations continue to work normally
- RLS only affects direct API access via PostgREST

### 2. Public Content Access
- Published content remains publicly accessible
- Unpublished content is protected
- This matches your existing access patterns

### 3. Lead Capture
- Public can still submit leads via contact forms
- Public can track downloads (insert into `lead_downloads`)
- Public can track analytics events (insert into `analytics_events`)
- But public **cannot read** this data (prevents data exposure)

### 4. Sensitive Data Protection
- `user_sessions.token` - Now protected (service role only)
- `analytics_events.session_id` - Now protected (service role only)
- All user PII in `leads` table - Now protected (service role only)

## Testing After Migration

### Test 1: Public Content Access
```sql
-- Should work (published content)
SELECT * FROM blog_posts WHERE published = true LIMIT 1;

-- Should fail (unpublished content)
SELECT * FROM blog_posts WHERE published = false LIMIT 1;
```

### Test 2: Sensitive Data Protection
```sql
-- Should fail (requires service role)
SELECT * FROM users LIMIT 1;
SELECT * FROM user_sessions LIMIT 1;
SELECT * FROM leads LIMIT 1;
```

### Test 3: Lead Capture Still Works
```sql
-- Should work (public can insert)
INSERT INTO leads (first_name, last_name, email) 
VALUES ('Test', 'User', 'test@example.com');
```

## Troubleshooting

### Issue: "Policy already exists"
- **Solution**: The migration uses `DROP POLICY IF EXISTS`, so this shouldn't happen
- If it does, the policies are already in place - migration is complete

### Issue: "Table does not exist"
- **Solution**: Run `cms/consolidated-migrations.sql` first to create all tables
- Then run this RLS migration

### Issue: Backend operations fail
- **Solution**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in your environment
- Service role bypasses RLS, so backend should work normally

### Issue: Public content not accessible
- **Solution**: Check that content has `published = true`
- Verify the policies were created correctly

## Verification Checklist

After running the migration, verify:

- [ ] RLS is enabled on all 22 tables
- [ ] Public can read published blog posts
- [ ] Public cannot read unpublished content
- [ ] Public cannot read sensitive tables (users, leads, etc.)
- [ ] Public can insert leads (for contact forms)
- [ ] Backend operations still work (using service role)
- [ ] No errors in Supabase Database Linter

## Next Steps

1. **Run the migration** (see Step 2 above)
2. **Verify RLS is enabled** (see Step 4 above)
3. **Test your application** to ensure everything works
4. **Check Supabase Database Linter** - all RLS warnings should be resolved

## Support

If you encounter any issues:
1. Check the Supabase SQL Editor for error messages
2. Verify all tables exist (run `consolidated-migrations.sql` first)
3. Check that your service role key is configured correctly
4. Review the policies in Supabase Dashboard → Authentication → Policies

