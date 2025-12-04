# 🔧 Create Admin User for Production

## For Vercel Deployment

After deploying to Vercel, you need to ensure the admin user exists in your **production database** (Supabase).

---

## ✅ Option 1: Run Script Locally (Easiest)

The script uses your `.env.local` connection string, which connects to the **same Supabase database** (production).

### Steps:

1. **Make sure `.env.local` has correct `DATABASE_URL`:**
   ```env
   DATABASE_URL=postgresql://postgres.ozxrtdqbcfinrnrdelql:soumeet%40132006@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
   ```

2. **Run the script:**
   ```bash
   cd cms
   node scripts/create-admin.js
   ```

3. **Verify output:**
   ```
   ✅ Admin user already exists!
   ✅ Password is correct!
   ```
   OR
   ```
   ✅ Admin user created successfully!
   ```

---

## ✅ Option 2: Create via Supabase Dashboard

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click **SQL Editor** in left sidebar
   - Click **New query**

3. **Run this SQL:**
   ```sql
   -- Check if admin exists
   SELECT * FROM users WHERE email = 'admin@emscale.com';
   
   -- If no results, create admin user
   -- First, generate password hash (use bcrypt with cost 12)
   -- You can use: https://bcrypt-generator.com/
   -- Or run: node -e "const bcrypt=require('bcryptjs');bcrypt.hash('admin123',12).then(h=>console.log(h))"
   
   -- Insert admin user (replace HASH with generated hash)
   INSERT INTO users (email, password_hash, name, role, status, email_verified)
   VALUES (
     'admin@emscale.com',
     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5', -- Replace with actual hash
     'System Administrator',
     'admin',
     'active',
     true
   )
   ON CONFLICT (email) DO NOTHING;
   ```

4. **Or update existing user password:**
   ```sql
   -- Update password (replace HASH with generated hash)
   UPDATE users 
   SET password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5'
   WHERE email = 'admin@emscale.com';
   ```

---

## ✅ Option 3: Use Vercel Function (Advanced)

Create a one-time API route to initialize admin:

1. **Create:** `cms/app/api/admin/init/route.ts`
2. **Add initialization code**
3. **Call once:** `https://your-app.vercel.app/api/admin/init`
4. **Delete the route** after use (security)

---

## 🔍 Verify Admin User

After creating, verify in Supabase:

```sql
SELECT id, email, name, role, status, email_verified 
FROM users 
WHERE email = 'admin@emscale.com';
```

**Expected result:**
- `email`: `admin@emscale.com`
- `role`: `admin`
- `status`: `active`
- `email_verified`: `true`

---

## 🎯 Quick Command

**Just run this:**
```bash
cd cms
node scripts/create-admin.js
```

**That's it!** The script will:
- ✅ Check if admin exists
- ✅ Create if missing
- ✅ Fix password if incorrect
- ✅ Verify everything works

---

**After running, try logging in to Vercel deployment!** ✅


