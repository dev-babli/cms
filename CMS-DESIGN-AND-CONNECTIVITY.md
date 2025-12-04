# CMS Design & React App Connectivity Guide

## 🎨 CMS Admin Design Features

### Current Design System

The CMS admin interface features a **modern, premium design** with the following elements:

#### 1. **Color Palette**
- **Primary Gradient**: Blue-600 → Indigo-600
- **Background**: Slate-50 → Blue-50/30 → White → Indigo-50/20 (gradient)
- **Accent Colors**: Turquoise (#4ce0d2), Sky Blue (#84cae7)
- **Text**: Slate-900 (headings), Slate-600 (body)

#### 2. **Design Components**

**Glass Morphism Header**
```css
.glass {
  background: white/80;
  backdrop-blur: xl;
  border: white/20;
}
```

**Premium Cards**
```css
.premium-card-gradient {
  background: gradient from-white to-slate-50/50;
  border: slate-200/60;
  shadow: lg;
  backdrop-blur: sm;
}
```

**Gradient Text**
```css
.gradient-text {
  background-clip: text;
  gradient: blue-600 → blue-500 → indigo-600;
}
```

**Premium Buttons**
```css
.btn-premium {
  gradient: blue-600 → indigo-600;
  shadow: blue-500/30;
  hover: scale-105;
}
```

#### 3. **UI Features**
- ✅ **Glassmorphism** - Frosted glass effect on headers
- ✅ **Gradient Backgrounds** - Subtle multi-color gradients
- ✅ **Hover Animations** - Smooth lift and glow effects
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Smooth Transitions** - 300ms duration animations
- ✅ **Premium Typography** - Inter font with tight tracking

### Design Files

- **Global Styles**: `cms/app/globals.css`
- **Tailwind Config**: `cms/tailwind.config.ts`
- **Admin Dashboard**: `cms/app/admin/page.tsx`
- **Component Library**: `cms/components/ui/`

---

## 🔌 React App Connectivity

### Connection Architecture

```
React App (Frontend)          CMS (Backend)
     │                              │
     │  HTTP Request                │
     ├─────────────────────────────>│
     │  GET /api/cms/blog           │
     │  ?published=true             │
     │                              │
     │  CORS Headers                │
     │  JSON Response               │
     │<─────────────────────────────┤
     │  { success: true, data: [] } │
     │                              │
```

### Configuration

#### 1. **Environment Variables**

**React App** (`.env`):
```env
REACT_APP_CMS_API_URL=http://localhost:3001
# or in production:
REACT_APP_CMS_API_URL=https://your-cms.vercel.app
```

**CMS** (`.env.local`):
```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key
```

#### 2. **API Client**

The React app uses `src/utils/cmsClient.js` to connect to the CMS:

```javascript
// Base URL validation and sanitization
const CMS_API_URL = validateApiUrl(
  process.env.REACT_APP_CMS_API_URL || 'http://localhost:3001'
);

// Fetch with error handling
async function fetchAPI(endpoint, options = {}) {
  const url = `${CMS_API_URL}${endpoint}?_t=${Date.now()}`;
  // ... fetch logic with CORS support
}
```

#### 3. **CORS Configuration**

The CMS API routes include CORS headers:

```typescript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
}
```

### API Endpoints

#### Blog Posts
- `GET /api/cms/blog?published=true` - Get published posts
- `GET /api/cms/blog/[id]` - Get post by ID or slug
- `POST /api/cms/blog` - Create post (sanitized)
- `PUT /api/cms/blog/[id]` - Update post (sanitized)

#### eBooks
- `GET /api/cms/ebooks?published=true`
- `GET /api/cms/ebooks/[id]`
- `POST /api/cms/ebooks` (sanitized)
- `PUT /api/cms/ebooks/[id]` (sanitized)

#### Whitepapers
- `GET /api/cms/whitepapers?published=true`
- `GET /api/cms/whitepapers/[id]`
- `POST /api/cms/whitepapers` (sanitized)
- `PUT /api/cms/whitepapers/[id]` (sanitized)

#### Case Studies
- `GET /api/cms/case-studies?published=true`
- `GET /api/cms/case-studies/[id]`
- `POST /api/cms/case-studies` (sanitized)
- `PUT /api/cms/case-studies/[id]` (sanitized)

### Security Features

#### 1. **Server-Side Sanitization**
All HTML content is sanitized **before storage** in the CMS:
- ✅ Titles sanitized with `sanitizeTitle()`
- ✅ Content sanitized with `sanitizeArticleContent()`
- ✅ Tracking scripts sanitized with `sanitizeTrackingScript()`

#### 2. **Client-Side Sanitization**
The React app also sanitizes content **before rendering**:
- ✅ All `dangerouslySetInnerHTML` uses sanitized HTML
- ✅ DOMPurify library for safe HTML rendering

#### 3. **URL Validation**
- ✅ API URL validation to prevent SSRF attacks
- ✅ Endpoint validation to prevent path traversal
- ✅ GraphQL variable sanitization

### Data Flow

```
1. User creates content in CMS
   ↓
2. CMS sanitizes HTML (server-side)
   ↓
3. Content stored in database (Supabase)
   ↓
4. React app fetches via API
   ↓
5. React app sanitizes again (client-side)
   ↓
6. Content rendered safely to users
```

---

## ✅ Verification Checklist

### CMS Design
- [x] Glassmorphism header implemented
- [x] Gradient backgrounds working
- [x] Premium card styles applied
- [x] Hover animations smooth
- [x] Responsive on mobile
- [x] Typography consistent

### Connectivity
- [x] CORS headers configured
- [x] API endpoints accessible
- [x] React app can fetch data
- [x] Error handling implemented
- [x] Cache-busting enabled

### Security
- [x] Server-side sanitization active
- [x] Client-side sanitization active
- [x] URL validation working
- [x] Path traversal prevented
- [x] XSS protection enabled

---

## 🧪 Testing Connectivity

### 1. Test CMS API Directly

Open in browser:
```
http://localhost:3001/api/cms/blog?published=true
```

Expected: JSON response with blog posts

### 2. Test from React App

In browser console:
```javascript
fetch('http://localhost:3001/api/cms/blog?published=true')
  .then(r => r.json())
  .then(data => console.log('✅ CMS Connected:', data))
  .catch(err => console.error('❌ Error:', err));
```

### 3. Check Network Tab

1. Open React app
2. Open DevTools → Network tab
3. Look for requests to `/api/cms/blog`
4. Verify status: 200 OK
5. Check response: JSON with `{ success: true, data: [...] }`

---

## 🚀 Production Deployment

### CMS (Vercel)
1. Deploy CMS to Vercel
2. Set environment variables:
   - `NEXTAUTH_URL` = Your CMS URL
   - `NEXTAUTH_SECRET` = Random secret
   - `DATABASE_URL` = Supabase connection string

### React App (Vercel)
1. Deploy React app to Vercel
2. Set environment variable:
   - `REACT_APP_CMS_API_URL` = Your CMS URL (no trailing slash)

### Verify Production
1. Test CMS API: `https://your-cms.vercel.app/api/cms/blog?published=true`
2. Test React app: Visit your React app URL
3. Check browser console for connection logs
4. Verify content appears correctly

---

## 📝 Notes

- **Cache Busting**: All API requests include `?_t=${Date.now()}` to prevent stale data
- **Error Handling**: Both CMS and React app handle errors gracefully
- **Fallback**: React app has fallback data if CMS is unavailable
- **Sanitization**: Content is sanitized at both server and client levels for defense-in-depth

---

## 🔧 Troubleshooting

### Issue: CORS Error
**Solution**: Verify CMS has CORS headers enabled (already configured)

### Issue: 404 Not Found
**Solution**: 
- Check `REACT_APP_CMS_API_URL` is correct
- Verify CMS is deployed and running
- Test API endpoint directly in browser

### Issue: Content Not Appearing
**Solution**:
- Check browser console for errors
- Verify content is published in CMS
- Check network tab for API responses
- Verify sanitization isn't removing content

### Issue: Stale Data
**Solution**: 
- Cache-busting is already enabled
- Hard refresh browser (Ctrl+Shift+R)
- Check CMS content is actually updated

---

## 📚 Related Files

- **CMS API Client**: `src/utils/cmsClient.js`
- **CMS API Routes**: `cms/app/api/cms/**/route.ts`
- **Sanitization Utils**: `cms/lib/utils/sanitize.ts`
- **React Sanitization**: `src/utils/sanitize.js`
- **Global Styles**: `cms/app/globals.css`
- **Tailwind Config**: `cms/tailwind.config.ts`


