# 🚀 Supabase Migration Guide

## Why Supabase?

✅ **PostgreSQL** - Production-ready database  
✅ **Free Tier** - 500MB database, 2GB bandwidth/month  
✅ **Vercel Compatible** - Works seamlessly with serverless  
✅ **Easy Setup** - 5-minute setup  
✅ **Connection Pooling** - Built-in for serverless  
✅ **Real-time** - Optional real-time subscriptions  

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Login
3. Click **"New Project"**
4. Fill in:
   - **Name**: `intellectt-cms`
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to your users
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup

---

## Step 2: Get Connection String

1. In Supabase Dashboard, go to **Settings** → **Database**
2. Scroll to **"Connection string"**
3. Select **"URI"** tab
4. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual password

---

## Step 3: Install Dependencies

```bash
cd cms
npm install @supabase/supabase-js pg
npm install --save-dev @types/pg
```

**Remove SQLite:**
```bash
npm uninstall better-sqlite3
```

---

## Step 4: Set Environment Variables

Add to `.env.local` (for local development):
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

Add to **Vercel** (Project Settings → Environment Variables):
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

**⚠️ Security**: Never commit `.env.local` to git!

---

## Step 5: Run Database Migration

1. Go to Supabase Dashboard → **SQL Editor**
2. Run the migration script (see `cms/supabase-migration.sql`)
3. This creates all tables with proper PostgreSQL syntax

---

## Step 6: Update Code

The code has been updated to use PostgreSQL. Key changes:

- `cms/lib/db.ts` - Now uses `pg` (PostgreSQL client)
- All queries updated for PostgreSQL compatibility
- Boolean handling: `0/1` → `true/false`
- Auto-increment: `AUTOINCREMENT` → `SERIAL`

---

## Step 7: Test Locally

```bash
cd cms
npm run dev
```

1. Visit `http://localhost:3001/admin`
2. Login with default admin:
   - Email: `admin@emscale.com`
   - Password: `admin123`
3. Create a test blog post
4. Verify it saves to Supabase

---

## Step 8: Deploy to Vercel

1. Push changes to GitHub
2. Vercel will auto-deploy
3. Make sure `DATABASE_URL` is set in Vercel environment variables
4. Test the deployed CMS

---

## Migration Checklist

- [ ] Supabase project created
- [ ] Connection string obtained
- [ ] Dependencies installed (`pg`, `@supabase/supabase-js`)
- [ ] `better-sqlite3` removed
- [ ] Environment variables set (local + Vercel)
- [ ] Database migration script run in Supabase SQL Editor
- [ ] Code updated (already done)
- [ ] Local testing successful
- [ ] Vercel deployment successful
- [ ] Production testing complete

---

## Troubleshooting

### Connection Error
- Check `DATABASE_URL` is correct
- Verify password is URL-encoded if it contains special characters
- Check Supabase project is active

### Table Not Found
- Run migration script in Supabase SQL Editor
- Check table names match (case-sensitive in PostgreSQL)

### Boolean Issues
- PostgreSQL uses `true/false`, not `0/1`
- Code has been updated to handle this

### Performance
- Supabase has connection pooling built-in
- Free tier: 60 connections max
- Should be fine for CMS usage

---

## Cost Estimate

**Free Tier** (likely sufficient for CMS):
- 500MB database storage
- 2GB bandwidth/month
- Unlimited API requests
- 2 million monthly active users

**Pro Tier** ($25/month) if needed:
- 8GB database storage
- 50GB bandwidth/month
- Daily backups
- Priority support

---

## Next Steps After Migration

1. ✅ Data persistence on Vercel
2. ✅ Production-ready database
3. ✅ Automatic backups (Pro tier)
4. ✅ Can scale as needed
5. ✅ Optional: Enable real-time features
6. ✅ Optional: Use Supabase Auth (replace custom auth)

---

**Ready to migrate? Follow the steps above!** 🚀


