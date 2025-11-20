# 🔐 Supabase Auth Setup - Complete Guide

## ✅ Package Installed!

`@supabase/supabase-js` is now installed.

---

## 📋 Setup Steps

### Step 1: Add Environment Variables

Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ozxrtdqbcfinrnrdelql.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96eHJ0ZHFiY2ZpbnJucmRlbHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MjMwNTUsImV4cCI6MjA3OTE5OTA1NX0.8KTH-xqsOe8SfReUE-dEGd3wvQZ-a949TfFUtOztlnQ
```

**For Vercel:**
- Add same variables in Vercel Dashboard → Environment Variables

---

### Step 2: Run Database Migration

Run this SQL in Supabase SQL Editor:
```sql
-- Add supabase_user_id column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS supabase_user_id UUID;

-- Create index
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_user_id);
```

**Or use:** `cms/supabase-auth-migration.sql`

---

### Step 3: Enable Supabase Auth

1. **Go to Supabase Dashboard**
2. **Authentication** → **Settings**
3. **Enable Email Auth:**
   - ✅ Enable email signup
   - ✅ Enable email login
   - ✅ Enable email confirmation (optional)

4. **Configure Email Templates:**
   - Go to **Authentication** → **Email Templates**
   - Customize if needed

---

## 🔄 How It Works Now

### Registration Flow:
1. User signs up → **Supabase Auth** creates secure account
2. Create custom user with `status: 'pending'` + `supabase_user_id`
3. Admin approves → User can login
4. Login uses **Supabase Auth** (secure)

### Login Flow:
1. User logs in → **Supabase Auth** validates credentials
2. Check custom table for approval status
3. If approved → Allow access
4. If pending → Block with message

---

## ✅ Benefits You Get

- ✅ **Better Security** - Managed by Supabase
- ✅ **Password Reset** - Built-in, secure
- ✅ **Email Verification** - Built-in
- ✅ **Admin Approval** - Still works!
- ✅ **Custom Roles** - Still works!
- ✅ **OAuth Ready** - Easy to add later

---

## 🧪 Testing

### Test Registration:
1. Go to `/auth/register`
2. Create account
3. Check Supabase Dashboard → Authentication → Users
4. Check custom `users` table (should have `supabase_user_id`)

### Test Login:
1. Admin approves user
2. User logs in
3. Should work with Supabase Auth

---

## 🔧 Next Steps

1. ✅ Add environment variables
2. ✅ Run database migration
3. ✅ Enable Supabase Auth
4. ✅ Test registration
5. ✅ Test login
6. ✅ Migrate existing users (if needed)

---

## 📝 Migration for Existing Users

If you have existing users, you'll need to:
1. Create Supabase Auth accounts for them
2. Link with `supabase_user_id`
3. Use migration script (I can create this)

---

**Your CMS is now using Supabase Auth for better security!** 🔐

