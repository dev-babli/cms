# Quick Fix: Database Authentication Error

## Error
```
password authentication failed for user "postgres"
```

## Quick Fix (5 minutes)

### Step 1: Get Correct Connection String

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll to **Connection string**
5. Click **URI** tab
6. **Copy the connection string**

**It should look like:**
```
postgresql://postgres.ozxrtdqbcfinrnrdelql:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

### Step 2: URL-Encode Special Characters

If your password has special characters, encode them:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

**Example:**
- Password: `soumeet@132006`
- Encoded: `soumeet%40132006`

### Step 3: Update Vercel

1. Go to **Vercel Dashboard**
2. Select your **CMS project**
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL`
5. Click **Edit** (or **Add** if missing)
6. Paste the **correct connection string** (with URL-encoded password)
7. Select: **Production**, **Preview**, **Development**
8. Click **Save**

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### Step 5: Test

1. Go to `/admin/blog/new`
2. Create a test post
3. Should work! ✅

## If You Don't Know Your Password

### Reset Database Password in Supabase

1. Go to **Supabase Dashboard**
2. **Settings** → **Database**
3. Scroll to **Database Password**
4. Click **Reset Database Password**
5. Copy the new password
6. Update `DATABASE_URL` in Vercel with new password (URL-encoded)

## Verify Connection String Format

Your connection string should be:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Example:**
```
postgresql://postgres.ozxrtdqbcfinrnrdelql:soumeet%40132006@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

## Common Mistakes

❌ **Wrong**: Using old password  
✅ **Right**: Use current password from Supabase

❌ **Wrong**: Not URL-encoding special characters  
✅ **Right**: Encode `@` as `%40`, etc.

❌ **Wrong**: Wrong port (5432 instead of 6543)  
✅ **Right**: Use port `6543` for connection pooler

❌ **Wrong**: Missing `postgres.` prefix  
✅ **Right**: `postgres.[PROJECT_REF]` not just `postgres`

## Still Not Working?

1. **Check Vercel logs**: Go to Deployment → Functions → View Logs
2. **Test connection locally**: Use the connection string in your local `.env.local`
3. **Verify Supabase**: Make sure database is running in Supabase dashboard

