# 🚀 Supabase Migration Using npx (No Installation Required)

This guide uses `npx` to run Supabase CLI without installing it globally.

---

## Prerequisites

- [x] Node.js installed (you have this!)
- [ ] Access to **source** Supabase account
- [ ] Access to **target** Supabase account
- [ ] Source project reference ID
- [ ] Target project reference ID
- [ ] Database passwords for both accounts

---

## Quick Start (Automated Script)

**Windows PowerShell:**
```powershell
cd cms/scripts
.\migrate-with-npx.ps1
```

The script will guide you through all steps!

---

## Manual Steps

### Step 1: Export from Source Database

#### 1.1 Login to Source Account

```powershell
npx supabase login
```

This opens your browser. Authenticate with your **source** account.

#### 1.2 Link to Source Project

```powershell
npx supabase link --project-ref YOUR_SOURCE_PROJECT_REF
```

**Find Project Ref:**
- Dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
- Or: Settings → General → Reference ID

#### 1.3 Export Schema

```powershell
# Create backup directory
mkdir supabase_backup
cd supabase_backup

# Export schema
npx supabase db dump --schema public -f schema.sql
```

#### 1.4 Export Data

```powershell
# Export all data
npx supabase db dump --data-only -f data.sql
```

**Alternative: Export specific tables only**
```powershell
npx supabase db dump --data-only --table blog_posts --table users -f data.sql
```

---

### Step 2: Create Target Project (if needed)

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

### Step 3: Import to Target Database

#### 3.1 Switch to Target Account

```powershell
# Logout from source
npx supabase logout

# Login to target account
npx supabase login
```

#### 3.2 Link to Target Project

```powershell
npx supabase link --project-ref YOUR_TARGET_PROJECT_REF
```

#### 3.3 Import Schema

```powershell
# Method 1: Using CLI (recommended)
npx supabase db push
```

**Alternative: Direct SQL import**
1. Go to Target Dashboard → SQL Editor
2. Open `schema.sql` file
3. Copy and paste into SQL Editor
4. Click "Run"

#### 3.4 Import Data

**Option A: Using psql (if installed)**

```powershell
# Get connection string from: Settings → Database → Connection string (URI)
psql "postgresql://postgres:[TARGET_PASSWORD]@db.[TARGET_REF].supabase.co:5432/postgres" < data.sql
```

**Option B: Using Supabase Dashboard**

1. Go to Target Dashboard → SQL Editor
2. Open `data.sql` file
3. Copy and paste into SQL Editor
4. Click "Run"

**Option C: Using pooled connection (if direct fails)**

```powershell
# Get region from: Settings → General
psql "postgresql://postgres.[TARGET_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" < data.sql
```

---

## Step 4: Verify Migration

### 4.1 Check Tables

Go to Target Dashboard → Table Editor and verify:
- [ ] All tables exist
- [ ] Row counts match source

### 4.2 Run Verification Query

In Target Dashboard → SQL Editor:

```sql
-- Check row counts
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

Compare with source database.

---

## Step 5: Update Application

### 5.1 Get New API Keys

1. Target Dashboard → Settings → API
2. Copy:
   - **Project URL**: `https://[TARGET_REF].supabase.co`
   - **anon/public key**: For client-side
   - **service_role key**: For server-side (keep secret!)

### 5.2 Update Local Environment

Edit `cms/.env.local`:

```env
# Old (Source)
# NEXT_PUBLIC_SUPABASE_URL=https://[SOURCE_REF].supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=[OLD_KEY]

# New (Target)
NEXT_PUBLIC_SUPABASE_URL=https://[TARGET_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[NEW_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[NEW_SERVICE_ROLE_KEY]
DATABASE_URL=postgresql://postgres:[TARGET_PASSWORD]@db.[TARGET_REF].supabase.co:5432/postgres
```

### 5.3 Update Production (Vercel)

1. Vercel Dashboard → Project → Settings → Environment Variables
2. Update:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
3. **Redeploy** application

---

## Step 6: Test Application

```powershell
cd cms
npm run dev
```

Test:
- [ ] Database queries work
- [ ] Can create/edit blog posts
- [ ] Can view content
- [ ] No connection errors

---

## Troubleshooting

### "npx: command not found"
**Solution:** Make sure Node.js is installed and in PATH

### "Authentication failed"
**Solution:** 
- Make sure you're logged into correct account
- Try: `npx supabase logout` then `npx supabase login` again

### "Connection timeout"
**Solution:** 
- Use pooled connection string
- Or import via Supabase Dashboard SQL Editor

### "Permission denied"
**Solution:** 
- Verify database password is correct
- Check IP whitelist (Settings → Database → Connection Pooling)

### "Foreign key violation"
**Solution:** 
- Import in correct order: parent tables first, then child tables
- Or disable foreign key checks temporarily

---

## Alternative: Using Connection Strings Directly

If npx method doesn't work, you can use connection strings directly:

### Export using pg_dump

```powershell
# Get connection string from: Settings → Database → Connection string (URI)
pg_dump "postgresql://postgres:[PASSWORD]@db.[SOURCE_REF].supabase.co:5432/postgres" `
  --schema-only --no-owner --no-acl -f schema.sql

pg_dump "postgresql://postgres:[PASSWORD]@db.[SOURCE_REF].supabase.co:5432/postgres" `
  --data-only --no-owner --no-acl -f data.sql
```

### Import using psql

```powershell
psql "postgresql://postgres:[PASSWORD]@db.[TARGET_REF].supabase.co:5432/postgres" < schema.sql
psql "postgresql://postgres:[PASSWORD]@db.[TARGET_REF].supabase.co:5432/postgres" < data.sql
```

**Note:** Requires PostgreSQL client tools (`pg_dump` and `psql`)

---

## Next Steps

- [ ] Migrate Storage buckets (if using Supabase Storage)
- [ ] Migrate Auth users (if using Supabase Auth)
- [ ] Update DNS/CDN (if using custom domains)
- [ ] Monitor for errors
- [ ] Decommission old project (after verification)

---

## Quick Reference

```powershell
# Login
npx supabase login

# Link to project
npx supabase link --project-ref PROJECT_REF

# Export schema
npx supabase db dump --schema public -f schema.sql

# Export data
npx supabase db dump --data-only -f data.sql

# Push schema
npx supabase db push

# Import data (via Dashboard SQL Editor or psql)
```

---

**Ready to start?** Run `.\migrate-with-npx.ps1` or follow the manual steps above!





