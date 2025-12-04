# Quick Fix: Database Auth Error on Vercel

## The Problem
```
Failed to create post: password authentication failed for user "postgres"
```

## The Solution (3 Steps)

### Step 1: Get Your Supabase Connection String

1. Go to: https://supabase.com/dashboard
2. Select your project
3. **Settings** → **Database**
4. Scroll to **Connection string**
5. Click **URI** tab
6. **Copy the connection string**

### Step 2: URL-Encode the Password

If your password has special characters (like `@`, `#`, `%`), encode them:

**Quick encoding:**
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`

**Or use the helper script:**
```bash
cd cms
node scripts/generate-vercel-connection-string.js
```

### Step 3: Update Vercel

1. Go to: https://vercel.com/dashboard
2. Select your **CMS project**
3. **Settings** → **Environment Variables**
4. Find `DATABASE_URL`
5. **Edit** → Paste the connection string with encoded password
6. **Save**
7. **Redeploy** (Deployments → Redeploy)

## Example

**If your password is:** `soumeet@132006`

**Connection string should be:**
```
postgresql://postgres.ozxrtdqbcfinrnrdelql:soumeet%40132006@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

Notice: `@` became `%40`

## Verify It Works

After redeploy, try creating a blog post in the CMS. It should work!

## Still Not Working?

1. Double-check the password is correct
2. Make sure it's URL-encoded
3. Verify the connection string format
4. Check Vercel logs for detailed error


