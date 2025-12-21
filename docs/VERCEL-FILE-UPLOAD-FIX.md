# Vercel File Upload Fix

## ✅ FIXED: Now Using Supabase Storage

The CMS now uses **Supabase Storage** for all file uploads, which works seamlessly on both local development and Vercel production. No additional setup needed beyond creating the storage bucket!

See `cms/SUPABASE-STORAGE-SETUP.md` for setup instructions.

---

## Previous Issue (Now Resolved)
When uploading images in the CMS on Vercel, you may have seen errors like:
- `Unexpected token 'R', "Request En"... is not valid JSON`
- `Upload failed`
- File system errors

## Root Cause (Resolved)
**Vercel's filesystem is read-only.** The previous implementation tried to save files to `public/uploads/`, which fails on Vercel.

**Solution**: Now using Supabase Storage, which works everywhere!

---

## Alternative Solutions (If Not Using Supabase Storage)

If you prefer a different cloud storage service:

#### Cloudinary (Easiest)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your API credentials
3. Install: `npm install cloudinary`
4. Update `cms/app/api/upload/route.ts` to use Cloudinary

#### AWS S3
1. Set up S3 bucket
2. Install: `npm install @aws-sdk/client-s3`
3. Update upload route to use S3

#### Supabase Storage
1. Use Supabase Storage (since you're already using Supabase)
2. Install: `npm install @supabase/supabase-js`
3. Update upload route to use Supabase Storage

### Option 2: Temporary Workaround (Development Only)

For local development, the current setup works. For Vercel:
- Use external image URLs
- Or use a service like [imgur](https://imgur.com) for quick testing

## What Was Fixed

1. **Database Operation**: Fixed `stmt.run()` to be awaited (was causing async errors)
2. **Error Handling**: Improved error handling in all upload components:
   - `cms/components/cms/image-upload.tsx`
   - `cms/components/cms/media-upload.tsx`
   - `cms/app/admin/blog/new/page.tsx`
   - `cms/app/admin/media/page.tsx`
3. **JSON Parsing**: Fixed components to check `res.ok` before parsing JSON
4. **Error Messages**: Added specific error messages for Vercel read-only filesystem

## Testing

1. **Local Development**: File uploads should work normally
2. **Vercel**: You'll get a clear error message about read-only filesystem

## Next Steps

1. Choose a cloud storage solution (Cloudinary recommended for ease)
2. Update `cms/app/api/upload/route.ts` to use cloud storage
3. Add environment variables for cloud storage credentials
4. Test uploads on Vercel

## Quick Cloudinary Integration Example

```typescript
// In cms/app/api/upload/route.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// In POST handler:
const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);

const uploadResult = await new Promise((resolve, reject) => {
  cloudinary.uploader.upload_stream(
    { resource_type: isVideo ? 'video' : 'image' },
    (error, result) => {
      if (error) reject(error);
      else resolve(result);
    }
  ).end(buffer);
});

const url = uploadResult.secure_url;
```

Then add to Vercel environment variables:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

