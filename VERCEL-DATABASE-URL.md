# Vercel DATABASE_URL - Exact Value

## Your Connection String

Copy this EXACT value to Vercel:

```
postgresql://postgres.ozxrtdqbcfinrnrdelql:soumeet2006@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

## Steps to Fix

1. Go to: https://vercel.com/dashboard
2. Select your **CMS project**
3. **Settings** → **Environment Variables**
4. Find `DATABASE_URL`
5. **Edit** → Delete old value
6. **Paste** the connection string above
7. **Save**
8. **Redeploy** (Deployments → Redeploy)

## Verify

After redeploy, try creating a blog post. It should work now.


