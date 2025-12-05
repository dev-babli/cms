# Fix: 405 and 500 Errors on Vercel

## Problem
- **405 Method Not Allowed** for POST requests
- **500 Internal Server Error** returning HTML (`<!DOCTYPE`) instead of JSON
- API routes crashing on Vercel

## Root Causes

### 1. Missing Environment Variables
The 500 errors returning HTML suggest the API routes are crashing, likely due to missing environment variables:
- `DATABASE_URL` - Required for database connection
- `SUPABASE_SERVICE_ROLE_KEY` - Required for Supabase operations
- `NEXT_PUBLIC_SUPABASE_URL` - Required for Supabase client
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Required for Supabase client

### 2. Route Handler Not Recognized
The 405 error suggests Next.js isn't recognizing the POST handler, possibly due to:
- Build cache issues
- Route file structure problems
- Missing route segment config

## Solutions

### Step 1: Add Environment Variables in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add these variables (mark as **Private**):

```
DATABASE_URL=postgresql://...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. **Important**: Select all environments (Production, Preview, Development)

4. Click **Save**

### Step 2: Redeploy

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**

### Step 3: Verify Build

Check the build logs in Vercel to ensure:
- No TypeScript errors
- No missing dependencies
- Routes are being built correctly

## Testing

After redeploy, test the API endpoints:

```bash
# Test GET
curl https://your-app.vercel.app/api/cms/blog?published=true

# Test POST (should work after fix)
curl -X POST https://your-app.vercel.app/api/cms/blog \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","slug":"test","content":"test"}'
```

## Expected Behavior

- ✅ GET requests return JSON: `{"success": true, "data": [...]}`
- ✅ POST requests return JSON (not 405)
- ✅ Errors return JSON: `{"success": false, "error": "..."}`
- ❌ No HTML error pages (`<!DOCTYPE`)

## If Still Failing

1. Check Vercel Function Logs:
   - Vercel Dashboard → Your Project → **Functions** tab
   - Look for error messages

2. Check Build Logs:
   - Vercel Dashboard → Your Project → **Deployments** → Click deployment → **Build Logs**

3. Common Issues:
   - Database connection timeout (check DATABASE_URL)
   - Missing Supabase keys (check all SUPABASE_* vars)
   - Build errors (check TypeScript compilation)

