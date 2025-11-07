# 🚀 Emscale CMS - Enterprise Edition

**A production-ready, enterprise-grade headless CMS that rivals Sanity.**

---

## 🎯 Overview

Emscale CMS is a **self-hosted, open-source content management system** built with modern technologies, offering enterprise features at zero cost.

### Why Emscale CMS?

| Feature                | Sanity   | WordPress          | Strapi   | **Emscale CMS**     |
| ---------------------- | -------- | ------------------ | -------- | ------------------- |
| **Cost**               | $99/mo   | Free (hosting req) | Free     | ✅ **$0 Forever**   |
| **Self-Hosted**        | Optional | Yes                | Yes      | ✅ **Always**       |
| **GraphQL**            | Yes      | Plugin             | Yes      | ✅ **Built-in**     |
| **REST API**           | Yes      | Yes                | Yes      | ✅ **Built-in**     |
| **Real-time**          | Yes      | No                 | No       | ✅ **WebSockets**   |
| **TypeScript**         | Yes      | No                 | Yes      | ✅ **100%**         |
| **Authentication**     | Built-in | Basic              | Built-in | ✅ **NextAuth**     |
| **Version Control**    | Yes      | Plugin             | No       | ✅ **Built-in**     |
| **Live Preview**       | Yes      | Plugin             | No       | ✅ **Split-screen** |
| **Workflows**          | Yes      | Plugin             | Yes      | ✅ **Built-in**     |
| **Image Optimization** | Yes      | Basic              | Yes      | ✅ **Sharp**        |
| **Custom UI**          | Yes      | Limited            | Yes      | ✅ **Unlimited**    |

---

## ✨ Enterprise Features

### 🔐 **Authentication & Authorization**

- ✅ NextAuth.js integration
- ✅ Multiple providers (Google, GitHub, Credentials)
- ✅ Role-based access control (Admin, Editor, Author, Viewer)
- ✅ JWT-based sessions
- ✅ API key management

### 🔄 **Real-Time Collaboration**

- ✅ WebSocket-based live editing
- ✅ See who's editing in real-time
- ✅ Cursor tracking
- ✅ Conflict resolution
- ✅ Presence indicators

### 🎨 **Advanced Content Management**

- ✅ Rich text editor (Tiptap)
- ✅ Live preview (Desktop/Tablet/Mobile)
- ✅ Version history & rollback
- ✅ Content workflows (Draft → Review → Published)
- ✅ Content validation
- ✅ Content relationships
- ✅ Schema-driven architecture

### 🔌 **Dual API Architecture**

- ✅ **REST API** - Full CRUD operations
- ✅ **GraphQL API** - Flexible queries
- ✅ OpenAPI/Swagger documentation
- ✅ Rate limiting
- ✅ Caching layer

### 🖼️ **Media Management**

- ✅ Image upload & optimization
- ✅ Sharp-based processing
- ✅ WebP conversion
- ✅ Responsive images
- ✅ CDN-ready URLs

### 📊 **Analytics & Monitoring**

- ✅ Built-in analytics
- ✅ Activity logging
- ✅ Performance tracking
- ✅ User analytics
- ✅ Content insights

### 🧪 **Testing & Quality**

- ✅ Unit tests (Jest)
- ✅ E2E tests (Playwright)
- ✅ TypeScript strict mode
- ✅ ESLint configuration
- ✅ Code coverage reports

### 🚀 **Deployment Ready**

- ✅ Docker support
- ✅ Docker Compose setup
- ✅ Vercel configuration
- ✅ Environment variables
- ✅ Production optimizations

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend Layer                     │
│  Next.js 15 App Router + React 18 + TypeScript      │
│  - Public website pages                              │
│  - Admin dashboard                                   │
│  - Live preview system                               │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────┐
│                   API Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  REST API   │  │  GraphQL    │  │ WebSockets  │ │
│  │  /api/cms/* │  │ /api/graphql│  │  Real-time  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────┐
│                 Business Logic                       │
│  - Content validation                                │
│  - Workflows & permissions                           │
│  - Version control                                   │
│  - Media processing                                  │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────┐
│                  Data Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  SQLite     │  │   Redis     │  │  FileSystem │ │
│  │  Primary DB │  │   Cache     │  │   Uploads   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
emscale-cms/
│
├── app/                          # Next.js App Router
│   ├── (public)/                # Public routes
│   │   ├── page.tsx            # Homepage
│   │   ├── blog/               # Blog pages
│   │   └── services/           # Service pages
│   │
│   ├── admin/                   # Admin CMS
│   │   ├── page.tsx            # Dashboard
│   │   ├── blog/               # Blog management
│   │   ├── services/           # Services management
│   │   └── team/               # Team management
│   │
│   ├── api/                     # API Routes
│   │   ├── auth/               # Authentication
│   │   ├── cms/                # REST API
│   │   ├── graphql/            # GraphQL endpoint
│   │   ├── upload/             # File uploads
│   │   └── docs/               # API documentation
│   │
│   └── auth/                    # Auth pages
│       ├── signin/             # Login page
│       └── error/              # Error page
│
├── lib/                         # Core Business Logic
│   ├── db.ts                   # Database setup
│   ├── db-extended.ts          # Extended schema
│   ├── auth/                   # Authentication
│   │   └── config.ts           # NextAuth config
│   ├── cms/                    # CMS Core
│   │   ├── types.ts            # TypeScript types
│   │   ├── api.ts              # Database operations
│   │   ├── schemas.ts          # Content schemas
│   │   ├── versioning.ts       # Version control
│   │   └── workflows.ts        # Content workflows
│   ├── realtime/               # WebSocket server
│   │   └── server.ts
│   └── monitoring/             # Analytics
│       └── analytics.ts
│
├── components/                  # UI Components
│   ├── ui/                     # shadcn/ui components
│   ├── cms/                    # CMS-specific components
│   │   ├── rich-text-editor.tsx
│   │   └── live-preview.tsx
│   └── sections/               # Page sections
│
├── hooks/                       # Custom React hooks
│   ├── use-media-query.ts
│   ├── use-scroll-reveal.ts
│   └── use-realtime-collaboration.ts
│
├── e2e/                         # E2E tests
│   └── tests/
│
├── __tests__/                   # Unit tests
│
├── public/                      # Static assets
│   └── uploads/                # User uploads
│
├── Configuration Files
├── middleware.ts               # Auth middleware
├── next.config.ts              # Next.js config
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
├── jest.config.js              # Jest config
├── playwright.config.ts        # Playwright config
├── docker-compose.yml          # Docker setup
├── Dockerfile                  # Docker image
├── vercel.json                 # Vercel deployment
└── .env.example                # Environment variables
```

---

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Open browser
http://localhost:3000
```

### Default Admin Credentials

```
Email: admin@emscale.com
Password: admin123

⚠️ Change these immediately in production!
```

---

## 🔌 API Access

### REST API

```bash
# Get all published blog posts
GET /api/cms/blog?published=true

# Create new post
POST /api/cms/blog
Content-Type: application/json
{
  "title": "My Post",
  "slug": "my-post",
  "content": "...",
  "published": true
}
```

### GraphQL API

```bash
# GraphQL endpoint
POST /api/graphql

# Example query
{
  blogPosts(published: true) {
    id
    title
    slug
    excerpt
    author
  }
}
```

### API Documentation

Visit: `http://localhost:3000/api/docs` for full OpenAPI/Swagger docs

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Type checking
npm run typecheck
```

---

## 🐳 Docker Deployment

```bash
# Build image
npm run docker:build

# Run with Docker Compose
npm run docker:run

# Or manually
docker build -t emscale-cms .
docker run -p 3000:3000 emscale-cms
```

---

## ☁️ Cloud Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### AWS / Google Cloud / Azure

Use the Docker image for deployment on any cloud platform.

---

## 🔒 Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Password Hashing** - bcrypt encryption
- ✅ **CSRF Protection** - Built into Next.js
- ✅ **XSS Protection** - Content sanitization
- ✅ **Rate Limiting** - API throttling
- ✅ **HTTPS Enforcement** - Production ready
- ✅ **Role-Based Access** - Granular permissions

---

## 📊 Monitoring & Analytics

### Built-in Analytics

```typescript
import { analytics } from "@/lib/monitoring/analytics";

// Track events
analytics.track("page_view", "/blog/my-post");

// Get dashboard stats
const stats = analytics.getDashboardStats();

// Get page views
const views = analytics.getPageViews(30);
```

### Integrate External Services

- Google Analytics
- Posthog
- Mixpanel
- Amplitude

---

## 🎨 Customization

### Add New Content Type

1. **Define Schema** (`lib/cms/schemas.ts`):

```typescript
export const productSchema: Schema = {
  name: "product",
  title: "Products",
  type: "document",
  fields: [
    { name: "title", type: "string", required: true },
    { name: "price", type: "number" },
    // ...
  ],
};
```

2. **Create API** (`app/api/cms/products/route.ts`)
3. **Add to Admin** (`app/admin/products/page.tsx`)
4. **Display on Frontend** (`app/products/page.tsx`)

---

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=./content.db

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret

# Image Optimization
SHARP_IGNORE_GLOBAL_LIBVIPS=1

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## 📈 Scalability

### Performance Optimizations

- ✅ **Database Indexing** - Optimized queries
- ✅ **Image Optimization** - Sharp processing
- ✅ **Code Splitting** - Next.js automatic
- ✅ **Caching** - Redis ready
- ✅ **CDN** - Static asset delivery
- ✅ **Lazy Loading** - Components & images

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  app-1:
    build: .
    ports: ["3001:3000"]

  app-2:
    build: .
    ports: ["3002:3000"]

  nginx:
    image: nginx
    # Load balancer configuration
```

---

## 🔌 Integration Options

### Webhooks

```typescript
// Trigger on content changes
POST https://your-domain.com/webhook
{
  "event": "blog.published",
  "document": { ...data }
}
```

### Headless Usage

```typescript
// Use as headless CMS for any frontend
// React, Vue, Angular, Mobile apps, etc.

fetch("https://your-cms.com/api/cms/blog?published=true")
  .then((res) => res.json())
  .then((data) => console.log(data));
```

---

## 📚 API Documentation

### REST Endpoints

```
Blog Posts:
  GET    /api/cms/blog
  POST   /api/cms/blog
  GET    /api/cms/blog/[id]
  PUT    /api/cms/blog/[id]
  DELETE /api/cms/blog/[id]
  GET    /api/cms/blog/[id]/versions

Services:
  GET/POST   /api/cms/services
  GET/PUT/DELETE /api/cms/services/[id]

Team:
  GET/POST   /api/cms/team
  GET/PUT/DELETE /api/cms/team/[id]

Upload:
  POST   /api/upload

GraphQL:
  POST   /api/graphql
```

### GraphQL Schema

```graphql
query {
  blogPosts(published: true) {
    id
    title
    slug
    excerpt
    content
    author
    featured_image
    category
    tags
    publish_date
  }
}

mutation {
  createBlogPost(
    input: {
      title: "My Post"
      slug: "my-post"
      content: "..."
      published: true
    }
  ) {
    id
    title
  }
}
```

---

## 🎯 Use Cases

### 1. **Corporate Website**

- Manage pages, blog, team, services
- Multi-user editing
- Workflow approvals

### 2. **Marketing Site**

- Landing pages
- Case studies
- Blog & resources

### 3. **Documentation Site**

- Technical docs
- Guides & tutorials
- API reference

### 4. **E-commerce Content**

- Product descriptions
- Category pages
- Blog for SEO

### 5. **Multi-Site Management**

- Multiple brands
- Shared content
- Centralized control

---

## 🌟 Roadmap

### Current (v1.0)

- [x] Core CMS functionality
- [x] Authentication & authorization
- [x] REST & GraphQL APIs
- [x] Real-time collaboration
- [x] Version control
- [x] Media management

### Next (v1.1)

- [ ] Plugin marketplace
- [ ] AI content generation
- [ ] Advanced search (Algolia/Meilisearch)
- [ ] Multi-language support
- [ ] Content scheduling
- [ ] Advanced analytics dashboard

### Future (v2.0)

- [ ] Multi-tenancy
- [ ] Cloud-native deployment
- [ ] Kubernetes support
- [ ] Advanced workflows
- [ ] Commerce integration
- [ ] Mobile app

---

## 🤝 Contributing

We welcome contributions! This is an open-source project.

```bash
# Fork the repository
# Create a feature branch
git checkout -b feature/amazing-feature

# Commit your changes
git commit -m "Add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

---

## 📄 License

MIT License - Free to use commercially and personally

---

## 🏢 Enterprise Support

For enterprise support, custom development, or consulting:

- Email: enterprise@emscale.com
- Website: https://emscale.com

---

## 🎉 Built With

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Database**: SQLite (upgradable to PostgreSQL)
- **Authentication**: NextAuth.js
- **Real-time**: Socket.IO
- **API**: REST + GraphQL (Yoga)
- **Editor**: Tiptap
- **Validation**: Zod
- **Testing**: Jest + Playwright
- **Styling**: Tailwind CSS
- **Image Processing**: Sharp

---

**Emscale CMS** - The open-source alternative to Sanity 🚀

Built with ❤️ for developers, by developers




