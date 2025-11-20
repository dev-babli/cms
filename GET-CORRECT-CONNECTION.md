# 🔧 Get Correct Connection String

## Current Issue

The direct connection hostname `db.ozxrtdqbcfinrnrdelql.supabase.co` is not resolving.

**This is normal!** For Node.js applications, Supabase requires the **pooled connection string**.

---

## ✅ Solution: Get Pooled Connection String

### Step-by-Step:

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Select your project: `ozxrtdqbcfinrnrdelql`

2. **Navigate to Settings**
   - Click **Settings** (⚙️ gear icon) in left sidebar
   - Click **Database**

3. **Find Connection Pooling**
   - Scroll down to **"Connection pooling"** section
   - You should see connection strings for different modes

4. **Copy Session Mode Connection String**
   - Click on **"Session mode"** tab
   - Copy the connection string
   - It looks like:
     ```
     postgresql://postgres.ozxrtdqbcfinrnrdelql:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```

5. **Update .env.local**
   - Replace `DATABASE_URL` with the pooled connection string
   - Make sure password is URL-encoded (`@` → `%40`)

---

## 🔍 What to Look For

**Pooled connection string has:**
- ✅ `postgres.ozxrtdqbcfinrnrdelql` (not just `postgres`)
- ✅ `pooler.supabase.com` (not `db.supabase.co`)
- ✅ Port `6543` (not `5432`)

**Example format:**
```
postgresql://postgres.ozxrtdqbcfinrnrdelql:soumeet%40132006@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## 📝 If You Don't See Connection Pooling

**Possible reasons:**
1. Project still provisioning (wait 2-5 minutes)
2. Free tier might have limitations
3. Check project status in dashboard

**Alternative:**
- Check **Settings → Database → Connection string**
- Try **"Transaction mode"** or **"Session mode"** tabs
- These might show the pooled connection

---

## 🧪 After Getting Connection String

1. Update `.env.local`:
   ```env
   DATABASE_URL=postgresql://postgres.ozxrtdqbcfinrnrdelql:soumeet%40132006@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

2. Test connection:
   ```bash
   node test-connection-direct.js
   ```

3. If successful, start the CMS:
   ```bash
   npm run dev
   ```

---

**The pooled connection is REQUIRED for Node.js/serverless applications!**

