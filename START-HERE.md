# 🚀 START HERE - Supabase Auth Setup

## ✅ What's Done

- ✅ Supabase Auth code integrated
- ✅ Registration uses Supabase Auth
- ✅ Login uses Supabase Auth
- ✅ Admin approval still works
- ✅ Service Role Key support added

---

## 🎯 Next Steps (Do These Now!)

### 1️⃣ Get Service Role Key (2 minutes)

**Go to:** Supabase Dashboard → Settings → API
**Find:** "service_role" key
**Copy it** (secret - only shown once!)

---

### 2️⃣ Add to `.env.local` (1 minute)

```env
SUPABASE_URL=https://ozxrtdqbcfinrnrdelql.supabase.co
SUPABASE_SERVICE_ROLE_KEY=paste-your-key-here
DATABASE_URL=postgresql://postgres.ozxrtdqbcfinrnrdelql:soumeet%40132006@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
NEXTAUTH_SECRET=generate-with-node-command
NEXTAUTH_URL=http://localhost:3001
```

---

### 3️⃣ Run Database Migration (1 minute)

**Go to:** Supabase Dashboard → SQL Editor
**Run:**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_user_id UUID;
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_user_id);
```

---

### 4️⃣ Enable Supabase Auth (1 minute)

**Go to:** Supabase Dashboard → Authentication → Settings
**Enable:**
- ✅ Email signup
- ✅ Email login

---

### 5️⃣ Test (2 minutes)

```bash
cd cms
npm run dev
```

**Test:**
- Register new user
- Check Supabase Auth dashboard
- Admin approves
- User logs in

---

## ⏱️ Total Time: ~7 minutes

**Then you're done!** 🎉

---

**Start with Step 1: Get Service Role Key!**
