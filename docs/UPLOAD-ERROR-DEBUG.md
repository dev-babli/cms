# Upload Error Debugging Guide

## Error: "Unexpected token 'R', "Request En"... is not valid JSON"

This error occurs when the client tries to parse a non-JSON response as JSON.

## Common Causes

### 1. Supabase Storage Bucket Not Created
**Symptom**: Error when uploading
**Solution**: 
- Go to Supabase Dashboard > Storage
- Create a bucket named `cms-media` (or set `SUPABASE_STORAGE_BUCKET` env var)
- Make it public
- See `cms/SUPABASE-STORAGE-SETUP.md` for details

### 2. Missing Supabase Environment Variables
**Symptom**: Error about Supabase configuration
**Check**:
- `NEXT_PUBLIC_SUPABASE_URL` is set
- `SUPABASE_SERVICE_ROLE_KEY` is set
- Both are in Vercel environment variables (if deployed)

### 3. Network/CORS Error
**Symptom**: Network error or CORS error
**Solution**: Check browser console and network tab

### 4. File Size Too Large
**Symptom**: Request entity too large
**Solution**: 
- Check Supabase Storage bucket file size limit
- Check Vercel function size limits (50MB default)

### 5. Supabase Storage Policy Issues
**Symptom**: Permission denied errors
**Solution**: 
- Ensure bucket is public
- Set up proper RLS policies (see setup guide)

## Debugging Steps

1. **Check Browser Console**
   - Open DevTools > Console
   - Look for the exact error message
   - Check Network tab for the failed request

2. **Check Server Logs**
   - If on Vercel: Check Function Logs
   - If local: Check terminal output
   - Look for Supabase errors

3. **Test Supabase Connection**
   ```bash
   cd cms
   node scripts/test-supabase-connection.js
   ```

4. **Verify Storage Bucket**
   - Go to Supabase Dashboard > Storage
   - Verify `cms-media` bucket exists
   - Check it's set to public
   - Verify policies are set

5. **Test Upload Manually**
   - Use browser DevTools > Network tab
   - Try uploading a file
   - Check the request/response
   - Look at response headers (should be `application/json`)

## Quick Fix Checklist

- [ ] Supabase Storage bucket `cms-media` exists
- [ ] Bucket is set to **Public**
- [ ] RLS policies allow INSERT and SELECT
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] Environment variables are set in Vercel (if deployed)
- [ ] File size is within limits (< 50MB)
- [ ] File type is allowed (images/videos)

## Testing

After fixing, test with:
1. Small image (< 1MB)
2. Medium image (1-5MB)
3. Large image (5-10MB) - if needed

If errors persist, check:
- Browser console for exact error
- Network tab for response content
- Server logs for backend errors


