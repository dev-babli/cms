# 🔧 Get Pooled Connection String

## Why Connection Failed

The direct connection string works for Supabase SQL Editor, but for **Node.js applications**, you need the **pooled connection string**.

## Steps to Get It

1. **Go to Supabase Dashboard**
2. **Click Settings** (gear icon)
3. **Click Database**
4. **Scroll down** to **"Connection pooling"** section
5. **Copy the "Session mode"** connection string

It should look like:
```
postgresql://postgres.ozxrtdqbcfinrnrdelql:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Notice:**
- Uses `postgres.ozxrtdqbcfinrnrdelql` (not just `postgres`)
- Uses `pooler.supabase.com` (not `db.supabase.co`)
- Port `6543` (not `5432`)

## Update .env.local

Replace your current `DATABASE_URL` with the pooled connection string.

**Format:**
```env
DATABASE_URL=postgresql://postgres.ozxrtdqbcfinrnrdelql:soumeet%40132006@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Replace:**
- `[REGION]` with your actual region (e.g., `us-east-1`, `eu-west-1`)
- Keep the password URL-encoded (`soumeet%40132006`)

---

## Alternative: If You Don't See Connection Pooling

If connection pooling isn't available, try:

1. **Check project status** - Make sure it's fully provisioned
2. **Use direct connection** but with correct hostname
3. **Check Settings → Database → Connection string** - Try "Transaction mode"

---

**Once you have the pooled connection string, update `.env.local` and we'll test again!**


