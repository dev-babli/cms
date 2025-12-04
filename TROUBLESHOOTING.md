# 🔧 Troubleshooting Registration "Network Error"

## ✅ What We Fixed

1. **Better Error Messages**: Registration page now shows specific error messages instead of generic "Network error"
2. **Improved API Error Handling**: Registration API route now provides detailed error messages
3. **Supabase Client Validation**: Added checks to ensure Supabase is properly configured before use

## 🧪 Test Your Setup

Run this to verify everything is configured:

```bash
cd cms
node scripts/test-supabase-connection.js
```

## 🔍 Common Issues & Solutions

### Issue 1: "Network error. Please try again."

**Possible Causes:**
- Missing environment variables
- Supabase Auth not enabled
- Invalid API keys
- Database connection issue

**Solution:**
1. Check environment variables:
   ```bash
   node scripts/check-env.js
   ```

2. Verify Supabase Auth is enabled:
   - Go to Supabase Dashboard → Authentication → Settings
   - Enable "Enable email signup"
   - Enable "Enable email login"

3. Check browser console for specific errors

### Issue 2: "Server configuration error"

**Cause:** Missing or invalid `SUPABASE_SERVICE_ROLE_KEY`

**Solution:**
1. Get Service Role Key from Supabase Dashboard → Settings → API
2. Add to `cms/.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-key-here
   ```
3. Restart dev server

### Issue 3: "User with this email already exists"

**Cause:** User already registered in Supabase Auth or your database

**Solution:**
- Use a different email, or
- Delete the user from Supabase Dashboard → Authentication → Users

### Issue 4: "Email signups are disabled"

**Cause:** Supabase Auth email signup is disabled

**Solution:**
1. Go to Supabase Dashboard → Authentication → Settings
2. Under "Auth Providers", enable "Email"
3. Save changes

## 📝 Next Steps

After fixing the issue:

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Try registration again**

3. **Check server logs** for detailed error messages

4. **Check browser console** for client-side errors

## 🆘 Still Having Issues?

1. Check server terminal for error logs
2. Check browser console (F12) for errors
3. Verify all environment variables are set
4. Verify Supabase Auth is enabled
5. Test Supabase connection: `node scripts/test-supabase-connection.js`


