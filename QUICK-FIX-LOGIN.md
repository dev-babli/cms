# 🚨 Quick Fix: Can't Login on Vercel

## Most Common Issue: Admin User Not in Supabase Auth

The login uses **Supabase Auth**, so the admin user must exist in Supabase Auth, not just the database.

---

## ✅ Quick Fix (5 minutes)

### Step 1: Create Admin in Supabase Auth

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Select your project

2. **Go to Authentication → Users:**
   - Click "Add User" → "Create new user"
   - Email: `admin@emscale.com`
   - Password: `admin123` (or your password)
   - **Auto Confirm Email:** ✅ Yes (important!)
   - Click "Create User"

3. **Copy the User ID:**
   - After creating, you'll see the user
   - Copy the **User ID** (UUID format)

### Step 2: Link User in Database

1. **Go to Supabase Dashboard → SQL Editor**

2. **Run this SQL:**
   ```sql
   -- Update admin user to link with Supabase Auth
   UPDATE users 
   SET supabase_user_id = 'PASTE-USER-ID-HERE',
       status = 'active',
       email_verified = true
   WHERE email = 'admin@emscale.com';
   ```

3. **Replace `PASTE-USER-ID-HERE`** with the User ID from Step 1

### Step 3: Test Login

1. Visit: `https://your-cms.vercel.app/auth/login`
2. Email: `admin@emscale.com`
3. Password: `admin123`
4. Should work now! ✅

---

## 🔧 Alternative: Use Script (If you have local access)

If you can run scripts locally with environment variables:

```bash
cd cms
node scripts/create-admin-supabase.js
```

This will:
- Create admin in Supabase Auth
- Link with database
- Set status to active

---

## 🐛 Still Not Working?

### Check 1: Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

**Required:**
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (Private)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` (Public)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Public)
- ✅ `DATABASE_URL` (Private)

**Fix:** Add missing variables and redeploy

### Check 2: User Status

Run in Supabase SQL Editor:
```sql
SELECT email, status, supabase_user_id, role 
FROM users 
WHERE email = 'admin@emscale.com';
```

**Should show:**
- `status` = `active`
- `supabase_user_id` = (UUID, not null)
- `role` = `admin`

**Fix:** If status is `pending`, run:
```sql
UPDATE users SET status = 'active' WHERE email = 'admin@emscale.com';
```

### Check 3: Supabase Auth User Exists

In Supabase Dashboard → Authentication → Users:
- Check if `admin@emscale.com` exists
- Check if email is confirmed (green checkmark)

**Fix:** If not confirmed, click "Confirm Email" or recreate with "Auto Confirm" enabled

### Check 4: Vercel Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click latest deployment → Functions
3. Check `/api/auth/login` for errors

**Common errors:**
- "Invalid login credentials" → User not in Supabase Auth
- "User not found" → User not in database
- "Account not active" → Status is not 'active'

---

## 📋 Complete Checklist

- [ ] Admin user created in Supabase Auth
- [ ] Email confirmed in Supabase Auth
- [ ] User linked in database (`supabase_user_id` set)
- [ ] User status is `active` in database
- [ ] All environment variables set in Vercel
- [ ] Redeployed after adding variables
- [ ] Tested login with correct credentials

---

## 🎯 Most Likely Solution

**90% of login issues are because:**
1. Admin user doesn't exist in Supabase Auth
2. User exists but email not confirmed
3. User not linked in database (`supabase_user_id` is null)

**Fix:** Follow Step 1 and Step 2 above!

---

**Need more help?** Check `cms/FIX-VERCEL-LOGIN.md` for detailed troubleshooting.


