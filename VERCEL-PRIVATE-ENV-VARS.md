# 🔒 How to Mark Environment Variables as Private in Vercel

## 📋 Step-by-Step Guide

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select your **CMS project**

### Step 2: Navigate to Settings
1. Click **Settings** tab (top navigation)
2. Click **Environment Variables** in left sidebar

### Step 3: Add Environment Variable
1. Click **"Add New"** button
2. Enter variable name: `SUPABASE_SERVICE_ROLE_KEY`
3. Enter value: `your-service-role-key-here`
4. **Select environments:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development
   - (Or select specific ones)

### Step 4: Save
1. Click **"Save"** button
2. Variable is automatically **private** (not exposed to client)

---

## 🔒 How Vercel Handles Privacy

### Automatic Privacy:
- ✅ **Server-side variables** (without `NEXT_PUBLIC_`) are **automatically private**
- ✅ **Never exposed** to browser/client code
- ✅ **Only available** in API routes and server components

### Public Variables:
- ⚠️ Variables with `NEXT_PUBLIC_` prefix are **exposed to client**
- ⚠️ Can be accessed in browser JavaScript
- ⚠️ Use only for values safe to be public

---

## 🎯 Best Practice

### Private (Server-Side Only):
```env
SUPABASE_SERVICE_ROLE_KEY=secret-key-here
DATABASE_URL=connection-string-here
NEXTAUTH_SECRET=secret-here
```
- ✅ No `NEXT_PUBLIC_` prefix
- ✅ Automatically private in Vercel
- ✅ Only available server-side

### Public (Client-Side):
```env
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key-here
```
- ⚠️ Has `NEXT_PUBLIC_` prefix
- ⚠️ Exposed to browser
- ⚠️ Only use for safe values

---

## 📝 For Your CMS

### Add These (Private):
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_URL=https://ozxrtdqbcfinrnrdelql.supabase.co
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-app.vercel.app
```

### Optional (Public - if needed):
```
NEXT_PUBLIC_SUPABASE_URL=https://ozxrtdqbcfinrnrdelql.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key-here
```

---

## ✅ Summary

**In Vercel:**
- Variables **without** `NEXT_PUBLIC_` = **Automatically private** ✅
- Variables **with** `NEXT_PUBLIC_` = **Public** (exposed to client)

**For Service Role Key:**
- Use: `SUPABASE_SERVICE_ROLE_KEY` (no prefix)
- Vercel automatically keeps it private
- Never exposed to browser

---

**No special "mark as private" button needed!** Just don't use `NEXT_PUBLIC_` prefix. ✅

