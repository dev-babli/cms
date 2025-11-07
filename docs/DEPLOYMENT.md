# Deployment Guide

This guide covers deploying Emscale CMS to various platforms and environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deployment Platforms](#deployment-platforms)
- [Docker Deployment](#docker-deployment)
- [Production Checklist](#production-checklist)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

1. Node.js 20+ installed
2. All dependencies installed (`npm install`)
3. A successful build (`npm run build`)
4. Environment variables configured
5. Database initialized (`npm run db:init`)

## Environment Variables

Copy `env.example` to `.env.local` and configure:

```bash
cp env.example .env.local
```

**Critical variables to change in production:**

- `ADMIN_EMAIL` and `ADMIN_PASSWORD` - Default admin credentials
- `SESSION_SECRET` and `JWT_SECRET` - Use strong random strings
- `NEXT_PUBLIC_APP_URL` - Your production domain
- `CLOUDINARY_*` - If using media CDN
- `SMTP_*` - For email notifications

## Deployment Platforms

### Vercel (Recommended)

**One-click deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Manual deploy:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Configuration:**

- Uses `deploy/vercel.json`
- Automatically detects Next.js
- Set environment variables in Vercel Dashboard

### Netlify

**Deploy:**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

**Configuration:**

- Uses `deploy/netlify.toml`
- Requires `@netlify/plugin-nextjs` plugin
- Set environment variables in Netlify Dashboard

### Railway

**Deploy:**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

**Configuration:**

- Auto-detects from `package.json`
- Set environment variables in Railway Dashboard
- Supports custom domains

### Render

**Deploy:**

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Use these settings:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Environment: Node
4. Add environment variables in Render Dashboard

## Docker Deployment

### Build Docker Image

```bash
docker build -t emscale-cms:latest .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e ADMIN_EMAIL=admin@example.com \
  -e ADMIN_PASSWORD=secure_password \
  emscale-cms:latest
```

### Docker Compose

```bash
docker-compose up -d
```

### Push to Registry

```bash
# Tag for registry
docker tag emscale-cms:latest your-registry/emscale-cms:latest

# Push
docker push your-registry/emscale-cms:latest
```

## Universal Deployment CLI

Use our deployment CLI for automated deployment:

```bash
# Auto-detect platform and deploy
node scripts/deploy.js

# Deploy to specific platform
node scripts/deploy.js vercel

# Skip preflight checks
node scripts/deploy.js --skip-checks
```

## Production Checklist

### Security

- [ ] Change default admin credentials
- [ ] Use strong secrets for SESSION_SECRET and JWT_SECRET
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Configure CORS allowed origins
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Review and restrict API permissions

### Performance

- [ ] Enable production build optimizations
- [ ] Configure CDN for media files
- [ ] Set up caching headers
- [ ] Enable compression
- [ ] Optimize database queries
- [ ] Set up monitoring and alerts

### Data

- [ ] Set up regular database backups
- [ ] Configure data retention policies
- [ ] Test restore procedures
- [ ] Set up error tracking
- [ ] Configure log aggregation

### Monitoring

- [ ] Set up health checks
- [ ] Configure uptime monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Enable analytics
- [ ] Set up alerting for critical issues

## Database Management

### Initialize Database

```bash
npm run db:init
```

### Backup Database

```bash
# SQLite backup
cp content.db content.db.backup

# Or use the backup script
node scripts/backup-db.js
```

### Restore Database

```bash
cp content.db.backup content.db
```

## Environment-Specific Configurations

### Development

```bash
NODE_ENV=development
npm run dev
```

### Staging

```bash
NODE_ENV=staging
npm run build
npm start
```

### Production

```bash
NODE_ENV=production
npm run build
npm start
```

## CI/CD Setup

### GitHub Actions

The repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that:

1. Runs tests on every push
2. Builds the application
3. Deploys to production on main branch
4. Sends deployment notifications

**Required secrets:**

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### GitLab CI/CD

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  script:
    - npm ci
    - npm run test

build:
  stage: build
  script:
    - npm run build
  artifacts:
    paths:
      - .next

deploy:
  stage: deploy
  script:
    - node scripts/deploy.js
  only:
    - main
```

## Scaling

### Horizontal Scaling

For high-traffic deployments:

1. Use a managed database (PostgreSQL, MySQL)
2. Set up Redis for session storage
3. Deploy multiple instances behind a load balancer
4. Use CDN for static assets
5. Implement database read replicas

### Vertical Scaling

Recommended server specifications:

**Small (< 1000 users):**

- 1 CPU core
- 2GB RAM
- 10GB storage

**Medium (< 10,000 users):**

- 2 CPU cores
- 4GB RAM
- 50GB storage

**Large (< 100,000 users):**

- 4+ CPU cores
- 8GB+ RAM
- 100GB+ storage

## Troubleshooting

### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Issues

```bash
# Re-initialize database
rm content.db
npm run db:init
```

### Memory Issues

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

### Port Conflicts

```bash
# Change port
PORT=3001 npm start
```

## Support

For deployment assistance:

- Check [GitHub Issues](https://github.com/emscale/cms/issues)
- Join our [Discord Community](https://discord.gg/emscale)
- Email: support@emscale.com

## Next Steps

After deployment:

1. Access admin panel at `/admin`
2. Change default credentials
3. Configure your content types
4. Set up webhooks (if needed)
5. Install plugins
6. Configure workflows
7. Set up monitoring
8. Test your deployment

---

**Note:** Always test deployments in a staging environment before deploying to production.



