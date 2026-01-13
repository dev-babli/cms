# Fix: Frontend Not Showing CMS Content

## Problem
The Intellectt.com website is not displaying blogs and other content from the CMS.

## Root Causes

1. **Missing Environment Variables** in the React frontend:
   - `REACT_APP_CMS_API_URL` - Not set or pointing to wrong URL
   - `REACT_APP_USE_CMS` - Not set to `"true"` (must be exact string match)

2. **CORS Configuration** - CMS may not allow requests from intellectt.com

3. **CMS API URL** - Frontend can't reach the CMS API

## Solution

### Step 1: Configure Frontend Environment Variables

In the **Intellectt/cms-intellectt** React app, you need to set these environment variables:

#### For Production (intellectt.com):

1. **If using Vercel/Netlify:**
   - Go to your hosting platform's environment variables settings
   - Add these variables:

   ```env
   REACT_APP_CMS_API_URL=https://your-cms-url.vercel.app
   REACT_APP_USE_CMS=true
   ```

   **Important:** 
   - `REACT_APP_USE_CMS` must be exactly `true` (no quotes in the env var value)
   - `REACT_APP_CMS_API_URL` should be your CMS deployment URL (without trailing slash)

2. **If using cPanel/Static Hosting:**
   - Create a `.env.production` file in `Intellectt/cms-intellectt/`:

   ```env
   REACT_APP_CMS_API_URL=https://your-cms-url.vercel.app
   REACT_APP_USE_CMS=true
   ```

   - Rebuild the React app: `npm run build`

#### For Local Development:

Create `.env` file in `Intellectt/cms-intellectt/`:

```env
REACT_APP_CMS_API_URL=http://localhost:3001
REACT_APP_USE_CMS=true
```

### Step 2: Verify CMS CORS Configuration

The CMS needs to allow requests from `https://intellectt.com`. Check `cms/lib/security/cors.ts`:

The CMS should already include `https://intellectt.com` in the allowed origins, but verify:

1. **Check CMS Environment Variables:**
   - In your CMS deployment (Vercel), ensure `ALLOWED_ORIGINS` includes:
   ```
   ALLOWED_ORIGINS=https://intellectt.com,https://www.intellectt.com
   ```

2. **Or verify the default in production:**
   - The CMS code already includes `https://intellectt.com` in default production origins
   - But you can explicitly set it in environment variables

### Step 3: Test the Connection

1. **Test CMS API directly:**
   ```bash
   curl https://your-cms-url.vercel.app/api/cms/blog?published=true
   ```
   Should return JSON with blog posts.

2. **Test from browser console (on intellectt.com):**
   ```javascript
   fetch('https://your-cms-url.vercel.app/api/cms/blog?published=true')
     .then(r => r.json())
     .then(console.log)
   ```
   Should return blog posts without CORS errors.

3. **Check React app console:**
   - Open browser DevTools on intellectt.com
   - Look for:
     - ✅ `✅ Fetched X blogs from CMS` - Success!
     - ⚠️ `⚠️ CMS is disabled (REACT_APP_USE_CMS !== "true")` - Problem!
     - ❌ `❌ Failed to fetch blogs from CMS` - Connection issue

### Step 4: Verify Blog Posts are Published

In the CMS admin panel:
1. Go to `/admin/blog`
2. Ensure blog posts have:
   - ✅ `published: true` checkbox checked
   - ✅ `publish_date` set to a past date (or current date)

### Step 5: Rebuild and Redeploy

After setting environment variables:

1. **If using Vercel/Netlify:**
   - Environment variables are picked up automatically
   - Trigger a new deployment or wait for auto-deploy

2. **If using static hosting:**
   ```bash
   cd Intellectt/cms-intellectt
   npm run build
   # Upload the build folder to your hosting
   ```

## Quick Checklist

- [ ] `REACT_APP_CMS_API_URL` is set to your CMS URL (no trailing slash)
- [ ] `REACT_APP_USE_CMS` is set to exactly `true` (string, not boolean)
- [ ] CMS CORS allows `https://intellectt.com`
- [ ] Blog posts are published in CMS (`published: true`)
- [ ] Frontend is rebuilt/redeployed after env var changes
- [ ] Browser console shows successful CMS fetch (not errors)

## Common Issues

### Issue 1: "CMS is disabled" message
**Fix:** `REACT_APP_USE_CMS` must be exactly `"true"` (string), not `true` (boolean) or `"True"` (capitalized)

### Issue 2: CORS errors in console
**Fix:** Add `https://intellectt.com` to CMS `ALLOWED_ORIGINS` environment variable

### Issue 3: 404 errors when fetching
**Fix:** Check `REACT_APP_CMS_API_URL` is correct and doesn't have trailing slash

### Issue 4: Empty array returned
**Fix:** Check blog posts are published (`published: true`) in CMS admin

## Testing Locally

1. Start CMS: `cd cms && npm run dev` (runs on port 3001)
2. Start React app: `cd Intellectt/cms-intellectt && npm start` (runs on port 3000)
3. Create `.env` in React app:
   ```env
   REACT_APP_CMS_API_URL=http://localhost:3001
   REACT_APP_USE_CMS=true
   ```
4. Restart React app
5. Check browser console for CMS fetch logs

## Need Help?

Check these files for more details:
- `Intellectt/cms-intellectt/src/context/CmsContentContext.jsx` - CMS integration logic
- `Intellectt/cms-intellectt/src/utils/cmsClient.js` - API client configuration
- `cms/lib/security/cors.ts` - CORS configuration
- `cms/app/api/cms/blog/route.ts` - Blog API endpoint

