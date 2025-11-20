# 🔍 How to Find Supabase Database Connection String

## Method 1: Settings → Database (Recommended)

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `ozxrtdqbcfinrnrdelql`
3. **Click "Settings"** (gear icon in left sidebar)
4. **Click "Database"** (under Project Settings)
5. **Scroll down** to find **"Connection string"** section
6. **Click on "URI"** tab (not "Session mode" or "Transaction mode")
7. **Copy the connection string**

It should look like:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**OR** (direct connection):
```
postgresql://postgres:[PASSWORD]@db.ozxrtdqbcfinrnrdelql.supabase.co:5432/postgres
```

---

## Method 2: Construct It Manually

If you can't find it, you can construct it:

### Step 1: Get Your Database Password

1. Go to **Settings** → **Database**
2. Look for **"Database password"** section
3. If you don't know it:
   - Click **"Reset database password"**
   - Set a new password (save it securely!)
   - Wait 1-2 minutes for it to update

### Step 2: Construct Connection String

Use this format:
```
postgresql://postgres:[YOUR-PASSWORD]@db.ozxrtdqbcfinrnrdelql.supabase.co:5432/postgres
```

**Replace:**
- `[YOUR-PASSWORD]` with your actual database password
- Keep everything else the same

**Example:**
```
postgresql://postgres:MySecurePassword123@db.ozxrtdqbcfinrnrdelql.supabase.co:5432/postgres
```

---

## Method 3: Use Connection Pooling (Recommended for Serverless)

Supabase provides a **pooled connection** which is better for Vercel:

1. Go to **Settings** → **Database**
2. Scroll to **"Connection pooling"**
3. Use the **"Session mode"** connection string
4. It looks like:
```
postgresql://postgres.ozxrtdqbcfinrnrdelql:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Benefits:**
- ✅ Better for serverless (Vercel)
- ✅ Connection pooling built-in
- ✅ Handles many concurrent connections

---

## Method 4: Check Project Settings

1. Go to **Settings** → **API**
2. Look for **"Database"** section
3. Sometimes connection info is shown here

---

## Method 5: Use Supabase CLI (Advanced)

If you have Supabase CLI installed:
```bash
supabase status
```

This shows connection strings.

---

## 🔑 What You Need

You need **TWO** things:

1. **Database Password**
   - Found in: Settings → Database → Database password
   - If unknown: Reset it

2. **Connection String Format**
   - Direct: `postgresql://postgres:[PASSWORD]@db.ozxrtdqbcfinrnrdelql.supabase.co:5432/postgres`
   - Pooled: `postgresql://postgres.ozxrtdqbcfinrnrdelql:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

---

## 📸 Where to Look (Visual Guide)

```
Supabase Dashboard
├── Your Project (ozxrtdqbcfinrnrdelql)
│   ├── Settings (⚙️ icon)
│   │   ├── API
│   │   ├── Database ← LOOK HERE
│   │   │   ├── Connection string ← HERE
│   │   │   │   ├── URI tab ← CLICK THIS
│   │   │   ├── Database password ← GET THIS
│   │   │   ├── Connection pooling ← OR USE THIS
```

---

## ⚠️ Common Issues

### "I don't see Connection string section"
- Make sure you're in **Settings** → **Database** (not API)
- Scroll down - it's below the database info
- Try refreshing the page

### "I don't know my password"
- Click **"Reset database password"**
- Set a new one
- Save it securely!

### "Connection string is grayed out"
- You might need to click on it to reveal it
- Or copy the visible parts and construct manually

---

## ✅ Quick Checklist

- [ ] Go to Settings → Database
- [ ] Find "Database password" (reset if needed)
- [ ] Find "Connection string" section
- [ ] Click "URI" tab
- [ ] Copy the connection string
- [ ] Replace `[PASSWORD]` with actual password

---

## 🆘 Still Can't Find It?

**Alternative**: Just get your password and I'll help you construct it!

1. Go to **Settings** → **Database**
2. Find **"Database password"**
3. If unknown, click **"Reset database password"**
4. Share the password with me (or construct it yourself using the format above)

**Or** take a screenshot of the Settings → Database page and I can help locate it!

---

**Once you have it, we can proceed with the migration!** 🚀

