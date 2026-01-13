# RLS Security Warnings Fix Guide

## Overview

After running the initial RLS migration, you may see additional security warnings. This guide fixes those warnings.

## Warnings Addressed

### 1. Function Search Path Mutable (WARN)
- **Issue**: `update_updated_at_column()` function doesn't have a fixed search_path
- **Risk**: Potential search_path injection attacks
- **Fix**: Recreate function with `SET search_path = ''`

### 2. RLS Policy Always True (WARN) - 3 instances
- **Issue**: INSERT policies use `WITH CHECK (true)` which is too permissive
- **Affected Tables**: `leads`, `lead_downloads`, `analytics_events`
- **Fix**: Add basic validation to INSERT policies (require non-null required fields)

### 3. Leaked Password Protection (WARN)
- **Issue**: Supabase Auth setting (not a database issue)
- **Fix**: Enable in Supabase Dashboard (see below)

## How to Run the Fix

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Fix
1. Click **New Query**
2. Copy the contents of `cms/fix-rls-warnings.sql`
3. Paste into SQL Editor
4. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

### Step 3: Verify Success
You should see:
- ✅ "RLS warnings fixed successfully!"
- ✅ "Function search_path secured."
- ✅ "INSERT policies made more restrictive with validation."

## What This Does

### Function Security
- Recreates `update_updated_at_column()` with fixed search_path
- Prevents search_path injection attacks
- Uses `SECURITY DEFINER` for proper execution context

### INSERT Policy Improvements

#### Leads Table
- **Before**: `WITH CHECK (true)` - allows any insert
- **After**: Requires `first_name` and `email` to be non-null and non-empty
- **Impact**: Still allows public lead capture, but validates required fields

#### Lead Downloads Table
- **Before**: `WITH CHECK (true)` - allows any insert
- **After**: Requires `lead_id`, `content_type`, and `content_id` to be non-null
- **Impact**: Still allows download tracking, but validates required fields

#### Analytics Events Table
- **Before**: `WITH CHECK (true)` - allows any insert
- **After**: Requires `event_type` to be non-null and non-empty
- **Impact**: Still allows analytics tracking, but validates event type

## Enable Leaked Password Protection

This is a Supabase Auth setting, not a database migration:

1. Go to **Supabase Dashboard** → **Authentication** → **Policies**
2. Scroll to **Password Security** section
3. Enable **"Leaked Password Protection"**
4. This checks passwords against HaveIBeenPwned.org database

## Verification

### Check Function Search Path
```sql
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'update_updated_at_column';
```

The definition should include `SET search_path = ''`.

### Check INSERT Policies
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('leads', 'lead_downloads', 'analytics_events')
AND cmd = 'INSERT'
ORDER BY tablename, policyname;
```

You should see policies with validation expressions instead of `true`.

## Testing

### Test Lead Insert (Should Work)
```sql
-- This should work (has required fields)
INSERT INTO leads (first_name, email) 
VALUES ('Test', 'test@example.com');
```

### Test Lead Insert (Should Fail)
```sql
-- This should fail (missing required fields)
INSERT INTO leads (first_name) 
VALUES ('Test');
```

## Impact on Your Application

### ✅ No Breaking Changes
- Lead capture forms still work (as long as they provide required fields)
- Analytics tracking still works (as long as event_type is provided)
- Download tracking still works (as long as required fields are provided)

### 🔒 Security Improvements
- Function is protected against search_path injection
- INSERT policies validate required fields
- Prevents malicious data insertion

## Related Files

- `cms/enable-rls-migration.sql` - Initial RLS setup (run first)
- `cms/fix-rls-warnings.sql` - This fix (run after initial migration)
- `cms/RLS-MIGRATION-GUIDE.md` - Complete RLS migration guide

## Next Steps

1. **Run the fix** (see Step 2 above)
2. **Enable leaked password protection** in Supabase Dashboard
3. **Verify** all warnings are resolved in Database Linter
4. **Test** your application to ensure everything works

---

**Status**: ✅ Ready to apply
**Time Required**: ~2 minutes
**Risk Level**: Low (adds validation, doesn't break existing functionality)

