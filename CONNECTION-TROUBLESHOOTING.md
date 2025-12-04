# 🔧 Connection Troubleshooting

## Issue: `ENOTFOUND db.ozxrtdqbcfinrnrdelql.supabase.co`

This means the hostname cannot be resolved. Possible causes:

### 1. Project Not Fully Provisioned
- Supabase projects can take 2-5 minutes to fully provision
- Check project status in dashboard
- Wait a few minutes and try again

### 2. Wrong Hostname Format
- The direct connection might not be available
- You might need the **pooled connection** instead

### 3. Verify Project Reference
- Make sure `ozxrtdqbcfinrnrdelql` is correct
- Check in Supabase Dashboard → Settings → General → Reference

---

## ✅ Solution: Get Pooled Connection String

**This is REQUIRED for Node.js applications!**

1. Go to **Supabase Dashboard**
2. **Settings** → **Database**
3. Scroll to **"Connection pooling"** section
4. Copy **"Session mode"** connection string

**It should look like:**
```
postgresql://postgres.ozxrtdqbcfinrnrdelql:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Key differences:**
- `postgres.ozxrtdqbcfinrnrdelql` (not `postgres`)
- `pooler.supabase.com` (not `db.supabase.co`)
- Port `6543` (not `5432`)

---

## 🔍 Alternative: Check Direct Connection

If you want to use direct connection:

1. Go to **Settings** → **Database**
2. Under **"Connection string"**
3. Try **"Transaction mode"** or **"Session mode"**
4. Make sure it shows `db.ozxrtdqbcfinrnrdelql.supabase.co`

---

## 📝 Update .env.local

Once you have the **pooled connection string**, update `.env.local`:

```env
DATABASE_URL=postgresql://postgres.ozxrtdqbcfinrnrdelql:soumeet%40132006@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Replace:**
- `[REGION]` with your region (e.g., `us-east-1`)
- Keep password URL-encoded: `soumeet%40132006`

---

## 🧪 Test Again

After updating, run:
```bash
node test-connection.js
```

---

**The pooled connection is REQUIRED for serverless/Node.js apps!**


