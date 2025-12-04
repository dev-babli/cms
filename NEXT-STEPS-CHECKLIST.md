# ✅ Next Steps Checklist - Supabase Auth Setup

## 🎯 Complete These Steps in Order

### ✅ Step 1: Get Service Role Key

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Select project: `ozxrtdqbcfinrnrdelql`

2. **Get Service Role Key**
   - Settings → API
   - Find "service_role" key
   - Click "Reveal" or "Copy"
   - **Save it somewhere safe!**

---

### ✅ Step 2: Add Environment Variables (Local)

**Edit `cms/.env.local`:**

```env
# Supabase (Private - server-side)
SUPABASE_URL=https://ozxrtdqbcfinrnrdelql.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database (Private)
DATABASE_URL=postgresql://postgres.ozxrtdqbcfinrnrdelql:soumeet%40132006@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

# NextAuth (Private)
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3001
```

**Generate NEXTAUTH_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

### ✅ Step 3: Run Database Migration

**Go to Supabase Dashboard → SQL Editor:**

Run this SQL:
```sql
-- Add supabase_user_id column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS supabase_user_id UUID;

-- Create index
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_user_id);
```

**Or copy from:** `cms/supabase-auth-migration.sql`

---

### ✅ Step 4: Enable Supabase Auth

1. **Go to Supabase Dashboard**
2. **Authentication** → **Settings**
3. **Enable:**
   - ✅ Enable email signup
   - ✅ Enable email login
   - ✅ Email confirmation (optional - can disable for testing)

---

### ✅ Step 5: Test Locally

1. **Start dev server:**
   ```bash
   cd cms
   npm run dev
   ```

2. **Test Registration:**
   - Go to: http://localhost:3001/auth/register
   - Create a test account
   - Check Supabase Dashboard → Auth → Users
   - Should see new user!

3. **Test Admin Approval:**
   - Login as admin
   - Go to `/admin/users`
   - See pending user
   - Click "Approve"

4. **Test Login:**
   - User tries to login
   - Should work after approval!

---

### ✅ Step 6: Add to Vercel

1. **Go to Vercel Dashboard**
2. **Settings** → **Environment Variables**
3. **Add all variables:**
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (private)
   - `DATABASE_URL` (private)
   - `NEXTAUTH_SECRET` (private)
   - `NEXTAUTH_URL` (private)
4. **Select:** Production, Preview, Development
5. **Save**

---

### ✅ Step 7: Deploy & Test

1. **Push to Git:**
   ```bash
   git add .
   git commit -m "Add Supabase Auth integration"
   git push
   ```

2. **Vercel auto-deploys**

3. **Test on production:**
   - Register new user
   - Admin approves
   - User logs in

---

## 🎯 Current Status

- ✅ Code updated for Supabase Auth
- ✅ Service Role Key support added
- ⏳ Need: Environment variables
- ⏳ Need: Database migration
- ⏳ Need: Enable Supabase Auth
- ⏳ Need: Test everything

---

## 📝 Quick Reference

**Files to check:**
- `cms/lib/supabase.ts` - Supabase client
- `cms/app/api/auth/register/route.ts` - Registration
- `cms/app/api/auth/login/route.ts` - Login
- `cms/supabase-auth-migration.sql` - Database migration

**Documentation:**
- `cms/QUICK-SUPABASE-AUTH-SETUP.md` - Quick guide
- `cms/GET-SERVICE-ROLE-KEY.md` - How to get key
- `cms/SUPABASE-KEYS-EXPLAINED.md` - Key security

---

**Start with Step 1: Get Service Role Key!** 🔐


