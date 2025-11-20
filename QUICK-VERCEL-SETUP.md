# ⚡ Quick Vercel Setup Guide

## 🚨 The Problem

**Login fails on Vercel because environment variables are missing!**

`.env.local` is **NOT** deployed to Vercel. You must add environment variables in the Vercel dashboard.

---

## ✅ Quick Fix (5 minutes)

### 1. Go to Vercel Dashboard
- https://vercel.com/dashboard
- Click your **CMS project**

### 2. Add Environment Variables
- Click **Settings** → **Environment Variables**

### 3. Add These 3 Variables:

#### Variable 1: `DATABASE_URL` (Private)
**Value:**
```
postgresql://postgres.ozxrtdqbcfinrnrdelql:soumeet%40132006@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```
**Environments:** ✅ Production ✅ Preview ✅ Development
**Note:** No `NEXT_PUBLIC_` prefix = automatically private in Vercel ✅

---

#### Variable 2: `NEXTAUTH_SECRET` (Private)
**Generate a secret:**
- Visit: https://generate-secret.vercel.app/32
- Or run: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

**Value:** `[paste-generated-secret]`
**Environments:** ✅ Production ✅ Preview ✅ Development
**Note:** No `NEXT_PUBLIC_` prefix = automatically private in Vercel ✅

---

#### Variable 3: `NEXTAUTH_URL` (Private)
**Value:** `https://your-cms-app-name.vercel.app`
**Replace:** `your-cms-app-name` with your actual Vercel app name
**Environments:** ✅ Production only
**Note:** No `NEXT_PUBLIC_` prefix = automatically private in Vercel ✅

**Example:**
```
https://intellectt-cms.vercel.app
```

#### Variable 4: `SUPABASE_SERVICE_ROLE_KEY` (Private - Important!)
**Get from:** Supabase Dashboard → Settings → API → service_role key
**Value:** `[paste-service-role-key]`
**Environments:** ✅ Production ✅ Preview ✅ Development
**Note:** No `NEXT_PUBLIC_` prefix = automatically private in Vercel ✅
**⚠️ This is SECRET - never expose!**

---

### 4. Save & Redeploy
1. Click **Save** after adding all variables
2. Go to **Deployments** tab
3. Click **⋯** (three dots) on latest deployment
4. Click **Redeploy**

---

## ✅ That's It!

After redeploy, login should work:
- Email: `admin@emscale.com`
- Password: `admin123`

---

## 🔍 Still Not Working?

1. **Check Runtime Logs:**
   - Vercel Dashboard → Your Deployment → **Runtime Logs**
   - Look for errors

2. **Verify Admin User Exists:**
   - The admin user might not exist in production
   - You may need to create it via Supabase dashboard or run a script

3. **Check Variable Names:**
   - Make sure they're exactly: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
   - Case-sensitive!

---

**Need help? Check `VERCEL-ENV-SETUP.md` for detailed instructions.**

