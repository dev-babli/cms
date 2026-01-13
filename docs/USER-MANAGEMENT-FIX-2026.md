# User Management Fix - 2026 Supabase Best Practices

## ✅ Fixed Issues

### 1. **Frontend API Calls**
- ✅ Added `credentials: "include"` to all fetch calls
- ✅ Improved error handling with proper error messages
- ✅ Added proper response validation

### 2. **Backend API Routes**
- ✅ Using Supabase Admin API (`supabase.auth.admin.*`)
- ✅ Proper service role key usage
- ✅ Role-based access control (admin only)

## 🔧 How It Works (2026 Supabase)

### Creating Users from Frontend

**Frontend (React):**
```typescript
const res = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // ✅ Required for cookies
    body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        password: "securepassword",
        role: "editor"
    }),
});
```

**Backend (API Route):**
```typescript
// Uses service role key (server-side only)
const supabase = createServerClient(); // Uses SUPABASE_SERVICE_ROLE_KEY

const { data: newUser, error } = await supabase.auth.admin.createUser({
    email: validated.email,
    password: validated.password,
    email_confirm: true, // Auto-confirm for admin-created users
    user_metadata: {
        name: validated.name,
        role: validated.role, // ✅ Role stored in user_metadata
    },
});
```

### Updating User Roles

**Frontend:**
```typescript
const res = await fetch(`/api/admin/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ role: "admin" }),
});
```

**Backend:**
```typescript
const { data: updatedUser, error } = await supabase.auth.admin.updateUserById(
    userId,
    {
        user_metadata: {
            ...existingMetadata,
            role: "admin", // ✅ Update role in user_metadata
        },
    }
);
```

## 🔐 Security (2026 Best Practices)

### ✅ DO:
1. **Use Service Role Key** - Only in server-side API routes
2. **Store Roles in `user_metadata`** - Standard Supabase practice
3. **Verify Admin Access** - Check role before allowing operations
4. **Use `credentials: "include"`** - For cookie-based auth

### ❌ DON'T:
1. **Never expose service role key** - Keep it server-side only
2. **Don't use anon key for admin ops** - Use service role key
3. **Don't skip role verification** - Always check admin access

## 📋 Environment Variables Required

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-side only (NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🎯 Key Changes Made

1. **All fetch calls** now include `credentials: "include"`
2. **Error handling** improved with proper error messages
3. **Response validation** checks `data.success` before proceeding
4. **Console logging** for debugging in development

## 🚀 Testing

1. **Create User:**
   - Go to `/admin/users`
   - Click "Create New User"
   - Fill form and submit
   - ✅ User should be created in Supabase

2. **Update Role:**
   - Find user in table
   - Change role dropdown
   - ✅ Role should update immediately

3. **Delete User:**
   - Click "Delete" button
   - Confirm deletion
   - ✅ User should be removed

## 📝 Notes

- Roles are stored in `user_metadata.role` in Supabase
- Service role key bypasses RLS (Row Level Security)
- All admin operations require admin role verification
- Frontend uses cookies for authentication (via `credentials: "include"`)





