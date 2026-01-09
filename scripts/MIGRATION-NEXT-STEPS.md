# 🎯 Migration Next Steps - You're at Step 3!

## ✅ What's Done

- [x] **Step 1**: Supabase CLI checked/installed
- [x] **Step 2**: Data exported from SOURCE database
  - Backup location: `supabase_backup_20260105_193147`
  - Files created: `schema.sql` and `data.sql`

## 📋 What You Need Now

The script is waiting for you to provide:

1. **TARGET Project Reference ID**
   - Go to your **target** Supabase Dashboard
   - Look at the URL: `https://supabase.com/dashboard/project/YOUR_TARGET_PROJECT_REF`
   - Or: Settings → General → Reference ID
   - **Example**: `abcdefghijklmnop`

2. **TARGET Database Password**
   - The password you set when creating the target project
   - Or reset it: Settings → Database → Reset database password

## 🚀 Continue in Terminal

The script is waiting for your input. In the terminal where the script is running:

1. **Enter TARGET project reference ID** when prompted
2. **Enter TARGET database password** when prompted (it will be hidden for security)

## 📝 Step-by-Step Instructions

### If You Have Target Project Already:

1. **In the terminal**, enter your target project reference ID
2. **Enter your target database password** (hidden input)
3. The script will:
   - Logout from source account
   - Login to target account (browser will open)
   - Link to target project
   - Push schema
   - Import data

### If You Need to Create Target Project:

**STOP the script** (Ctrl+C) and:

1. **Create new project**:
   - Go to target Supabase account dashboard
   - Click "New Project"
   - Fill in:
     - **Name**: Your project name
     - **Database Password**: Set a strong password (save it!)
     - **Region**: Choose closest to your users
   - Click "Create new project"
   - Wait 2-5 minutes

2. **Get Project Reference ID**:
   - From the dashboard URL or Settings → General

3. **Restart the script**:
   ```powershell
   cd cms/scripts
   .\migrate-with-npx.ps1
   ```
   - When it asks for source info, enter the same values
   - When it asks for target info, enter the NEW project details

## 🔄 Alternative: Manual Import (If Script Fails)

If the script fails or you prefer manual control:

### Option 1: Using Supabase Dashboard

1. **Import Schema**:
   - Go to Target Dashboard → SQL Editor
   - Open `supabase_backup_20260105_193147/schema.sql`
   - Copy all content
   - Paste into SQL Editor
   - Click "Run"

2. **Import Data**:
   - Go to Target Dashboard → SQL Editor
   - Open `supabase_backup_20260105_193147/data.sql`
   - Copy all content
   - Paste into SQL Editor
   - Click "Run"

### Option 2: Using psql (if installed)

```powershell
# Get connection string from: Settings → Database → Connection string (URI)
$targetConn = "postgresql://postgres:[PASSWORD]@db.[TARGET_REF].supabase.co:5432/postgres"

# Import schema
Get-Content "supabase_backup_20260105_193147\schema.sql" | psql $targetConn

# Import data
Get-Content "supabase_backup_20260105_193147\data.sql" | psql $targetConn
```

## ✅ Verification After Import

1. **Check tables**:
   - Target Dashboard → Table Editor
   - Verify all tables exist

2. **Check row counts**:
   - Target Dashboard → SQL Editor
   - Run:
   ```sql
   SELECT 
     'blog_posts' as table_name, COUNT(*) as count FROM blog_posts
   UNION ALL
   SELECT 'users', COUNT(*) FROM users
   UNION ALL
   SELECT 'categories', COUNT(*) FROM categories;
   ```

3. **Compare with source**:
   - Run same query on source database
   - Row counts should match

## 🐛 Troubleshooting

### "Authentication failed"
- Make sure you're logged into the correct Supabase account
- Try: `npx supabase logout` then `npx supabase login`

### "Connection timeout"
- Use Supabase Dashboard SQL Editor instead
- Or use pooled connection string

### "Permission denied"
- Verify database password is correct
- Check IP whitelist (Settings → Database → Connection Pooling)

### "Foreign key violation"
- Import schema first, then data
- Or import via Dashboard SQL Editor (handles order automatically)

## 📚 Files Created

Your backup files are in:
- `supabase_backup_20260105_193147/schema.sql` - Database structure
- `supabase_backup_20260105_193147/data.sql` - All your data

**Keep these files safe!** You can use them to restore if needed.

---

## 🎯 Current Status

**You are here:** Step 3 - Waiting for target database credentials

**Next:** Enter target project reference ID and password in the terminal

**After that:** Script will automatically import everything!

---

**Ready to continue?** Go back to your terminal and enter the requested information!





