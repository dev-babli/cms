# 🔧 Run This Migration to Fix Registration Error

## ❌ Error
```
null value in column "password_hash" of relation "users" violates not-null constraint
```

## ✅ Solution

Run this SQL in your Supabase Dashboard → SQL Editor:

```sql
-- Make password_hash nullable since we're using Supabase Auth
ALTER TABLE users 
ALTER COLUMN password_hash DROP NOT NULL;
```

## 📝 Steps

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar

3. **Run the SQL:**
   ```sql
   ALTER TABLE users 
   ALTER COLUMN password_hash DROP NOT NULL;
   ```

4. **Verify:**
   - The migration should complete successfully
   - No errors should appear

5. **Try Registration Again**
   - Go to your CMS registration page
   - Try registering a new user
   - Should work now! ✅

## 🔍 Why This Fix Works

- We're using **Supabase Auth** for authentication
- Passwords are stored in Supabase's `auth.users` table, not our custom `users` table
- Our `users` table only needs to link to Supabase Auth via `supabase_user_id`
- Making `password_hash` nullable allows users created via Supabase Auth to exist without a password in our table

## ✅ After Migration

The registration flow will:
1. Create user in Supabase Auth (password stored there)
2. Create user in our custom `users` table with `supabase_user_id` link
3. Set `password_hash` to NULL (since Supabase handles auth)
4. Set status to 'pending' (admin approval required)

---

**Run the SQL above and try registration again!** 🚀


