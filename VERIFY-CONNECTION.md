# 🔍 Verify Supabase Connection

## Issue: Connection Failed

The connection test failed with `ENOTFOUND`. This usually means:

1. **Wrong hostname** - The database host might be different
2. **Need connection pooling** - Supabase might require pooled connection
3. **Network/DNS issue** - Temporary connectivity problem

## ✅ Solution: Get Correct Connection String

### Option 1: Use Connection Pooling (Recommended for Serverless)

1. Go to **Supabase Dashboard** → **Settings** → **Database**
2. Scroll to **"Connection pooling"** section
3. Copy the **"Session mode"** connection string
4. It looks like:
   ```
   postgresql://postgres.ozxrtdqbcfinrnrdelql:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

### Option 2: Check Direct Connection

1. Go to **Settings** → **Database**
2. Under **"Connection string"**, try:
   - **"Transaction mode"** (for pooled)
   - **"Session mode"** (for pooled)
   - **"URI"** (direct connection)

### Option 3: Verify Project Status

1. Make sure your Supabase project is **active**
2. Check if it's still provisioning (might take a few minutes)
3. Verify the project reference: `ozxrtdqbcfinrnrdelql`

---

## 🔧 Quick Fix

**Try using the pooled connection string instead:**

1. Go to Supabase Dashboard
2. Settings → Database → Connection pooling
3. Copy the **Session mode** connection string
4. Update `.env.local` with that string

**Or share:**
- What you see in Settings → Database → Connection pooling
- The exact connection string format shown there

---

## 📝 Current Connection String Format

You're using:
```
postgresql://postgres:soumeet%40132006@db.ozxrtdqbcfinrnrdelql.supabase.co:5432/postgres
```

**Try the pooled version instead** (if available):
```
postgresql://postgres.ozxrtdqbcfinrnrdelql:soumeet%40132006@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

---

**Once you have the correct connection string, update `.env.local` and test again!**

