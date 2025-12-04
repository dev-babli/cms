# Fix for Login Redirect Issue on Vercel

## Problem
Login is successful but not redirecting to admin page on Vercel.

## Root Cause
The server-side auth check (`getCurrentUser`) wasn't properly reading the Supabase session from cookies, causing the admin page to redirect back to login.

## Solution Applied

### 1. **Improved Login Redirect** (`app/auth/login/page.tsx`)
- Added fallback to `window.location.href` if `router.push` fails
- Added timeout to ensure cookie is set before redirect
- Better error handling

### 2. **Fixed Server Auth** (`lib/auth/server.ts`)
- Now properly reads both `sb-access-token` and `sb-refresh-token` cookies
- Uses `setSession()` to establish Supabase session before getting user
- Falls back to direct token verification if session setting fails

## Testing

After deploying to Vercel:

1. **Login** with `admin@emscale.com` / `admin123`
2. **Check browser console** for any errors
3. **Check Network tab** - verify cookies are being set:
   - `sb-access-token` should be set
   - `sb-refresh-token` should be set
4. **Verify redirect** - should go to `/admin` after login

## If Still Not Working

### Check 1: Cookie Domain
Vercel might need explicit domain settings. Check if cookies are being set with correct domain.

### Check 2: HTTPS
Ensure `secure: true` is set for production (it should be based on `isProduction` flag).

### Check 3: SameSite
Cookies use `sameSite: 'lax'` which should work for same-domain redirects.

### Check 4: Admin Page Auth
If admin page still redirects to login, the issue is in `getCurrentUser()`. Check Vercel logs for errors.

## Debug Steps

1. Open browser DevTools → Application → Cookies
2. After login, verify `sb-access-token` cookie exists
3. Check cookie attributes:
   - `HttpOnly`: true
   - `Secure`: true (in production)
   - `SameSite`: Lax
   - `Path`: /

4. If cookie is missing, check:
   - Vercel environment variables
   - Network tab → Response headers → Set-Cookie

5. Test the `/api/auth/me` endpoint:
   ```bash
   curl -H "Cookie: sb-access-token=YOUR_TOKEN" https://your-app.vercel.app/api/auth/me
   ```

## Alternative: Client-Side Redirect

If server-side redirect still fails, we can add a client-side check on the admin page that redirects if not authenticated, but this is less secure.


