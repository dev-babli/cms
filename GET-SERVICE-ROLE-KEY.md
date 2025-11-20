# 🔐 How to Get Supabase Service Role Key

## ⚠️ Important: Service Role Key is SECRET!

The **Service Role Key** should **NEVER** be public. It's for server-side use only.

---

## 📋 Steps to Get Service Role Key

### 1. Go to Supabase Dashboard
- https://supabase.com/dashboard
- Select your project: `ozxrtdqbcfinrnrdelql`

### 2. Navigate to API Settings
- Click **Settings** (⚙️ gear icon)
- Click **API** in left sidebar

### 3. Find Service Role Key
- Scroll to **"Project API keys"** section
- Look for **"service_role"** key
- **⚠️ This is SECRET - only shown once!**
- Click **"Reveal"** or **"Copy"**

### 4. Copy the Key
- It looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT)
- **Different from anon key!**

---

## 🔒 Security Notes

### Service Role Key:
- ✅ **Bypasses Row Level Security (RLS)**
- ✅ **Full database access**
- ✅ **Use only in server-side code**
- ❌ **NEVER expose in client code**
- ❌ **NEVER commit to Git**
- ❌ **NEVER use in browser**

### Anon Key:
- ✅ **Safe to be public**
- ✅ **Protected by RLS**
- ✅ **Can use in client code**
- ✅ **Designed for browser use**

---

## 📝 Where to Use Each Key

| Location | Use This Key |
|----------|-------------|
| **API Routes** (server) | Service Role Key ✅ |
| **Server Components** | Service Role Key ✅ |
| **Client Components** | Anon Key ✅ |
| **Browser JavaScript** | Anon Key ✅ |

---

## 🎯 For Your CMS

**Use Service Role Key in:**
- `app/api/auth/*` routes
- `lib/supabase.ts` (server client)
- Any server-side Supabase operations

**Why?**
- More secure for server-side
- Full control for admin operations
- Better for user management

---

## ✅ After Getting the Key

1. **Add to `.env.local`:**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

2. **Add to Vercel:**
   - Environment Variables
   - Mark as **PRIVATE**
   - Never expose!

3. **Test:**
   - Registration should work
   - Login should work
   - More secure! ✅

---

**Get your Service Role Key and add it to environment variables!** 🔐

