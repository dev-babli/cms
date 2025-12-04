# How Supabase Auth Works in This CMS

## Overview

This CMS now uses **pure Supabase Auth** for authentication. There is **no custom database user table** for authentication anymore.

## How It Works

### 1. **User Storage**
- **Supabase Auth** manages all users independently
- Users are stored in Supabase's authentication system (not in your PostgreSQL database)
- The `users` table in your database is **NOT used for authentication** anymore

### 2. **User List**
- Users are fetched directly from **Supabase Auth** using `supabase.auth.admin.listUsers()`
- The admin panel (`/admin/users`) shows users from Supabase Auth, not from the database
- Each user has:
  - `id`: Supabase UUID (not database ID)
  - `email`: User's email
  - `user_metadata`: Contains `name` and `role`
  - `email_confirmed_at`: Email verification status

### 3. **Authentication Flow**

#### Login:
1. User submits email/password
2. CMS calls `supabase.auth.signInWithPassword()`
3. Supabase Auth validates credentials
4. If valid, Supabase returns a session with `access_token`
5. CMS sets `sb-access-token` cookie
6. User is logged in ✅

#### Checking Auth (Server-side):
1. CMS reads `sb-access-token` cookie
2. Calls `supabase.auth.getUser(accessToken)`
3. Supabase validates the token
4. Returns user data if valid

#### Logout:
1. CMS calls `supabase.auth.signOut()`
2. Clears `sb-access-token` cookie
3. User is logged out ✅

### 4. **User Management**

#### Creating Users:
- Admin creates user via `/admin/users`
- CMS calls `supabase.auth.admin.createUser()`
- User is created in Supabase Auth with:
  - Email
  - Password
  - `user_metadata`: `{ name, role }`
- User can immediately log in

#### Updating Users:
- Admin updates user via `/admin/users`
- CMS calls `supabase.auth.admin.updateUserById()`
- Updates email or `user_metadata` (name, role)

#### Deleting Users:
- Admin deletes user via `/admin/users`
- CMS calls `supabase.auth.admin.deleteUser()`
- User is removed from Supabase Auth

## Key Points

✅ **Supabase Auth is the single source of truth** for users
✅ **No database sync needed** - Supabase manages everything
✅ **Roles are stored in `user_metadata.role`** in Supabase Auth
✅ **The database `users` table is not used** for authentication

## Testing Connection

Run this to check your Supabase connection and list users:

```bash
node scripts/test-supabase-connection.js
```

## Setting Admin Role

If a user exists but doesn't have a role set:

```bash
node scripts/set-admin-role.js
```

## Environment Variables Required

```env
# Public (can be exposed in client)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Private (server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Why This is Better

1. **Security**: Supabase handles password hashing, token management, email verification
2. **Simplicity**: No need to sync users between database and auth system
3. **Features**: Built-in password reset, email verification, OAuth providers
4. **Reliability**: Supabase Auth is battle-tested and maintained


