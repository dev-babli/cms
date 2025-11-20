# ⚡ Quick Supabase Auth Setup

## ✅ Code is Ready!

Supabase Auth integration is complete. Just need to configure it.

---

## 🔧 3 Steps to Complete Setup

### Step 1: Add Environment Variables

**Get Service Role Key (Recommended for API Routes):**
1. Go to Supabase Dashboard
2. Settings → API
3. Find "service_role" key (secret)
4. Copy it

**Local (.env.local):**
```env
# Supabase URL (can be public)
NEXT_PUBLIC_SUPABASE_URL=https://ozxrtdqbcfinrnrdelql.supabase.co
# Or use without NEXT_PUBLIC_ prefix
SUPABASE_URL=https://ozxrtdqbcfinrnrdelql.supabase.co

# Service Role Key (PRIVATE - server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Anon Key (optional - for client-side if needed)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Vercel:**
- Add `SUPABASE_SERVICE_ROLE_KEY` (PRIVATE - never expose!)
- Add `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- Select: Production, Preview, Development

---

### Step 2: Run Database Migration

**Go to Supabase Dashboard → SQL Editor:**

Run this SQL:
```sql
-- Add supabase_user_id column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS supabase_user_id UUID;

-- Create index
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_user_id);
```

**Or use the file:** `cms/supabase-auth-migration.sql`

---

### Step 3: Enable Supabase Auth

1. **Go to Supabase Dashboard**
2. **Authentication** → **Settings**
3. **Enable:**
   - ✅ Enable email signup
   - ✅ Enable email login
   - ✅ Email confirmation (optional)

---

## ✅ That's It!

After these 3 steps:
- ✅ New registrations use Supabase Auth
- ✅ Login uses Supabase Auth
- ✅ Admin approval still works
- ✅ Password reset via Supabase
- ✅ Better security!

---

## 🧪 Test It

1. **Register new user** → Should create in Supabase Auth
2. **Check Supabase Dashboard** → Auth → Users
3. **Admin approves** → User can login
4. **Test login** → Should work!

---

## 📝 Existing Users

**Option 1:** Use "Forgot Password"
- Creates Supabase Auth account
- Links automatically

**Option 2:** Run migration script
```bash
node scripts/migrate-users-to-supabase-auth.js
```

---

**Just 3 steps and you're done!** 🚀

