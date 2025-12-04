# 🔑 Simple Way to Get Connection String

## Option 1: Just Get Your Password (Easiest)

1. Go to **Supabase Dashboard** → Your Project
2. Click **Settings** (⚙️ icon on left)
3. Click **Database**
4. Look for **"Database password"** section
5. If you don't see it or don't know it:
   - Click **"Reset database password"** button
   - Set a new password (write it down!)
   - Wait 1-2 minutes

**Once you have the password, use this format:**

```
postgresql://postgres:YOUR_PASSWORD_HERE@db.ozxrtdqbcfinrnrdelql.supabase.co:5432/postgres
```

**Example:**
If your password is `MyPass123`, then:
```
postgresql://postgres:MyPass123@db.ozxrtdqbcfinrnrdelql.supabase.co:5432/postgres
```

---

## Option 2: Use Connection Pooling (Better for Vercel)

1. Go to **Settings** → **Database**
2. Scroll to **"Connection pooling"** section
3. Look for **"Connection string"** under pooling
4. It should show something like:
   ```
   postgresql://postgres.ozxrtdqbcfinrnrdelql:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

**This is better for Vercel because it has connection pooling built-in!**

---

## Option 3: I Can Help You Find It

**Tell me:**
1. Can you see **Settings** → **Database** page?
2. What sections do you see on that page?
3. Do you see "Database password" anywhere?

**Or share a screenshot** of the Settings → Database page and I'll point you to it!

---

## Quick Test

Once you have the connection string, we can test it:

1. Add it to `.env.local`:
   ```env
   DATABASE_URL=postgresql://postgres:your-password@db.ozxrtdqbcfinrnrdelql.supabase.co:5432/postgres
   ```

2. I'll help you test the connection

---

## 🎯 What We Need

**Minimum requirement:**
- Your database password (from Settings → Database → Database password)

**With that, I can construct the connection string for you!**

---

**Just get the password and we're good to go!** 🚀


