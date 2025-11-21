# Database Timeout Fix

## Issue
"Failed to create post: timeout exceeded when trying to connect"

## Root Cause
The database connection timeout was set to 10 seconds, which may not be enough for Supabase connections, especially on Vercel or with network latency.

## Fixes Applied

### 1. Increased Connection Timeout
- Changed from `10000ms` (10 seconds) to `30000ms` (30 seconds)
- Added `statement_timeout` and `query_timeout` settings

### 2. Improved Retry Logic
- Increased retries from 2 to 3 attempts
- Added exponential backoff (1s, 2s, 4s delays)
- Better error detection for timeout errors

### 3. Better Error Messages
- More descriptive timeout error messages
- Connection string masking for security

## Connection String Check

Make sure your `DATABASE_URL` is correct:

1. **For Supabase Pooler** (Recommended for serverless/Vercel):
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
   Port: `6543` (pooler) or `5432` (direct)

2. **For Direct Connection**:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
   ```

## Quick Checks

1. **Verify DATABASE_URL is set**:
   ```bash
   # In Vercel: Check Environment Variables
   # Locally: Check .env.local
   ```

2. **Test Connection**:
   ```bash
   cd cms
   node scripts/test-db-connection.js
   ```

3. **Check Supabase Dashboard**:
   - Go to Settings > Database
   - Verify connection string matches
   - Check if pooler is enabled (recommended)

## Common Issues

### Issue: Still timing out
**Solution**: 
- Use Supabase **Connection Pooler** (port 6543)
- Check network/firewall settings
- Verify DATABASE_URL is correct

### Issue: "Connection refused"
**Solution**:
- Verify Supabase project is active
- Check if IP is whitelisted (if using direct connection)
- Use pooler connection (doesn't require IP whitelist)

### Issue: "Authentication failed"
**Solution**:
- Verify password is correct
- Check if password needs URL encoding
- Regenerate database password in Supabase Dashboard

## Vercel-Specific

On Vercel, use the **pooler connection** (port 6543) for better performance:
- Handles connection pooling automatically
- Better for serverless functions
- No IP whitelisting needed

## Testing

After applying fixes:
1. Try creating a blog post again
2. Check Vercel function logs for connection details
3. Monitor connection time in logs

If issues persist, check:
- Supabase Dashboard > Database > Connection Pooling
- Vercel Function Logs for detailed errors
- Network connectivity

