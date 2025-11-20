# 🚀 Quick Start - Supabase Migration

## ✅ Completed

1. ✅ Database wrapper (`lib/db.ts`) - PostgreSQL ready
2. ✅ CMS API functions - Updated to async
3. ✅ Package.json - Dependencies updated

## 📋 Next Steps (Do These Now)

### Step 1: Run Migration Script

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **"New query"**
3. Copy entire contents of `cms/supabase-migration.sql`
4. Paste and click **"Run"**
5. Wait for success message

### Step 2: Create .env.local

Create `cms/.env.local` file:
```env
DATABASE_URL=postgresql://postgres:soumeet%40132006@db.ozxrtdqbcfinrnrdelql.supabase.co:5432/postgres
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3001
```

### Step 3: Install Dependencies

```bash
cd cms
npm install
```

### Step 4: Test

```bash
npm run dev
```

Visit: http://localhost:3001/admin

---

## ⚠️ Known Issues to Fix

1. **auth/users.ts** - Needs async updates (I'll do this next)
2. **SQL syntax** - Some SQLite-specific functions need updating
3. **API routes** - Need `await` added

**But you can test the migration script first!**

---

**Your connection string:**
```
postgresql://postgres:soumeet%40132006@db.ozxrtdqbcfinrnrdelql.supabase.co:5432/postgres
```
