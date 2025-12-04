# 🚀 Supabase Setup - Next Steps

## ✅ Step 1: Get Database Connection String

You have the **API keys**, but for the CMS backend, we need the **PostgreSQL connection string**.

### How to Get It:

1. In Supabase Dashboard, go to **Settings** → **Database**
2. Scroll down to **"Connection string"** section
3. Select **"URI"** tab (not "Session mode" or "Transaction mode")
4. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.ozxrtdqbcfinrnrdelql.supabase.co:5432/postgres
   ```
5. **Replace `[YOUR-PASSWORD]`** with your actual database password
   - If you forgot it, you can reset it in Settings → Database → Database password

### Example:
```
postgresql://postgres:your-actual-password@db.ozxrtdqbcfinrnrdelql.supabase.co:5432/postgres
```

---

## 📝 Step 2: Save Connection String

### For Local Development:
Create/update `.env.local` in the `cms` folder:
```env
DATABASE_URL=postgresql://postgres:your-password@db.ozxrtdqbcfinrnrdelql.supabase.co:5432/postgres
```

### For Vercel (Testing):
1. Go to Vercel Dashboard → Your CMS Project
2. Settings → Environment Variables
3. Add:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://postgres:your-password@db.ozxrtdqbcfinrnrdelql.supabase.co:5432/postgres`

### For cPanel (Production):
1. In cPanel, find "Environment Variables" or add to `.env` file
2. Add the same `DATABASE_URL`

---

## 🔒 Security Note

**⚠️ Never commit the connection string to Git!**

- The connection string contains your password
- Add `.env.local` to `.gitignore`
- Only add `DATABASE_URL` to Vercel/cPanel environment variables (not in code)

---

## 📋 Next Steps After Getting Connection String

1. ✅ Get database connection string (above)
2. ⏳ Run migration script (I'll create this)
3. ⏳ Update code to use PostgreSQL (I'll do this)
4. ⏳ Test locally
5. ⏳ Deploy to Vercel

---

**Once you have the connection string, let me know and I'll proceed with the migration!** 🚀


