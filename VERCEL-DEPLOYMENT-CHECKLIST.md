# Vercel Deployment Checklist - Intellectt CMS

Complete step-by-step guide for deploying the CMS to Vercel.

## Prerequisites

- [ ] GitHub repository with CMS code
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] Supabase account and project
- [ ] All environment variables ready

---

## Step 1: Prepare Your Repository

### 1.1 Verify Code is Ready
```bash
cd cms
npm run build
```
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] All dependencies installed

### 1.2 Commit and Push
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

---

## Step 2: Connect to Vercel

### 2.1 Import Project
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the repository containing the CMS

### 2.2 Configure Project Settings
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `cms` (if CMS is in a subdirectory)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

---

## Step 3: Set Environment Variables

### 3.1 Required Variables

Go to **Project Settings** → **Environment Variables** and add:

#### Supabase Configuration (Public)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - Value: `https://your-project.supabase.co`
  - Environment: Production, Preview, Development
  - **Mark as Public** (available in browser)

- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Value: Your Supabase anon key
  - Environment: Production, Preview, Development
  - **Mark as Public** (available in browser)

#### Supabase Configuration (Private - Server-side)
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - Value: Your Supabase service role key
  - Environment: Production, Preview, Development
  - **Keep Private** (server-side only)

#### Database Configuration (Private)
- [ ] `DATABASE_URL`
  - Value: PostgreSQL connection string from Supabase
  - Format: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`
  - **URL-encode special characters** (e.g., `@` becomes `%40`)
  - Environment: Production, Preview, Development
  - **Keep Private** (server-side only)

#### NextAuth Configuration (Private)
- [ ] `NEXTAUTH_SECRET`
  - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
  - Or: `openssl rand -base64 32`
  - Environment: Production, Preview, Development
  - **Keep Private** (server-side only)

- [ ] `NEXTAUTH_URL`
  - Value: Your Vercel deployment URL
  - Example: `https://your-app.vercel.app`
  - Environment: **Production only**
  - **Keep Private** (server-side only)

### 3.2 Verify Variables
- [ ] All variables are set
- [ ] Public variables are marked as "Public"
- [ ] Private variables are NOT marked as "Public"
- [ ] `NEXTAUTH_URL` is set for Production environment

---

## Step 4: Run Database Migrations

### 4.1 Verify Migrations
Before deploying, ensure your Supabase database has all required migrations:

1. Go to Supabase Dashboard → SQL Editor
2. Run the migration script from `cms/supabase-auth-migration.sql`
3. Or run: `node scripts/run-migrations.js` (if you have local access)

Required migrations:
- [ ] `password_hash` column is nullable
- [ ] `supabase_user_id` column exists
- [ ] `idx_users_supabase_id` index exists
- [ ] `sessions` table exists

### 4.2 Verify Migration Status
```bash
cd cms
node scripts/verify-migrations.js
```
- [ ] All required migrations pass

---

## Step 5: Deploy

### 5.1 Initial Deployment
1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Check build logs for errors

### 5.2 Verify Deployment
- [ ] Build completes successfully
- [ ] No errors in build logs
- [ ] Deployment URL is accessible

---

## Step 6: Post-Deployment Testing

### 6.1 Test Authentication
- [ ] Visit `/auth/login`
- [ ] Login with admin credentials works
- [ ] Cookies are set correctly (check browser DevTools)
- [ ] Redirect to `/admin` works

### 6.2 Test Registration
- [ ] Visit `/auth/register`
- [ ] Registration form works
- [ ] New user is created with `pending` status
- [ ] Success message displays correctly

### 6.3 Test Admin Functions
- [ ] Admin dashboard loads
- [ ] User management works
- [ ] Can approve pending users
- [ ] Content management (blog, services, etc.) works

### 6.4 Test API Routes
- [ ] `/api/auth/login` works
- [ ] `/api/auth/register` works
- [ ] `/api/auth/logout` works
- [ ] `/api/auth/me` works
- [ ] Protected routes require authentication

---

## Step 7: Troubleshooting

### Issue: Build Fails

**Check:**
- [ ] All environment variables are set
- [ ] No TypeScript errors
- [ ] All dependencies are in `package.json`
- [ ] Build logs for specific errors

**Fix:**
- Review build logs in Vercel dashboard
- Fix any TypeScript or build errors
- Redeploy

### Issue: Login Doesn't Work

**Check:**
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- [ ] `DATABASE_URL` is correct and URL-encoded
- [ ] Supabase Auth is enabled
- [ ] User exists in Supabase Auth
- [ ] Cookies are being set (check browser DevTools)

**Fix:**
- Verify environment variables in Vercel
- Check Vercel function logs
- Test Supabase connection locally

### Issue: Cookies Not Persisting

**Check:**
- [ ] `secure: true` is set for production (HTTPS required)
- [ ] `sameSite: 'lax'` is set
- [ ] Domain is NOT set (allows Vercel subdomains)
- [ ] Browser allows cookies

**Fix:**
- Verify cookie settings in `app/api/auth/login/route.ts`
- Check browser console for cookie errors
- Test in incognito mode

### Issue: Database Connection Errors

**Check:**
- [ ] `DATABASE_URL` is correct
- [ ] Password is URL-encoded
- [ ] Supabase connection pooler is enabled
- [ ] Database is accessible

**Fix:**
- Verify connection string format
- Check Supabase dashboard for connection issues
- Review Vercel function logs

### Issue: Environment Variables Not Available

**Check:**
- [ ] Variables are set in Vercel dashboard
- [ ] Correct environment is selected (Production/Preview/Development)
- [ ] Variables are redeployed (changes require redeploy)

**Fix:**
- Add missing variables
- Redeploy after adding variables
- Check variable names match exactly

---

## Step 8: Production Optimization

### 8.1 Performance
- [ ] Enable Vercel Analytics (optional)
- [ ] Configure caching headers
- [ ] Optimize images
- [ ] Minimize bundle size

### 8.2 Security
- [ ] All secrets are in environment variables (not in code)
- [ ] HTTPS is enforced (automatic on Vercel)
- [ ] Cookies are secure in production
- [ ] Rate limiting considered (if needed)

### 8.3 Monitoring
- [ ] Set up Vercel monitoring
- [ ] Configure error tracking (optional)
- [ ] Set up uptime monitoring (optional)

---

## Step 9: Final Verification

### 9.1 Complete Checklist
- [ ] All environment variables set
- [ ] Database migrations complete
- [ ] Build succeeds
- [ ] Login works
- [ ] Registration works
- [ ] Admin functions work
- [ ] No console errors
- [ ] Cookies work correctly
- [ ] Mobile responsive
- [ ] Performance is acceptable

### 9.2 Documentation
- [ ] Deployment URL documented
- [ ] Admin credentials secured
- [ ] Team members have access
- [ ] Backup plan in place

---

## Quick Reference

### Environment Variables Summary

**Public (Browser):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Private (Server):**
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (Production only)

### Important URLs

- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- Project Settings: Vercel Dashboard → Your Project → Settings

### Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Vercel function logs
3. Review this checklist
4. Check `cms/TROUBLESHOOTING.md`

---

## Success!

Once all checks pass, your CMS is live on Vercel! 🎉

