# Supabase Storage Setup Guide

## Overview
The CMS now uses Supabase Storage for file uploads, which works seamlessly on both local development and Vercel production.

## Setup Steps

### 1. Create Storage Bucket in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **"New bucket"**
5. Configure the bucket:
   - **Name**: `cms-media` (or set `SUPABASE_STORAGE_BUCKET` env var to use a different name)
   - **Public bucket**: ✅ **Enable** (so images are publicly accessible)
   - **File size limit**: Set as needed (default is 50MB)
   - **Allowed MIME types**: Leave empty to allow all, or specify:
     - `image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime,video/x-msvideo,application/pdf`
     
     **Important for PDFs**: If you want to upload PDFs, make sure to include `application/pdf` in the allowed MIME types, or leave the field empty to allow all types.

6. Click **"Create bucket"**

### 2. Set Up Bucket Policies (Important!)

After creating the bucket, you need to set up policies to allow uploads:

1. Go to **Storage** > **Policies** (or click on your bucket > **Policies** tab)
2. Click **"New Policy"**
3. Create an **INSERT** policy:
   - **Policy name**: `Allow authenticated uploads`
   - **Allowed operation**: `INSERT`
   - **Policy definition**: 
   ```sql
   (bucket_id = 'cms-media'::text) AND (auth.role() = 'authenticated'::text)
   ```
   Or for service role (recommended for server-side uploads):
   ```sql
   (bucket_id = 'cms-media'::text)
   ```

4. Create a **SELECT** policy (for public access):
   - **Policy name**: `Allow public read`
   - **Allowed operation**: `SELECT`
   - **Policy definition**:
   ```sql
   (bucket_id = 'cms-media'::text)
   ```

### 3. Environment Variables

Add this to your `.env.local` (for local development):

```env
# Supabase Storage Bucket Name (optional, defaults to 'cms-media')
SUPABASE_STORAGE_BUCKET=cms-media
```

**For Vercel**, add the same variable in your project settings:
- Go to Vercel Dashboard > Your Project > Settings > Environment Variables
- Add `SUPABASE_STORAGE_BUCKET` (optional, defaults to 'cms-media')

**Note**: You should already have these Supabase variables set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Test Upload

1. Start your CMS: `npm run dev`
2. Go to `/admin/blog/new` or `/admin/media`
3. Try uploading an image
4. Check that the image appears and the URL points to Supabase Storage

## Storage URL Format

Uploaded files will have URLs like:
```
https://[your-project-ref].supabase.co/storage/v1/object/public/cms-media/[filename].webp
```

## Benefits

✅ **Works on Vercel**: No filesystem limitations  
✅ **Scalable**: Supabase Storage handles large files  
✅ **CDN**: Fast global delivery  
✅ **Already integrated**: Uses your existing Supabase setup  
✅ **Free tier**: 1GB storage included  

## Troubleshooting

### Error: "Bucket not found"
- Make sure you created the bucket in Supabase Dashboard
- Check that `SUPABASE_STORAGE_BUCKET` matches the bucket name exactly
- Verify your Supabase project is correct

### Error: "new row violates row-level security policy"
- Set up bucket policies as described in step 2
- Make sure the INSERT policy allows your service role

### Images not loading
- Ensure the bucket is set to **Public**
- Check that the SELECT policy allows public reads
- Verify the URL is accessible in browser

### Upload fails silently
- Check browser console for errors
- Check Vercel function logs
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly

## Storage Limits

- **Free tier**: 1GB storage, 2GB bandwidth/month
- **Pro tier**: 100GB storage, 200GB bandwidth/month

For more details, see: https://supabase.com/pricing

## Migration from Local Storage

If you were using local file storage before:
1. Old files in `public/uploads/` won't be accessible via Supabase Storage
2. You can manually upload them to Supabase Storage if needed
3. New uploads will automatically use Supabase Storage


