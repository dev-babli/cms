# Fix Login Page Internal Server Error

## Problem
The login page at `http://localhost:3000/auth/login` shows "Internal Server Error".

## Root Cause
The error is likely caused by **missing Supabase environment variables**. The CMS uses Supabase Auth for authentication, but the required environment variables are not configured.

## Solution

### Step 1: Create `.env.local` file

In the `cms` folder, create a `.env.local` file with the following variables:

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# For admin operations (recommended)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: If using Supabase database
DATABASE_URL=your-supabase-connection-string
```

### Step 2: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### Step 3: Create a Test User in Supabase

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add User** → **Create new user**
3. Enter:
   - Email: `admin@emscale.com`
   - Password: `admin123`
   - Auto Confirm User: ✅ (checked)
4. Click **Create User**

### Step 4: Set User Metadata (Role)

After creating the user, you need to set the role:

1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Click on the user you just created
3. Scroll to **User Metadata**
4. Click **Edit** and add:
   ```json
   {
     "name": "Admin User",
     "role": "admin"
   }
   ```
5. Click **Save**

### Step 5: Restart the Development Server

```bash
cd cms
npm run dev
```

### Step 6: Test Login

1. Visit `http://localhost:3000/auth/login`
2. Use credentials:
   - Email: `admin@emscale.com`
   - Password: `admin123`

## Alternative: Use SQLite Database (No Supabase)

If you don't want to use Supabase, you can modify the authentication to use the local SQLite database instead. However, this requires code changes.

## Verification

After setting up the environment variables:

1. **Check server logs** - Should not show Supabase configuration errors
2. **Test login** - Should redirect to `/admin` after successful login
3. **Check browser console** - Should not show any errors

## Common Issues

### Issue: "Supabase URL is not configured"
**Solution**: Make sure `NEXT_PUBLIC_SUPABASE_URL` is set in `.env.local`

### Issue: "Supabase API key is not configured"
**Solution**: Make sure `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY` is set

### Issue: "Invalid login credentials"
**Solution**: 
- Make sure the user exists in Supabase Auth
- Check that the password is correct
- Verify email is confirmed (check "Auto Confirm User" when creating)

### Issue: Still getting Internal Server Error
**Solution**:
1. Check terminal/console for detailed error messages
2. Verify `.env.local` file is in the `cms` folder (not root)
3. Restart the dev server after adding environment variables
4. Clear `.next` folder: `rm -rf .next` then restart

## Quick Setup Script

You can also create a test user via Supabase SQL Editor:

```sql
-- This will be handled by Supabase Auth UI, but you can verify users exist:
SELECT * FROM auth.users;
```

## Notes

- The `.env.local` file should NOT be committed to git (it's in `.gitignore`)
- In production, set these as environment variables in your hosting platform (Vercel, etc.)
- The service role key has admin access - keep it secret!


