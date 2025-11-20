# 🎯 Intellectt CMS - Content Management System

This CMS is specifically configured for the **Intellectt website**. It provides a backend content management system that powers the main Intellectt website.

## 🏗️ Architecture

```
Intellectt Website (React)  ←──→  Intellectt CMS (Next.js)
   Port 3000                        Port 3001
   Public Pages                     Admin Dashboard Only
   - Blog Pages                     - Content Management
   - Service Pages                  - API Endpoints
   - Team Pages                     - Authentication
```

## ✨ What This CMS Does

- **Content Management**: Create, edit, and publish blog posts, services, and team members
- **API Backend**: Provides REST and GraphQL APIs for the Intellectt website
- **Admin Dashboard**: Secure admin interface for content management
- **Real-time Updates**: Changes reflect immediately on the Intellectt website

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd cms
npm install
```

### 2. Initialize Database

```bash
npm run setup
```

This creates the SQLite database and seeds initial data.

### 3. Start CMS Server

```bash
npm run dev
```

CMS will run on **http://localhost:3001**

### 4. Access Admin Dashboard

- URL: http://localhost:3001/admin
- Default Login:
  - Email: `admin@emscale.com`
  - Password: `admin123`

## 📝 What Was Removed

The following public pages were removed since the Intellectt website already has them:

- ❌ `/blog` - Blog listing page
- ❌ `/blog/[slug]` - Individual blog post page
- ❌ `/services` - Services page
- ❌ `/service-detail` - Service detail page
- ❌ `/about-us` - About us page
- ❌ `/` - Homepage (now redirects to `/admin`)

## ✅ What Remains

### Admin Pages (Content Management)
- ✅ `/admin` - Dashboard
- ✅ `/admin/blog` - Blog post management
- ✅ `/admin/services` - Service management
- ✅ `/admin/team` - Team member management
- ✅ `/admin/media` - Media library
- ✅ `/admin/users` - User management

### API Endpoints (For Intellectt Website)
- ✅ `/api/cms/blog` - Blog posts API
- ✅ `/api/cms/services` - Services API
- ✅ `/api/cms/team` - Team members API
- ✅ `/api/graphql` - GraphQL API

### Authentication
- ✅ `/auth/login` - Admin login
- ✅ `/auth/register` - User registration

## 🔌 API Integration

The Intellectt website fetches content from these APIs:

### Blog Posts
```javascript
GET /api/cms/blog?published=true
GET /api/cms/blog/[id]
POST /api/cms/blog
PUT /api/cms/blog/[id]
DELETE /api/cms/blog/[id]
```

### Services
```javascript
GET /api/cms/services?published=true
POST /api/cms/services
PUT /api/cms/services/[id]
DELETE /api/cms/services/[id]
```

### Team Members
```javascript
GET /api/cms/team?published=true
POST /api/cms/team
PUT /api/cms/team/[id]
DELETE /api/cms/team/[id]
```

All API routes have CORS enabled for the Intellectt website.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the `cms` directory:

```env
# Database
DATABASE_URL=./content.db

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3001

# Optional: OAuth providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

### Port Configuration

The CMS runs on port **3001** by default. The Intellectt website should be configured to connect to this port:

```env
# In Intellectt website .env
REACT_APP_CMS_API_URL=http://localhost:3001
```

## 📊 Database

The CMS uses SQLite by default (file: `content.db`). Tables include:

- `blog_posts` - Blog articles
- `services` - Service offerings
- `team_members` - Team profiles
- `users` - Admin users
- `media` - Uploaded files
- `testimonials` - Customer testimonials

## 🔒 Security

- Admin routes require authentication
- API routes are public (for Intellectt website)
- CORS is configured for Intellectt website domain
- Password hashing with bcrypt
- Session management with NextAuth

## 🚢 Deployment

### Development
- CMS: `http://localhost:3001`
- Intellectt Website: `http://localhost:3000`

### Production

1. **Deploy CMS** to a hosting service:
   - Vercel, AWS, or self-hosted
   - Example: `https://cms.intellectt.com`

2. **Update Intellectt Website** environment:
   ```env
   REACT_APP_CMS_API_URL=https://cms.intellectt.com
   ```

3. **Configure CORS** for production:
   Update CORS headers in API routes to allow only your Intellectt website domain.

## 📚 Usage Guide

### Creating Blog Posts

1. Go to `/admin/blog`
2. Click "New Post"
3. Fill in:
   - Title, slug, excerpt
   - Content (rich text editor)
   - Author, category, tags
   - Featured image URL
   - Check "Published" to publish immediately
4. Click "Create Blog Post"
5. Post appears on Intellectt website blog page

### Managing Services

1. Go to `/admin/services`
2. Add or edit services
3. Published services appear on Intellectt website

### Managing Team

1. Go to `/admin/team`
2. Add team members with photos and bios
3. Published members appear on Intellectt website

## 🔄 How It Works

1. **Content Creation**: Admin creates content in CMS dashboard
2. **API Storage**: Content saved to SQLite database
3. **API Access**: Intellectt website fetches content via REST/GraphQL APIs
4. **Display**: Content appears on Intellectt website pages
5. **Real-time**: Changes reflect immediately (no rebuild needed)

## 🐛 Troubleshooting

### CMS Not Starting
- Check if port 3001 is available
- Verify database file exists (`content.db`)
- Run `npm run setup` to initialize database

### API Not Responding
- Verify CMS is running on port 3001
- Check CORS headers in API routes
- Verify Intellectt website has correct API URL

### Content Not Appearing
- Check if content is marked as "Published"
- Verify API endpoint is correct
- Check browser console for errors

## 📖 Additional Documentation

- **CMS-GUIDE.md** - Complete CMS usage guide
- **CMS-QUICKSTART.md** - Quick reference
- **ENTERPRISE-README.md** - Enterprise features
- **STRUCTURE.md** - Project structure

---

**Intellectt CMS** - Powering the Intellectt website with modern content management.

