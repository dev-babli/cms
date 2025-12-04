# 🔧 Vercel Environment Variables Setup

## ❌ `.env.local` is NOT Deployed

**Important:** `.env.local` files are **NOT** deployed to Vercel. They're only for local development.

## ✅ Add Environment Variables in Vercel Dashboard

### Step-by-Step:

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select your CMS project

2. **Navigate to Settings**
   - Click **Settings** tab
   - Click **Environment Variables** in left sidebar

3. **Add These Variables:**

   #### Required Variables:

   **1. DATABASE_URL**
   ```
   postgresql://postgres.ozxrtdqbcfinrnrdelql:soumeet%40132006@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
   ```
   - **Environment:** Production, Preview, Development (select all)
   - **Note:** Password is URL-encoded (`@` → `%40`)

   **2. NEXTAUTH_SECRET**
   ```
   your-secret-key-here-change-this-to-random-string
   ```
   - **Environment:** Production, Preview, Development (select all)
   - **Generate:** Use `openssl rand -base64 32` or any random string generator

   **3. NEXTAUTH_URL**
   ```
   https://your-cms-app.vercel.app
   ```
   - **Environment:** Production only
   - **Replace:** `your-cms-app` with your actual Vercel app name
   - **Example:** `https://intellectt-cms.vercel.app`

4. **Save and Redeploy**
   - After adding variables, click **Save**
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment (or push a new commit)

---

## 🔑 Generate NEXTAUTH_SECRET

You can generate a secure secret using:

**Option 1: Online**
- Visit: https://generate-secret.vercel.app/32
- Copy the generated string

**Option 2: Command Line**
```bash
openssl rand -base64 32
```

**Option 3: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📝 Complete Environment Variables List

| Variable | Value | Environments |
|----------|-------|--------------|
| `DATABASE_URL` | `postgresql://postgres.ozxrtdqbcfinrnrdelql:soumeet%40132006@aws-1-ap-south-1.pooler.supabase.com:5432/postgres` | All |
| `NEXTAUTH_SECRET` | `[generated-secret]` | All |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production |

---

## ✅ After Adding Variables

1. **Redeploy** your application
2. **Wait** for deployment to complete
3. **Test login** again

---

## 🔍 Verify Variables Are Set

After deployment, you can verify variables are loaded by checking:
- Vercel Dashboard → Your Deployment → **Runtime Logs**
- Look for: `✅ Connected to PostgreSQL database`

---

## ⚠️ Common Issues

### Issue: "Login failed" after deployment
**Solution:** 
- Make sure `DATABASE_URL` is set correctly
- Make sure `NEXTAUTH_SECRET` is set
- Make sure `NEXTAUTH_URL` matches your Vercel app URL
- Redeploy after adding variables

### Issue: "Database connection failed"
**Solution:**
- Verify `DATABASE_URL` is correct
- Check password is URL-encoded (`@` → `%40`)
- Verify Supabase project is active

### Issue: "Invalid credentials"
**Solution:**
- Admin user might not exist in production database
- Run the create-admin script on production (or create user via Supabase dashboard)

---

**Once you add these variables and redeploy, login should work!** ✅


