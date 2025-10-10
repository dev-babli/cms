# Emscale CMS - Setup Guide

Quick setup guide to get your CMS up and running.

## Prerequisites

- Node.js 20+ installed
- npm or yarn
- Git (optional)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize Database

The database will be automatically initialized on first login, but you can also run:

```bash
npm run db:init
```

This creates:

- SQLite database (`content.db`)
- All required tables
- Default admin user

### 3. Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### 4. Access Admin Panel

Navigate to: `http://localhost:3000/admin`

**Default credentials:**

- Email: `admin@emscale.com`
- Password: `admin123`

⚠️ **Important:** Change these credentials immediately!

## What Happens on First Run

### Automatic Initialization

When you first try to login, the system will:

1. ✅ Create database tables if they don't exist
2. ✅ Create default admin user if it doesn't exist
3. ✅ Log you in automatically

No manual setup required!

### Manual Initialization

If you prefer to initialize manually:

```bash
# Initialize database and create admin user
npm run db:init

# Optional: Seed with sample data
npm run db:seed

# Or run both
npm run setup
```

## Project Structure

```
Emscale CMS/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── blog/              # Public blog pages
├── lib/                   # Core libraries
│   ├── auth/              # Authentication system
│   ├── cms/               # CMS functionality
│   ├── media/             # Media management
│   ├── workflows/         # Workflow engine
│   ├── plugins/           # Plugin system
│   └── db.ts              # Database connection
├── components/            # React components
├── scripts/               # Utility scripts
├── public/                # Static files
└── content.db            # SQLite database (auto-created)
```

## Configuration

### Environment Variables

Create `.env.local` file:

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin Credentials (optional - will use defaults)
ADMIN_EMAIL=admin@emscale.com
ADMIN_PASSWORD=admin123

# Optional Features
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

See `env.example` for all available options.

## Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:init          # Initialize database
npm run db:seed          # Seed sample data
npm run setup            # Initialize + seed

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
npm run lint             # Lint code
npm run typecheck        # Type checking

# Docker
npm run docker:build     # Build Docker image
npm run docker:run       # Run with Docker Compose
npm run docker:stop      # Stop containers
```

## First Steps After Setup

1. **Login to Admin Panel**

   - Go to `/admin`
   - Use default credentials
   - You'll see the dashboard

2. **Change Admin Password**

   - Go to User Management
   - Edit your profile
   - Set a strong password

3. **Create Your First Post**

   - Go to Blog Posts
   - Click "New Post"
   - Write and publish!

4. **Explore Features**
   - Check out the media library
   - Try the rich text editor
   - Configure workflows
   - Install plugins

## Common Issues

### Database Already Exists

If you see "database already exists" error:

```bash
# Delete existing database
rm content.db content.db-*

# Reinitialize
npm run db:init
```

### Cannot Login

Check:

1. Database is initialized: `npm run db:init`
2. Using correct credentials
3. Check browser console for errors
4. Verify cookies are enabled

### Port Already in Use

Change the port:

```bash
PORT=3001 npm run dev
```

### Module Not Found

Reinstall dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

### Making Changes

1. **Edit files** - Changes hot-reload automatically
2. **Test** - Run `npm run test`
3. **Lint** - Run `npm run lint`
4. **Build** - Run `npm run build` to check for errors

### Adding Content

1. **Login** to `/admin`
2. **Navigate** to content type (Blog, Services, etc.)
3. **Create** new content
4. **Publish** when ready

### Creating Users

1. Go to `/admin/users` (admin only)
2. Click "Create User"
3. Assign roles:
   - **Admin**: Full access
   - **Editor**: Can publish
   - **Author**: Can create
   - **Viewer**: Read-only

## Production Deployment

### Before Deploying

- [ ] Change default admin credentials
- [ ] Set strong secrets in environment variables
- [ ] Enable HTTPS
- [ ] Configure CDN (optional)
- [ ] Set up backups
- [ ] Test all features

### Deploy Platforms

**Vercel (Recommended):**

```bash
npm i -g vercel
vercel --prod
```

**Netlify:**

```bash
npm i -g netlify-cli
netlify deploy --prod
```

**Docker:**

```bash
docker build -t emscale-cms .
docker run -p 3000:3000 emscale-cms
```

See `docs/DEPLOYMENT.md` for detailed instructions.

## Security Checklist

- [ ] Changed default admin password
- [ ] Using environment variables for secrets
- [ ] HTTPS enabled in production
- [ ] Database backed up regularly
- [ ] Only trusted users have admin access
- [ ] Regular security updates

## Getting Help

### Documentation

- **Authentication**: `docs/AUTHENTICATION.md`
- **Deployment**: `docs/DEPLOYMENT.md`
- **Enterprise Features**: `docs/ENTERPRISE-FEATURES.md`
- **Implementation**: `IMPLEMENTATION-COMPLETE.md`

### Support

- GitHub Issues: Report bugs
- Discord: Join community
- Email: support@emscale.com

## What's Next?

1. **Customize**: Edit theme, add pages
2. **Content**: Create blog posts, services
3. **Users**: Add team members
4. **Deploy**: Launch to production
5. **Scale**: Enable enterprise features

---

**Welcome to Emscale CMS!** 🚀

Built with ❤️ for the developer community.

