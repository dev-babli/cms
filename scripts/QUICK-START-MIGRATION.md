# 🚀 Quick Start: Supabase Database Migration

## Prerequisites

Before starting, make sure you have:
- [ ] Node.js installed
- [ ] Access to **source** Supabase account
- [ ] Access to **target** Supabase account (or create new project)
- [ ] Source project reference ID
- [ ] Target project reference ID
- [ ] Database passwords for both accounts

---

## Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

---

## Step 2: Export from Source

### 2.1 Login and Link

```bash
# Login to source account
supabase login

# Link to source project (replace with your source project ref)
supabase link --project-ref YOUR_SOURCE_PROJECT_REF
```

**Find Project Ref:**
- Dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
- Or: Settings → General → Reference ID

### 2.2 Export Schema and Data

```bash
# Create backup directory
mkdir supabase_backup
cd supabase_backup

# Export schema
supabase db dump --schema public -f schema.sql

# Export data
supabase db dump --data-only -f data.sql
```

**If CLI export fails**, use pg_dump directly:
```bash
# Get connection string from: Settings → Database → Connection string (URI)
pg_dump "postgresql://postgres:[PASSWORD]@db.[SOURCE_REF].supabase.co:5432/postgres" \
  --schema-only --no-owner --no-acl -f schema.sql

pg_dump "postgresql://postgres:[PASSWORD]@db.[SOURCE_REF].supabase.co:5432/postgres" \
  --data-only --no-owner --no-acl -f data.sql
```

---

## Step 3: Create Target Project (if needed)

1. Go to **Target Supabase Dashboard**
2. Click **"New Project"**
3. Set name, password, region
4. Wait 2-5 minutes
5. Note the **Project Reference ID**

---

## Step 4: Import to Target

### 4.1 Switch Accounts

```bash
# Logout from source
supabase logout

# Login to target account
supabase login

# Link to target project
supabase link --project-ref YOUR_TARGET_PROJECT_REF
```

### 4.2 Import Schema

```bash
# Method 1: Using CLI (recommended)
supabase db push

# Method 2: Direct import
psql "postgresql://postgres:[TARGET_PASSWORD]@db.[TARGET_REF].supabase.co:5432/postgres" < schema.sql
```

### 4.3 Import Data

```bash
# Get connection string from: Settings → Database → Connection string (URI)
psql "postgresql://postgres:[TARGET_PASSWORD]@db.[TARGET_REF].supabase.co:5432/postgres" < data.sql
```

**If direct connection fails**, use pooled connection:
```bash
# Get region from: Settings → General
psql "postgresql://postgres.[TARGET_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" < data.sql
```

---

## Step 5: Verify Migration

```bash
# Connect to target database
psql "postgresql://postgres:[PASSWORD]@db.[TARGET_REF].supabase.co:5432/postgres"

# Check tables
\dt

# Check row counts
SELECT tablename, n_live_tup as row_count 
FROM pg_stat_user_tables 
ORDER BY n_live_tup DESC;

# Exit
\q
```

---

## Step 6: Update Application

### 6.1 Get New API Keys

1. Target Dashboard → Settings → API
2. Copy:
   - Project URL
   - anon/public key
   - service_role key

### 6.2 Update Environment Variables

**Local (`cms/.env.local`):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://[TARGET_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[NEW_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[NEW_SERVICE_ROLE_KEY]
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[TARGET_REF].supabase.co:5432/postgres
```

**Vercel/Production:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Update all Supabase variables
3. Redeploy

---

## Step 7: Test

```bash
cd cms
npm run dev
```

Test:
- [ ] Database queries work
- [ ] Can create/edit content
- [ ] Can view content
- [ ] No connection errors

---

## Troubleshooting

### "Command not found: supabase"
```bash
npm install -g supabase
# Make sure npm global bin is in PATH
```

### "Connection timeout"
Use pooled connection string instead of direct

### "Permission denied"
- Verify password is correct
- Check IP whitelist (Settings → Database → Connection Pooling)

### "Foreign key violation"
Import in order: parent tables first, then child tables

---

## Automated Scripts

We've created automated scripts for you:

**Windows (PowerShell):**
```powershell
cd cms/scripts
.\migrate-database.ps1
```

**Mac/Linux (Bash):**
```bash
cd cms/scripts
chmod +x migrate-database.sh
./migrate-database.sh
```

---

## Need More Details?

See:
- `migration-steps.md` - Detailed step-by-step guide
- `SUPABASE-ACCOUNT-MIGRATION-GUIDE.md` - Complete reference

---

**Ready to start?** Run the commands above or use the automated scripts!





