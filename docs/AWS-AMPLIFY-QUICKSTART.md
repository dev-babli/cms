# 🚀 AWS Amplify Quick Start Guide

## Current Architecture

```
┌─────────────────────────────────────────────────┐
│  YOUR LOCAL MACHINE                             │
│  ├── Build project (npm run build)              │
│  ├── Create .zip file                           │
│  └── Upload to AWS Amplify manually             │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  AWS AMPLIFY                                    │
│  ├── Frontend: Next.js pages ✅                 │
│  ├── Backend: API Routes (app/api/*) ✅         │
│  ├── Database: SQLite (content.db) ❌ BROKEN   │
│  └── Uploads: public/uploads/* ❌ RESETS        │
└─────────────────────────────────────────────────┘
```

## ❌ What's BROKEN Right Now

1. **Database (content.db)** - Gets deleted every deployment
2. **Uploaded files** - Lost on every deployment
3. **Manual process** - Slow, error-prone

---

## ✅ Recommended Architecture

```
┌─────────────────────────────────────────────────┐
│  GITHUB/GITLAB                                  │
│  └── Push code once, auto-deploys              │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  AWS AMPLIFY (Frontend + Backend)               │
│  ├── Next.js Pages ✅                           │
│  ├── API Routes ✅                              │
│  └── Connects to external services ↓            │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  EXTERNAL SERVICES (Required)                   │
│  ├── PostgreSQL (Neon.tech) - $0/month          │
│  ├── AWS S3 - For image uploads - $1-2/month    │
│  └── Railway - Socket.io server (optional)      │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Action Plan (Choose One)

### **Option A: Quick Fix (Keep Zip Method)**

**Time**: 30 minutes | **Difficulty**: Easy

1. ✅ **Create PostgreSQL database** (Neon.tech - Free)
2. ✅ **Update code** to use PostgreSQL (I'll help)
3. ✅ **Add DATABASE_URL** to Amplify environment variables
4. ✅ **Rebuild and upload** new zip

**Result**: Your database will persist between deployments

---

### **Option B: Proper Setup (Recommended)**

**Time**: 1 hour | **Difficulty**: Medium

1. ✅ **Push code to GitHub**
2. ✅ **Connect GitHub to Amplify** (auto-deploys)
3. ✅ **Create PostgreSQL database** (Neon.tech)
4. ✅ **Update code** to use PostgreSQL
5. ✅ **Configure environment variables** in Amplify
6. ✅ **(Optional)** Deploy Socket.io to Railway

**Result**: Professional production setup with CI/CD

---

## 💰 Cost Comparison

| Service     | Current     | With PostgreSQL | Full Setup   |
| ----------- | ----------- | --------------- | ------------ |
| AWS Amplify | $0-5        | $0-5            | $0-5         |
| Database    | ❌ Broken   | $0 (Neon)       | $0 (Neon)    |
| Socket.io   | Not working | Not working     | $5 (Railway) |
| **Total**   | **$5**      | **$5**          | **$10**      |

---

## 🔥 Critical: Database Migration Required

Your SQLite database **WILL NOT WORK** on Amplify. Here's what needs to change:

### **Before (SQLite - Current)**

```javascript
// lib/db.ts
import Database from "better-sqlite3";
const db = new Database("content.db");
```

### **After (PostgreSQL - Required)**

```javascript
// lib/db.ts
import { Pool } from "pg";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
```

**I can make these changes for you - just ask!**

---

## 📝 Environment Variables You Need

Add these in **AWS Amplify Console** → **Environment Variables**:

```env
# Required
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!
SESSION_SECRET=YOUR_64_CHAR_SECRET_HERE
JWT_SECRET=YOUR_64_CHAR_SECRET_HERE
NEXT_PUBLIC_APP_URL=https://main.xxxxx.amplifyapp.com

# Optional
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

**Generate secrets**:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🚨 What Happens If You Don't Fix Database?

Every time you deploy:

- ❌ All blog posts deleted
- ❌ All users deleted
- ❌ All content deleted
- ❌ Admin account reset
- ❌ All uploaded images deleted

**This is why PostgreSQL is CRITICAL!**

---

## ✅ What I Can Do For You Right Now

**Choose what you want**:

1. **Migrate to PostgreSQL** ← Most important
2. **Set up Git-based deployment** ← Recommended
3. **Configure AWS S3 for images** ← Nice to have
4. **Deploy Socket.io server** ← For real-time features
5. **All of the above** ← Full production setup

---

## 🔗 Quick Links

- **Create PostgreSQL**: https://neon.tech (Sign up, create project, copy connection string)
- **AWS Amplify Console**: https://console.aws.amazon.com/amplify
- **Your Project Files**:
  - `amplify.yml` ← I just created this
  - `docs/AWS-AMPLIFY-DEPLOYMENT.md` ← Full guide

---

## 🎬 Next Step: Tell Me What You Want

**Reply with**:

- "Migrate to PostgreSQL" ← I'll update all the code
- "I have PostgreSQL URL" ← I'll configure everything
- "I want Git deployment" ← I'll help set it up
- "Do everything" ← Full production setup

**I'm ready to help! What would you like to do first?**
