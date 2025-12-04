# 🔧 IPv4 Issue - Use Session Pooler

## Issue Found

The Supabase dashboard shows:
- ⚠️ **"Not IPv4 compatible"** warning
- Direct connection won't work on IPv4 networks

## ✅ Solution: Use Session Pooler

### Steps:

1. **Click "Pooler settings"** button (in the warning box)
   - This will show you the pooled connection string

2. **Or manually navigate:**
   - Go to **Settings** → **Database**
   - Scroll to **"Connection pooling"** section
   - Select **"Session mode"**

3. **Copy the pooled connection string**
   - It will look like:
     ```
     postgresql://postgres.ozxrtdqbcfinrnrdelql:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```

4. **Update .env.local**
   - Replace `DATABASE_URL` with the pooled connection string
   - Password: `soumeet%40132006` (URL-encoded)

---

## Why This Happens

- Direct connection (`db.ozxrtdqbcfinrnrdelql.supabase.co`) is IPv6 only
- Most networks (including yours) are IPv4
- Session Pooler works on IPv4 networks ✅

---

## After Getting Pooled Connection String

1. Update `.env.local`
2. Test: `node test-connection-direct.js`
3. Should work! ✅

---

**Click "Pooler settings" to get the correct connection string!**


