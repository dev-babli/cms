# Fix Database Authentication on Vercel

## Problem
```
Failed to create post: password authentication failed for user "postgres"
```

## Solution

### Step 1: Get Correct Connection String from Supabase

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll to **Connection string**
5. Select **URI** tab
6. Copy the connection string

**Format should be:**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

### Step 2: URL-Encode Password

If your password contains special characters, encode them:

**Common characters:**
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`
- `/` → `%2F`
- `:` → `%3A`

**Example:**
- Password: `soumeet@132006`
- Encoded: `soumeet%40132006`

### Step 3: Update Vercel Environment Variable

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your **CMS project**
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL`
5. **Edit** and paste the correct connection string with URL-encoded password
6. Make sure it's set for **Production**, **Preview**, and **Development**
7. **Save**

### Step 4: Redeploy

After updating the environment variable:

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger redeploy

### Step 5: Verify

After redeploy, test creating a blog post in the CMS. It should work now.

## Quick Check: Connection String Format

Your connection string should look like this:

```
postgresql://postgres.ozxrtdqbcfinrnrdelql:YOUR_PASSWORD@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

**Important:**
- Use **Connection Pooling** (port 5432) - better for serverless
- Password must be URL-encoded if it has special characters
- No spaces in the connection string

## Alternative: Reset Database Password

If password is lost:

1. Go to Supabase Dashboard
2. **Settings** → **Database**
3. Click **Reset Database Password**
4. Copy the new connection string
5. Update in Vercel

## Test Connection String

You can test if your connection string is correct:

```bash
# Replace with your connection string
psql "postgresql://postgres.ozxrtdqbcfinrnrdelql:YOUR_PASSWORD@aws-1-ap-south-1.pooler.supabase.com:5432/postgres" -c "SELECT NOW();"
```

Or use the test script:
```bash
cd cms
node scripts/test-db-connection.js
```

## Common Issues

### Issue: Password has `@` symbol
**Fix**: Encode as `%40`
- `soumeet@132006` → `soumeet%40132006`

### Issue: Using wrong connection string
**Fix**: Use the **URI** format from Supabase, not the other formats

### Issue: Connection string has spaces
**Fix**: Remove all spaces

### Issue: Using direct connection instead of pooler
**Fix**: Use pooler (port 5432) for Vercel serverless functions

