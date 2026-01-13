# Verify CMS API is Working

## Your CMS URL
**CMS Base URL:** `https://cms-intellectt-final.vercel.app`

## Test API Endpoints

### 1. Test Blog Posts API
Open in browser or use curl:
```
https://cms-intellectt-final.vercel.app/api/cms/blog?published=true
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Blog Post Title",
      "slug": "blog-post-slug",
      "published": true,
      ...
    }
  ]
}
```

### 2. Test CORS (from intellectt.com)
Open browser console on `https://intellectt.com` and run:
```javascript
fetch('https://cms-intellectt-final.vercel.app/api/cms/blog?published=true')
  .then(r => r.json())
  .then(data => console.log('✅ CMS Connected:', data))
  .catch(err => console.error('❌ CMS Error:', err))
```

**Expected:** Should return blog posts without CORS errors

### 3. Test Other Endpoints

- **Case Studies:** `https://cms-intellectt-final.vercel.app/api/cms/case-studies?published=true`
- **Ebooks:** `https://cms-intellectt-final.vercel.app/api/cms/ebooks?published=true`
- **News:** `https://cms-intellectt-final.vercel.app/api/cms/news?published=true`
- **Team:** `https://cms-intellectt-final.vercel.app/api/cms/team?published=true`
- **Jobs:** `https://cms-intellectt-final.vercel.app/api/cms/jobs?published=true`

## Frontend Configuration

### For React App (.env file)
```env
REACT_APP_CMS_API_URL=https://cms-intellectt-final.vercel.app
REACT_APP_USE_CMS=true
```

**Important:**
- No trailing slash after the URL
- `REACT_APP_USE_CMS` must be exactly `true`

## CMS Admin Access

**Admin URL:** `https://cms-intellectt-final.vercel.app/admin`

**Login Required:**
- You need to sign in to access the admin panel
- If you don't have an account, use the "Sign up" link

## Troubleshooting

### Issue: CORS Errors
**Solution:** CMS already allows `https://intellectt.com` by default. If you see CORS errors:
1. Check browser console for exact error
2. Verify the request is coming from `https://intellectt.com`
3. Check CMS Vercel environment variables for `ALLOWED_ORIGINS`

### Issue: 404 Not Found
**Solution:** 
- Verify the API endpoint path is correct
- Check that the CMS is deployed and running
- Test: `https://cms-intellectt-final.vercel.app/api/cms/blog?published=true`

### Issue: Empty Data Array
**Solution:**
1. Log into CMS admin: `https://cms-intellectt-final.vercel.app/admin`
2. Go to `/admin/blog`
3. Ensure blog posts have:
   - ✅ `published: true` checkbox checked
   - ✅ `publish_date` set (should be in the past or today)

## Quick Test Commands

### Using curl (Terminal):
```bash
# Test blog API
curl https://cms-intellectt-final.vercel.app/api/cms/blog?published=true

# Test with CORS headers
curl -H "Origin: https://intellectt.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://cms-intellectt-final.vercel.app/api/cms/blog?published=true
```

### Using Browser:
1. Open: `https://cms-intellectt-final.vercel.app/api/cms/blog?published=true`
2. Should see JSON response with blog posts

## Next Steps

1. ✅ Verify CMS API is accessible
2. ✅ Configure React app `.env` file with CMS URL
3. ✅ Build React app: `npm run build`
4. ✅ Upload to cPanel
5. ✅ Test on intellectt.com

