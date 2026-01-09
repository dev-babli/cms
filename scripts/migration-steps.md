# Step-by-Step Migration Guide (Supabase CLI)

Follow these steps to migrate your database using Supabase CLI.

---

## Prerequisites Checklist

- [ ] Node.js installed (for Supabase CLI)
- [ ] Access to **source** Supabase account
- [ ] Access to **target** Supabase account
- [ ] Source project reference ID
- [ ] Target project reference ID (or create new project first)
- [ ] Database passwords for both accounts

---

## Step 1: Install Supabase CLI

### Option A: Using npm (Recommended)
```bash
npm install -g supabase
```

### Option B: Using Homebrew (Mac)
```bash
brew install supabase/tap/supabase
```

### Verify Installation
```bash
supabase --version
```

---

## Step 2: Export from Source Database

### 2.1 Login to Source Account

```bash
supabase login
```

This will open your browser for authentication. Follow the prompts.

### 2.2 Link to Source Project

```bash
supabase link --project-ref YOUR_SOURCE_PROJECT_REF
```

**How to find Project Ref:**
- Go to Source Supabase Dashboard
- Look at the URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
- Or go to Settings → General → Reference ID

### 2.3 Export Schema

```bash
# Create migrations directory if it doesn't exist
mkdir -p supabase/migrations

# Export schema
supabase db dump --schema public -f supabase/migrations/0001_initial_schema.sql
```

**Alternative if above fails:**
```bash
# Get connection string from Source Dashboard → Settings → Database
# Then use pg_dump directly
pg_dump "postgresql://postgres:[PASSWORD]@db.[SOURCE_REF].supabase.co:5432/postgres" \
  --schema-only \
  --no-owner \
  --no-acl \
  -f schema.sql
```

### 2.4 Export Data

```bash
# Export all data
supabase db dump --data-only -f data_dump.sql
```

**Or export specific tables:**
```bash
supabase db dump --data-only \
  --table blog_posts \
  --table users \
  --table categories \
  -f data_dump.sql
```

**Alternative if above fails:**
```bash
pg_dump "postgresql://postgres:[PASSWORD]@db.[SOURCE_REF].supabase.co:5432/postgres" \
  --data-only \
  --no-owner \
  --no-acl \
  -f data_dump.sql
```

### 2.5 Verify Export Files

```bash
# Check file sizes (should not be 0)
ls -lh schema.sql data_dump.sql

# Preview first few lines
head -20 schema.sql
head -20 data_dump.sql
```

---

## Step 3: Create Target Project (if needed)

If you don't have a target project yet:

1. Go to **Target Supabase Dashboard**
2. Click **"New Project"**
3. Fill in:
   - **Name**: Your project name
   - **Database Password**: Set a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. Wait 2-5 minutes for provisioning
6. Note the **Project Reference ID**

---

## Step 4: Import to Target Database

### 4.1 Logout and Login to Target Account

```bash
supabase logout
supabase login
```

Follow browser prompts to authenticate with **target** account.

### 4.2 Link to Target Project

```bash
supabase link --project-ref YOUR_TARGET_PROJECT_REF
```

### 4.3 Import Schema

```bash
# Method 1: Using Supabase CLI (Recommended)
supabase db push

# Or if you have migration files:
supabase migration up
```

**Alternative if above fails:**
```bash
# Get connection string from Target Dashboard → Settings → Database
psql "postgresql://postgres:[TARGET_PASSWORD]@db.[TARGET_REF].supabase.co:5432/postgres" < schema.sql
```

### 4.4 Import Data

```bash
# Get connection string from Target Dashboard → Settings → Database
# Use direct connection
psql "postgresql://postgres:[TARGET_PASSWORD]@db.[TARGET_REF].supabase.co:5432/postgres" < data_dump.sql
```

**If direct connection fails, use pooled connection:**
```bash
# Get region from Target Dashboard → Settings → General
psql "postgresql://postgres.[TARGET_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" < data_dump.sql
```

**Note:** Replace `[PASSWORD]` with URL-encoded password if it contains special characters:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`

---

## Step 5: Verify Migration

### 5.1 Check Tables

```bash
# Connect to target database
psql "postgresql://postgres:[PASSWORD]@db.[TARGET_REF].supabase.co:5432/postgres"

# List all tables
\dt

# Check row counts
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

# Exit
\q
```

### 5.2 Compare Row Counts

Run this query on **both** source and target databases and compare:

```sql
SELECT 
  'blog_posts' as table_name, COUNT(*) as count FROM blog_posts
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'case_studies', COUNT(*) FROM case_studies
UNION ALL
SELECT 'news', COUNT(*) FROM news
UNION ALL
SELECT 'whitepapers', COUNT(*) FROM whitepapers;
```

### 5.3 Test Sample Data

```sql
-- Check a few records
SELECT * FROM blog_posts LIMIT 5;
SELECT * FROM users LIMIT 5;
```

---

## Step 6: Update Application Configuration

### 6.1 Get New API Keys

1. Go to **Target Dashboard** → **Settings** → **API**
2. Copy:
   - **Project URL**: `https://[TARGET_REF].supabase.co`
   - **anon/public key**: For client-side
   - **service_role key**: For server-side (keep secret!)

### 6.2 Update Local Environment

Edit `cms/.env.local`:

```env
# Old (Source)
# NEXT_PUBLIC_SUPABASE_URL=https://[SOURCE_REF].supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=[OLD_KEY]
# DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[SOURCE_REF].supabase.co:5432/postgres

# New (Target)
NEXT_PUBLIC_SUPABASE_URL=https://[TARGET_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[NEW_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[NEW_SERVICE_ROLE_KEY]
DATABASE_URL=postgresql://postgres:[TARGET_PASSWORD]@db.[TARGET_REF].supabase.co:5432/postgres
```

### 6.3 Update Production Environment (Vercel)

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Update:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
3. **Redeploy** your application

### 6.4 Update Code Files (if hardcoded)

Check and update:
- `cms/lib/supabase.ts` (if URLs are hardcoded)
- Any other config files

---

## Step 7: Test Application

1. **Restart local dev server:**
   ```bash
   cd cms
   npm run dev
   ```

2. **Test key functionality:**
   - [ ] Database queries work
   - [ ] Can create/edit blog posts
   - [ ] Can view content
   - [ ] Storage uploads (if using)
   - [ ] Authentication (if using Supabase Auth)

3. **Check for errors:**
   - Browser console
   - Server logs
   - Database connection errors

---

## Troubleshooting

### Issue: "Command not found: supabase"
**Solution:** Make sure npm global bin is in your PATH
```bash
npm config get prefix
# Add to PATH: ~/.npm-global/bin (or similar)
```

### Issue: "Authentication failed"
**Solution:** 
- Make sure you're logged into correct account
- Try `supabase logout` then `supabase login` again

### Issue: "Connection timeout"
**Solution:** Use pooled connection string instead of direct

### Issue: "Permission denied"
**Solution:** 
- Verify database password is correct
- Check if IP is whitelisted (Settings → Database → Connection Pooling)

### Issue: "Foreign key violation"
**Solution:** Import in correct order:
1. Parent tables (users, categories)
2. Child tables (blog_posts, etc.)

---

## Next Steps After Migration

- [ ] Migrate Storage buckets (if using Supabase Storage)
- [ ] Migrate Auth users (if using Supabase Auth)
- [ ] Update DNS/CDN (if using custom domains)
- [ ] Monitor for errors
- [ ] Decommission old project (after verification period)

---

## Quick Reference Commands

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref PROJECT_REF

# Export schema
supabase db dump --schema public -f schema.sql

# Export data
supabase db dump --data-only -f data.sql

# Push schema
supabase db push

# Import data
psql "CONNECTION_STRING" < data.sql
```

---

**Need help?** Check the main migration guide or Supabase documentation!





