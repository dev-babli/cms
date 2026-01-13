# URL Shortener Implementation Guide

## Overview

A URL shortener has been added to your CMS to create short, shareable links for blog posts and other content.

## Features

- ✅ Create short URLs for any long URL
- ✅ Track click statistics
- ✅ Database-backed (persistent)
- ✅ Automatic redirect handling
- ✅ User attribution (who created the short URL)

## Setup

### Step 1: Create Database Table

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `cms/create-url-shortener-table.sql`
3. Paste and run

### Step 2: Enable RLS (Optional but Recommended)

If you want to restrict access to URL shortener data:

```sql
ALTER TABLE url_shortener ENABLE ROW LEVEL SECURITY;

-- Allow public to read (for redirects)
CREATE POLICY "Public can read url_shortener"
ON url_shortener FOR SELECT
TO public
USING (true);

-- Service role full access
CREATE POLICY "Service role full access to url_shortener"
ON url_shortener
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

## Usage

### Client-Side Usage

```typescript
import { createShortUrlServer, copyUrlToClipboard } from '@/lib/utils/url-shortener';

// Create a short URL
const shortUrl = await createShortUrlServer('https://very-long-url.com/path/to/content');

// Copy to clipboard with shortening
await copyUrlToClipboard('https://long-url.com', true);
```

### API Usage

#### Create Short URL
```bash
POST /api/url/shorten
Content-Type: application/json

{
  "url": "https://very-long-url.com/path/to/content"
}
```

Response:
```json
{
  "success": true,
  "shortUrl": "http://localhost:3001/s/abc123",
  "data": {
    "id": 1,
    "shortHash": "abc123",
    "shortUrl": "http://localhost:3001/s/abc123",
    "originalUrl": "https://very-long-url.com/path/to/content",
    "clicks": 0,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Resolve Short URL
```bash
GET /api/url/shorten?hash=abc123
```

Response:
```json
{
  "success": true,
  "data": {
    "originalUrl": "https://very-long-url.com/path/to/content",
    "clicks": 5
  }
}
```

## URL Format

Short URLs follow this format:
```
https://yourdomain.com/s/{hash}
```

Example:
- Original: `https://yourdomain.com/blog/very-long-article-title-with-many-words`
- Short: `https://yourdomain.com/s/a1b2c3d4`

## Integration Examples

### Add "Copy Short Link" Button to Blog Posts

```typescript
import { createShortUrlServer, copyUrlToClipboard } from '@/lib/utils/url-shortener';

const handleCopyShortLink = async (blogPostId: number) => {
  const fullUrl = `${window.location.origin}/blog/${blogPost.slug}`;
  const shortUrl = await createShortUrlServer(fullUrl);
  await navigator.clipboard.writeText(shortUrl);
  alert('Short link copied to clipboard!');
};
```

### Share Button Component

```typescript
'use client';

import { useState } from 'react';
import { createShortUrlServer } from '@/lib/utils/url-shortener';

export function ShareButton({ url }: { url: string }) {
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const short = await createShortUrlServer(url);
      setShortUrl(short);
      await navigator.clipboard.writeText(short);
      alert('Short link copied!');
    } catch (error) {
      console.error('Failed to create short URL:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleShare} disabled={loading}>
      {loading ? 'Creating...' : 'Share'}
    </button>
  );
}
```

## Analytics

### Get Click Statistics

```typescript
// Via API
const response = await fetch(`/api/url/shorten?hash=${hash}`);
const data = await response.json();
console.log('Clicks:', data.data.clicks);
```

### Database Query

```sql
SELECT 
  short_hash,
  original_url,
  clicks,
  last_accessed,
  created_at
FROM url_shortener
WHERE created_by = $1
ORDER BY clicks DESC;
```

## Security Considerations

1. **Rate Limiting**: Consider adding rate limiting to prevent abuse
2. **URL Validation**: Only allow HTTP/HTTPS URLs
3. **Spam Prevention**: Monitor for suspicious patterns
4. **Expiration**: Optionally add expiration dates for short URLs

## Database Schema

```sql
CREATE TABLE url_shortener (
  id SERIAL PRIMARY KEY,
  short_hash VARCHAR(20) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id),
  clicks INTEGER DEFAULT 0,
  last_accessed TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Files Created

- `cms/lib/utils/url-shortener.ts` - Client-side utilities
- `cms/app/api/url/shorten/route.ts` - API endpoints
- `cms/app/s/[hash]/route.ts` - Redirect handler
- `cms/create-url-shortener-table.sql` - Database migration

## Testing

### Test 1: Create Short URL
```bash
curl -X POST http://localhost:3001/api/url/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/very/long/url/path"}'
```

### Test 2: Access Short URL
Visit: `http://localhost:3001/s/{hash}`

Should redirect to original URL.

### Test 3: Get Statistics
```bash
curl "http://localhost:3001/api/url/shorten?hash={hash}"
```

## Next Steps

1. **Run the migration** to create the table
2. **Add share buttons** to blog posts
3. **Integrate** into social sharing features
4. **Monitor** click statistics
5. **Consider** adding expiration dates for old URLs

---

**Status**: ✅ Ready to use
**Time Required**: ~2 minutes (database setup)
**Use Cases**: Blog sharing, social media, email campaigns

