# 🔍 Find Connection String - Quick Guide

## You're on Configuration Page

The page you're on shows **pooling settings** (Pool Size, Max Connections), but **not the connection string itself**.

## ✅ How to Get the Connection String:

### Method 1: Click "Connect" Button (Easiest)
1. Look at the **top right** of the page
2. Click the **"Connect"** button (next to "Production")
3. A dialog/modal will open
4. Look for tabs: **"Connection string"**, **"Connection pooling"**, etc.
5. Select **"Session mode"** or **"Connection pooling"** tab
6. Copy the connection string shown there

### Method 2: Check Project Settings
1. Go back to main project page
2. Look for **"Connection info"** or **"Database"** section
3. There should be connection strings listed there

### Method 3: Construct It Manually
If you can't find it, we can construct it. We need:
- Your region (e.g., `us-east-1`, `eu-west-1`)
- Password: `soumeet@132006` (we already have this)

**Format:**
```
postgresql://postgres.ozxrtdqbcfinrnrdelql:soumeet%40132006@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

---

## 🎯 Try This First:

**Click the "Connect" button** (top right corner) - that's the easiest way!

The connection string dialog should show you all the connection options including the pooled one.

---

**Once you have it, paste it here and I'll update the config!**


