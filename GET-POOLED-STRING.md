image.png# 🔗 Get Pooled Connection String

## You're on the Right Page!

You're on **Database Settings** page. Now you need to get the connection string.

## Steps to Get Pooled Connection String:

### Option 1: From Connection String Dialog
1. Click the **"Connect"** button (top right, next to "Production")
2. This opens the connection dialog
3. Click **"Connection pooling"** tab (or look for pooler settings)
4. Select **"Session mode"**
5. Copy the connection string

### Option 2: From Settings Page
1. On the current page, look for a section about **"Connection string"** or **"Connection info"**
2. There might be a link/button to view connection strings
3. Look for tabs: "Direct connection", "Session mode", "Transaction mode"
4. Select **"Session mode"**

### Option 3: Check Connection Info
1. Look for any section showing connection details
2. The pooled connection string format is:
   ```
   postgresql://postgres.ozxrtdqbcfinrnrdelql:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

---

## What to Look For

The pooled connection string will have:
- ✅ `postgres.ozxrtdqbcfinrnrdelql` (not just `postgres`)
- ✅ `pooler.supabase.com` (not `db.supabase.co`)
- ✅ Port `6543` (not `5432`)

---

## Quick Check

**Try clicking:**
- The **"Connect"** button (top right)
- Any **"Connection string"** link/button
- Look for tabs showing different connection modes

**Once you find it, copy the "Session mode" connection string!**


