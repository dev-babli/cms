# Fix Vercel Login Issues

## Common Issues and Solutions

### Issue 1: Admin User Not in Supabase Auth

**Problem:** Admin user exists in database but not in Supabase Auth.

**Solution:**
1. Go to Supabase Dashboard → Authentication → Users
2. Check if `admin@emscale.com` exists
3. If not, create it:
   - Click "Add User" → "Create new user"
   - Email: `admin@emscale.com`
   - Password: `admin123` (or your password)
   - Auto Confirm: Yes (for testing)

4. Link the user:
   - Get the Supabase user ID from the dashboard
   - Run in Supabase SQL Editor:
   ```sql
   UPDATE users 
   SET supabase_user_id = 'supabase-user-id-here'
   WHERE email = 'admin@emscale.com';
   ```

### Issue 2: Missing Environment Variables

**Check in Vercel Dashboard:**
- Go to Project → Settings → Environment Variables
- Verify all variables are set:
  - `SUPABASE_SERVICE_ROLE_KEY` (Private)
  - `DATABASE_URL` (Private)
  - `NEXT_PUBLIC_SUPABASE_URL` (Public)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Public)

**Fix:**
- Add missing variables
- Redeploy after adding

### Issue 3: Database Connection Error

**Check:**
- `DATABASE_URL` is correct
- Password is URL-encoded (e.g., `@` becomes `%40`)
- Connection string uses "Session mode" pooler

**Fix:**
- Verify connection string in Supabase Dashboard
- Update `DATABASE_URL` in Vercel
- Redeploy

### Issue 4: Cookies Not Working

**Check:**
- HTTPS is enabled (automatic on Vercel)
- Cookies are set with `secure: true` in production
- Browser allows cookies

**Fix:**
- Already configured in code
- Check browser console for cookie errors
- Try incognito mode

### Issue 5: User Status is 'pending'

**Check:**
- User status in database

**Fix:**
- Run in Supabase SQL Editor:
  ```sql
  UPDATE users 
  SET status = 'active' 
  WHERE email = 'admin@emscale.com';
  ```

---

## Quick Fix Script

Run this to create/fix admin user:

```bash
cd cms
node scripts/create-admin.js
```

Then create user in Supabase Auth dashboard and link them.

---

## Step-by-Step Fix

### Step 1: Check Admin User in Database

Run diagnostic:
```bash
cd cms
node scripts/diagnose-login-issue.js
```

### Step 2: Create Admin in Supabase Auth

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create new user"
3. Email: `admin@emscale.com`
4. Password: `admin123`
5. Auto Confirm: Yes
6. Copy the User ID

### Step 3: Link User in Database

Run in Supabase SQL Editor:
```sql
UPDATE users 
SET supabase_user_id = 'paste-user-id-here',
    status = 'active'
WHERE email = 'admin@emscale.com';
```

### Step 4: Test Login

1. Visit: `https://your-cms.vercel.app/auth/login`
2. Email: `admin@emscale.com`
3. Password: `admin123`
4. Should work now!

---

## Still Not Working?

1. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → Deployments → Latest → Functions
   - Check for errors in `/api/auth/login`

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Check for errors
   - Check Network tab for failed requests

3. **Verify Environment Variables:**
   - All variables are set
   - Correct values
   - Redeployed after adding

4. **Test Supabase Connection:**
   ```bash
   cd cms
   node scripts/test-supabase-connection.js
   ```

---

**Most likely issue:** Admin user not in Supabase Auth. Create it in Supabase Dashboard first!


