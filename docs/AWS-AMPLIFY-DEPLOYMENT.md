# AWS Amplify Deployment Guide

## 🚨 CRITICAL: Your Current Setup Has Issues

### ❌ **Problems with Manual Zip Upload**

1. **SQLite Database Won't Persist**

   - AWS Amplify uses ephemeral storage
   - Your `content.db` file will be **deleted on every deployment**
   - All content/users will be lost after each deploy
   - **Solution**: Must use external database (PostgreSQL/MySQL)

2. **Manual Deployment is Inefficient**

   - Building locally creates inconsistencies
   - Missing CI/CD benefits
   - No automatic environment variable injection
   - Slower deployment process

3. **Missing Amplify Configuration**
   - Without `amplify.yml`, Amplify might not detect Next.js properly
   - API routes may not be configured correctly
   - Build optimizations not applied

---

## ✅ How Your Backend WILL Work on Amplify

AWS Amplify **fully supports Next.js with API routes**:

- ✅ All files in `app/api/**/*.ts` will work as serverless functions
- ✅ Authentication endpoints will function
- ✅ GraphQL endpoint will work
- ✅ File uploads will work (but need external storage like S3)
- ❌ SQLite database **will NOT work** (ephemeral filesystem)
- ⚠️ Socket.io server needs separate deployment

---

## 🔧 **Required Changes for Production**

### **1. Replace SQLite with PostgreSQL (CRITICAL)**

**Why**: AWS Amplify doesn't have persistent disk storage. SQLite file will be deleted.

**Options**:

- **Neon** (Best, Free tier): https://neon.tech
- **Supabase** (Free tier): https://supabase.com
- **AWS RDS** (Paid but integrated): PostgreSQL on AWS

**Steps**:

1. **Create PostgreSQL database** on Neon/Supabase
2. **Get connection string**: `postgresql://user:pass@host:5432/db`
3. **Add to Amplify environment variables**:

   ```
   DATABASE_URL=postgresql://...
   ```

4. **Update code** (I can help with this):
   - Replace `better-sqlite3` with `pg` (PostgreSQL client)
   - Update `lib/db.ts` to use PostgreSQL
   - Update schema initialization

### **2. Configure Socket.io Separately**

Your real-time collaboration features need a separate server:

**Option A**: Deploy to Railway/Render (Recommended)

```bash
# Create separate Socket.io server repository
# Deploy to Railway: railway init && railway up
```

**Option B**: AWS Lambda with WebSocket API

- More complex setup
- Requires API Gateway WebSocket configuration

### **3. Use S3 for Media Storage**

Instead of local `public/uploads/`:

- Store images in **AWS S3**
- Update media upload code to use S3
- Update `lib/images.ts` to use S3 URLs

---

## 🚀 **Proper AWS Amplify Deployment Methods**

### **Method 1: Git-Based Deployment (RECOMMENDED)**

**Benefits**:

- Automatic deployments on Git push
- Environment variables managed in console
- Preview deployments for branches
- CI/CD pipeline built-in

**Steps**:

1. **Push your code to GitHub/GitLab/Bitbucket**:

   ```bash
   git add .
   git commit -m "Prepare for Amplify deployment"
   git push origin main
   ```

2. **Connect Repository in AWS Amplify**:

   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
   - Click "New app" → "Host web app"
   - Connect your Git repository
   - Select branch (main/master)

3. **Amplify Auto-Detects Configuration**:

   - Uses the `amplify.yml` I created
   - Detects Next.js automatically
   - Configures build settings

4. **Add Environment Variables**:

   - In Amplify Console → App Settings → Environment Variables
   - Add all from `env.example`:

   ```
   NODE_ENV=production
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=your-secure-password
   SESSION_SECRET=generate-random-64-chars
   JWT_SECRET=generate-random-64-chars
   NEXT_PUBLIC_APP_URL=https://your-app.amplifyapp.com
   DATABASE_URL=postgresql://... (YOUR POSTGRESQL CONNECTION)
   ```

5. **Deploy**:
   - Click "Save and Deploy"
   - Amplify builds and deploys automatically
   - Future commits auto-deploy

---

### **Method 2: Manual Zip Upload (Your Current Method)**

⚠️ **Only use this for quick testing, not production**

**Improved Process**:

1. **Set up database FIRST** (PostgreSQL on Neon/Supabase)

2. **Update environment variables** in Amplify Console before building

3. **Build locally**:

   ```bash
   npm run build
   ```

4. **Create deployment package**:

   ```bash
   # Windows PowerShell
   Compress-Archive -Path .next, public, package.json, package-lock.json, node_modules -DestinationPath amplify-deploy.zip
   ```

5. **Upload to Amplify**:
   - Amplify Console → Manual Deploy
   - Upload `amplify-deploy.zip`

**⚠️ Problems**:

- Database still won't persist
- No automatic deploys
- Must rebuild entire project each time
- Environment inconsistencies

---

### **Method 3: AWS Amplify CLI (Best for Teams)**

**Install Amplify CLI**:

```bash
npm install -g @aws-amplify/cli
amplify configure
```

**Initialize**:

```bash
amplify init
amplify add hosting
amplify publish
```

---

## 📋 **Step-by-Step: Complete Production Setup**

### **Step 1: Set Up PostgreSQL Database**

1. **Go to [Neon.tech](https://neon.tech)** (Free tier)
2. **Create account** and new project
3. **Copy connection string**:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb
   ```

### **Step 2: Migrate from SQLite to PostgreSQL**

You need to update these files:

**Required Changes**:

- `package.json` - Replace `better-sqlite3` with `pg`
- `lib/db.ts` - Update to PostgreSQL client
- `lib/auth/users.ts` - Update queries
- `lib/cms/api.ts` - Update queries
- `scripts/init-db.js` - Update schema for PostgreSQL

**Do you want me to make these changes for you?**

### **Step 3: Configure AWS Amplify**

1. **In Amplify Console**, add environment variables:

   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://your-neon-connection-string
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=SecurePass123!
   SESSION_SECRET=your-64-char-random-string
   JWT_SECRET=your-64-char-random-string
   NEXT_PUBLIC_APP_URL=https://main.xxxxx.amplifyapp.com
   ```

2. **Generate secrets**:
   ```bash
   # In your terminal
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Use output for SESSION_SECRET and JWT_SECRET
   ```

### **Step 4: Deploy**

**Option A - Git Deployment**:

```bash
git add amplify.yml
git commit -m "Add Amplify configuration"
git push origin main
# Amplify auto-deploys
```

**Option B - Manual Deploy**:

1. Build: `npm run build`
2. Upload zip in Amplify Console

### **Step 5: Deploy Socket.io Server Separately**

Your real-time features need this:

1. **Extract Socket.io server** to separate project
2. **Deploy to Railway**:
   ```bash
   npm i -g @railway/cli
   railway login
   railway init
   railway up
   ```
3. **Update environment variable**:
   ```
   NEXT_PUBLIC_SOCKET_URL=https://your-railway-app.railway.app
   ```

---

## 🎯 **My Recommendation for You**

### **Immediate Action Plan**:

1. ✅ **Switch to Git-based deployment** (stop using zip uploads)
2. ✅ **Set up Neon PostgreSQL** (free tier, takes 5 minutes)
3. ✅ **Let me migrate your code** from SQLite to PostgreSQL
4. ✅ **Configure Amplify environment variables**
5. ✅ **Deploy Socket.io to Railway** (optional, for real-time features)

### **Cost Breakdown**:

- **AWS Amplify**: $0-$5/month (free tier available)
- **Neon PostgreSQL**: $0 (free tier)
- **Railway (Socket.io)**: $5/month (optional)
- **Total**: **$0-10/month**

---

## ⚡ **Quick Commands**

### **Generate Secure Secrets**:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **Test Build Locally**:

```bash
npm run build
npm start
```

### **Check Build Output**:

```bash
ls -la .next
```

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: "Database file not found"**

**Cause**: SQLite doesn't work on Amplify
**Solution**: Migrate to PostgreSQL (see Step 2 above)

### **Issue 2: "Environment variables not defined"**

**Cause**: Variables not set in Amplify Console
**Solution**: Add in App Settings → Environment Variables

### **Issue 3: "API routes return 404"**

**Cause**: Missing `amplify.yml` or incorrect build
**Solution**: Use the `amplify.yml` file I created

### **Issue 4: "Build fails with module not found"**

**Cause**: Dependencies not installed
**Solution**: Ensure `package.json` is included in deployment

### **Issue 5: "Real-time features not working"**

**Cause**: Socket.io needs separate server
**Solution**: Deploy Socket.io server to Railway

---

## 📞 **Next Steps**

**Tell me what you'd like to do**:

1. ✅ **Migrate to PostgreSQL** (I can do this for you now)
2. ✅ **Set up Git-based deployment** (Better than zip uploads)
3. ✅ **Deploy Socket.io server** (For real-time features)
4. ✅ **Configure S3 for media** (Better than local storage)

**Or keep your current zip method** (but you'll need PostgreSQL regardless)

---

## 🔗 **Useful Links**

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Next.js on Amplify](https://docs.amplify.aws/guides/hosting/nextjs/q/platform/js/)
- [Neon PostgreSQL](https://neon.tech)
- [Railway.app](https://railway.app)

---

**Would you like me to start migrating your database code to PostgreSQL right now?**
