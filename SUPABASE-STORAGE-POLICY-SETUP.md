# Supabase Storage Bucket Policy Setup - Step by Step Guide

## Overview

This guide will walk you through setting up the `cms-media` bucket in Supabase Storage with the correct policies to allow image and video uploads.

---

## Step 1: Create the Storage Bucket

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click **"Storage"** in the left sidebar
   - You should see the Storage page

3. **Create New Bucket**
   - Click the **"New bucket"** button (usually top right)
   - Fill in the form:
     - **Name**: `cms-media` (must match exactly)
     - **Public bucket**: ✅ **Check this box** (IMPORTANT - makes files publicly accessible)
     - **File size limit**: Leave default or set to 50MB
     - **Allowed MIME types**: Leave empty (allows all types) OR specify:
       ```
       image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime,video/x-msvideo,application/pdf
       ```
       
       **Important for PDFs**: If you plan to upload PDFs, make sure to include `application/pdf` in the allowed MIME types. Alternatively, leave this field empty to allow all file types.
   - Click **"Create bucket"**

---

## Step 2: Set Up Storage Policies (RLS)

After creating the bucket, you need to add policies to allow uploads. There are two methods:

### Method 1: Using Supabase Dashboard (Recommended)

1. **Go to Storage Policies**
   - In Storage page, click on your `cms-media` bucket
   - Click the **"Policies"** tab
   - You'll see a list of policies (likely empty)

2. **Create INSERT Policy (Allow Uploads)**

   - Click **"New Policy"** button
   - Select **"Create a policy from scratch"** or **"For full customization"**
   - Configure:
     - **Policy name**: `Allow service role uploads`
     - **Allowed operation**: Select **INSERT**
     - **Policy definition**: Choose **"Custom expression"** and paste:
       ```sql
       bucket_id = 'cms-media'
       ```
     - **WITH CHECK expression**: Same as above:
       ```sql
       bucket_id = 'cms-media'
       ```
   - Click **"Review"** then **"Save policy"**

3. **Create SELECT Policy (Allow Public Reads)**

   - Click **"New Policy"** again
   - Configure:
     - **Policy name**: `Allow public reads`
     - **Allowed operation**: Select **SELECT**
     - **Policy definition**: 
       ```sql
       bucket_id = 'cms-media'
       ```
   - Click **"Review"** then **"Save policy"**

### Method 2: Using SQL Editor (Alternative)

If the Dashboard UI is confusing, you can use SQL:

1. **Go to SQL Editor**
   - Click **"SQL Editor"** in left sidebar
   - Click **"New query"**

2. **Run These SQL Commands**

```sql
-- Allow INSERT (uploads) for service role
CREATE POLICY "Allow service role uploads"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'cms-media');

-- Allow SELECT (reads) for everyone (public)
CREATE POLICY "Allow public reads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'cms-media');
```

3. **Click "Run"** to execute the SQL

---

## Step 3: Verify Environment Variables

Make sure these are set in your `.env.local` (local) and Vercel (production):

### Required Variables:

```env
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Supabase Anon Key (for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Service Role Key (for server-side uploads) - IMPORTANT!
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Storage Bucket Name (optional, defaults to 'cms-media')
SUPABASE_STORAGE_BUCKET=cms-media
```

### Where to Find These Keys:

1. **Go to Supabase Dashboard** → Your Project
2. **Click "Settings"** (gear icon) → **"API"**
3. You'll see:
   - **Project URL** → Copy to `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Copy to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → Copy to `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Keep this secret!**

### For Vercel Deployment:

1. Go to **Vercel Dashboard** → Your Project
2. **Settings** → **Environment Variables**
3. Add all the variables above
4. Make sure to add them for **Production**, **Preview**, and **Development** environments

---

## Step 4: Test the Setup

1. **Start your CMS locally**:
   ```bash
   cd cms
   npm run dev
   ```

2. **Test Upload**:
   - Go to `http://localhost:3000/admin/blog/new`
   - Try uploading a featured image
   - If successful, you should see the image preview

3. **Check the URL**:
   - The uploaded image URL should look like:
     ```
     https://[your-project-ref].supabase.co/storage/v1/object/public/cms-media/[filename].webp
     ```
   - Open this URL in a new tab - it should display the image

---

## Troubleshooting

### Error: "Bucket not found"

**Solution**:
- Verify the bucket name is exactly `cms-media` (case-sensitive)
- Check `SUPABASE_STORAGE_BUCKET` env var matches
- Go to Storage page and verify bucket exists

### Error: "new row violates row-level security policy"

**Solution**:
- Make sure you created the INSERT policy
- Verify the policy allows `service_role` or `authenticated` role
- Try Method 2 (SQL Editor) if Dashboard method didn't work

### Error: "Permission denied" or "Forbidden"

**Solution**:
- Ensure bucket is set to **Public**
- Verify SELECT policy exists for public reads
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly

### Images upload but don't display

**Solution**:
- Check bucket is **Public**
- Verify SELECT policy allows public reads
- Test the image URL directly in browser
- Check browser console for CORS errors

### Upload works locally but fails on Vercel

**Solution**:
- Verify all environment variables are set in Vercel
- Check Vercel Function Logs for errors
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (not just anon key)

---

## Quick Policy SQL (Copy-Paste Ready)

If you prefer to use SQL Editor, here's the complete setup:

```sql
-- Step 1: Create bucket (if not exists)
-- Note: Buckets are usually created via Dashboard, but you can verify:
-- SELECT * FROM storage.buckets WHERE name = 'cms-media';

-- Step 2: Allow INSERT (uploads) - Service Role
CREATE POLICY IF NOT EXISTS "Allow service role uploads"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'cms-media');

-- Step 3: Allow SELECT (reads) - Public
CREATE POLICY IF NOT EXISTS "Allow public reads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'cms-media');

-- Step 4: Allow UPDATE (optional - for replacing files)
CREATE POLICY IF NOT EXISTS "Allow service role updates"
ON storage.objects
FOR UPDATE
TO service_role
USING (bucket_id = 'cms-media')
WITH CHECK (bucket_id = 'cms-media');

-- Step 5: Allow DELETE (optional - for deleting files)
CREATE POLICY IF NOT EXISTS "Allow service role deletes"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'cms-media');
```

**To run**: Copy all SQL above → Paste in Supabase SQL Editor → Click "Run"

---

## Verification Checklist

After setup, verify:

- [ ] Bucket `cms-media` exists in Supabase Dashboard → Storage
- [ ] Bucket is set to **Public** (checkbox checked)
- [ ] INSERT policy exists (allows uploads)
- [ ] SELECT policy exists (allows public reads)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in environment variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- [ ] Test upload works in CMS admin
- [ ] Uploaded image URL is accessible in browser

---

## Security Notes

⚠️ **Important**:
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security (RLS)
- Keep it **secret** - never commit it to Git
- Only use it on the server-side (which we do in `/api/upload/route.ts`)
- The bucket is public, so uploaded files are publicly accessible
- Consider adding file size limits and MIME type restrictions

---

## Need Help?

If you're still having issues:

1. Check Supabase Dashboard → Storage → `cms-media` bucket → **Policies** tab
2. Verify all policies are active (green checkmark)
3. Check Vercel Function Logs for detailed error messages
4. Test with a small image first (< 1MB)

---

**Status**: ✅ Complete setup guide
**Last Updated**: Current


