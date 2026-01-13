# Blog Preview URL Length Fix

## Problem

When clicking "Preview" for blog posts, the error "URL length too long" was appearing because all form data (including potentially very long blog content) was being encoded into the URL query parameter.

## Root Cause

The preview functionality was encoding the entire blog post data (title, content, excerpt, images, etc.) into a URL parameter:

```typescript
// OLD CODE (Problematic)
const previewData = encodeURIComponent(JSON.stringify({
    title: formData.title,
    content: formData.content,  // This could be thousands of characters!
    // ... other fields
}));
const previewUrl = `/admin/blog/preview?data=${previewData}`;
```

When blog content is long, the encoded URL exceeds browser limits (typically 2048-8192 characters depending on browser).

## Solution

Changed to use **sessionStorage** instead of URL parameters:

1. **Store data in sessionStorage** when preview button is clicked
2. **Read from sessionStorage** in the preview page
3. **Fallback to URL parameter** for backward compatibility

## Files Changed

### 1. `cms/app/admin/blog/new/page.tsx`
- Changed preview button to store data in sessionStorage
- Removed URL encoding of large data

### 2. `cms/app/admin/blog/preview/page.tsx`
- Updated to read from sessionStorage first
- Falls back to URL parameter for compatibility
- Cleans up sessionStorage after reading

## How It Works Now

### When Preview is Clicked:
1. Form data is stored in `sessionStorage` with a unique key
2. The key is stored in `blog_preview_latest`
3. Preview page opens with clean URL: `/admin/blog/preview`
4. Preview page reads data from sessionStorage
5. Data is cleaned up after reading

### Benefits:
- ✅ No URL length limits
- ✅ Works with any content length
- ✅ Clean URLs
- ✅ Backward compatible (still supports URL params)
- ✅ Automatic cleanup

## Testing

### Test 1: Short Content
1. Create a blog post with short content
2. Click Preview
3. Should open preview successfully

### Test 2: Long Content
1. Create a blog post with very long content (10,000+ characters)
2. Click Preview
3. Should open preview successfully (no URL length error)

### Test 3: Multiple Previews
1. Click Preview multiple times
2. Each preview should work correctly
3. Old preview data is automatically cleaned up

## Technical Details

### Storage Key Format
```
blog_preview_{timestamp}
```

### Storage Structure
```javascript
sessionStorage.setItem('blog_preview_latest', 'blog_preview_1234567890');
sessionStorage.setItem('blog_preview_1234567890', JSON.stringify(previewData));
```

### Cleanup
After reading the preview data, the code:
1. Removes the data entry
2. Removes the latest key reference
3. Prevents sessionStorage from growing

## Browser Compatibility

- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support
- ✅ Mobile browsers: Full support

sessionStorage is supported in all modern browsers.

## Related Files

- `cms/app/admin/blog/new/page.tsx` - Preview button implementation
- `cms/app/admin/blog/preview/page.tsx` - Preview page that reads data
- `cms/app/admin/blog/edit/[id]/page.tsx` - Edit page (no preview button, so no changes needed)

---

**Status**: ✅ Fixed
**Issue**: URL length too long error
**Solution**: Use sessionStorage instead of URL parameters
**Impact**: Works with any content length

