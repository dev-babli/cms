# Authentication System

Complete authentication system with secure session management and role-based access control.

## Overview

The Emscale CMS uses a custom authentication system with:
- Secure password hashing (bcrypt)
- HTTPOnly cookie-based sessions
- Role-based access control (RBAC)
- Server-side session validation

## Default Credentials

**Default Admin Account:**
- Email: `admin@emscale.com`
- Password: `admin123`

⚠️ **IMPORTANT:** Change these credentials immediately after first login in production!

## Authentication Flow

### 1. Login Process

```
User submits credentials
    ↓
POST /api/auth/login
    ↓
Validate email & password
    ↓
Create session token
    ↓
Set HTTPOnly cookie
    ↓
Redirect to /admin
```

### 2. Protected Routes

All `/admin/*` routes require authentication:

```typescript
// Middleware checks for auth token
if (!token) {
  redirect('/auth/login');
}
```

### 3. Server-Side Validation

```typescript
import { requireAuth, requireRole } from '@/lib/auth/server';

// In server components
export default async function AdminPage() {
  const user = await requireAuth(); // Redirects if not authenticated
  
  // Or require specific role
  const admin = await requireRole('admin');
}
```

## User Roles

### Available Roles

1. **Admin** - Full system access
   - Manage all content
   - Manage users
   - Access all settings
   - Configure workflows

2. **Editor** - Content management
   - Create/edit/delete content
   - Publish content
   - Cannot manage users

3. **Author** - Content creation
   - Create/edit own content
   - Submit for review
   - Cannot publish directly

4. **Viewer** - Read-only access
   - View content
   - Cannot make changes

## API Endpoints

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@emscale.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@emscale.com",
    "name": "Admin",
    "role": "admin"
  }
}
```

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

### Logout
```http
POST /api/auth/logout
```

**Or via HTML form:**
```html
<form action="/api/auth/logout" method="POST">
  <button type="submit">Logout</button>
</form>
```

### Get Current User
```http
GET /api/auth/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@emscale.com",
      "name": "Admin",
      "role": "admin"
    }
  }
}
```

## Client-Side Usage

### Check Authentication Status

```typescript
"use client";

import { useEffect, useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.data.user);
        }
        setLoading(false);
      });
  }, []);

  return { user, loading };
}
```

### Login Form

```typescript
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  async function handleSubmit(e) {
    e.preventDefault();
    
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (res.ok) {
      router.push('/admin');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## Server-Side Usage

### Protect Server Components

```typescript
import { requireAuth } from '@/lib/auth/server';

export default async function ProtectedPage() {
  // Will redirect to login if not authenticated
  const user = await requireAuth();
  
  return <div>Welcome, {user.name}!</div>;
}
```

### Role-Based Protection

```typescript
import { requireRole } from '@/lib/auth/server';

export default async function AdminOnlyPage() {
  // Only admins can access
  const admin = await requireRole('admin');
  
  return <div>Admin Panel</div>;
}
```

### Multiple Roles

```typescript
import { requireRole } from '@/lib/auth/server';

export default async function EditorPage() {
  // Admins and editors can access
  const user = await requireRole(['admin', 'editor']);
  
  return <div>Editor Panel</div>;
}
```

## Security Features

### Password Security
- Passwords hashed with bcrypt (12 rounds)
- Never stored in plain text
- Minimum length enforced

### Session Security
- HTTPOnly cookies (no JavaScript access)
- Secure flag in production (HTTPS only)
- SameSite: Lax (CSRF protection)
- 24-hour expiration
- Automatic cleanup of expired sessions

### Token Security
- Cryptographically random tokens (nanoid)
- 32-character length
- Single-use on logout
- Server-side validation only

## Middleware Protection

The middleware provides basic protection:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (pathname.startsWith('/admin/')) {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
}
```

**Note:** Full session validation happens in server components and API routes.

## Session Management

### Session Creation
```typescript
import { sessions } from '@/lib/auth/users';

const token = sessions.create(userId);
// Returns: random token string
```

### Session Validation
```typescript
const session = sessions.findByToken(token);
if (session) {
  console.log(session.user); // User object
}
```

### Session Deletion
```typescript
sessions.delete(token);
```

## Environment Variables

```env
# Required
ADMIN_EMAIL=admin@emscale.com
ADMIN_PASSWORD=change_this_password

# Optional
SESSION_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret
```

## User Management

### Create User (Admin API)
```http
POST /api/admin/users
Content-Type: application/json
Cookie: auth-token=...

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "role": "author"
}
```

### Update User Role
```http
PUT /api/admin/users/:id
Content-Type: application/json
Cookie: auth-token=...

{
  "role": "editor"
}
```

### Delete User
```http
DELETE /api/admin/users/:id
Cookie: auth-token=...
```

## Best Practices

### Production Setup

1. **Change default credentials immediately**
   ```typescript
   // Via API or database
   UPDATE users SET password_hash = ? WHERE email = 'admin@emscale.com';
   ```

2. **Use strong passwords**
   - Minimum 12 characters
   - Mix of letters, numbers, symbols
   - No common patterns

3. **Enable HTTPS**
   ```env
   NODE_ENV=production
   ```

4. **Set secure secrets**
   ```env
   SESSION_SECRET=$(openssl rand -base64 32)
   JWT_SECRET=$(openssl rand -base64 32)
   ```

5. **Monitor sessions**
   - Regular cleanup of old sessions
   - Track active sessions per user
   - Implement session timeout

### Development Tips

1. **Test authentication flows**
   ```bash
   npm run test:e2e
   ```

2. **Use environment-specific credentials**
   ```env
   # .env.local (development)
   ADMIN_EMAIL=dev@example.com
   ADMIN_PASSWORD=dev123
   
   # .env.production
   ADMIN_EMAIL=admin@yourcompany.com
   ADMIN_PASSWORD=secure_random_password
   ```

3. **Log authentication events**
   ```typescript
   console.log(`User ${user.email} logged in at ${new Date()}`);
   ```

## Troubleshooting

### Cannot Login

**Check:**
1. Database initialized: `npm run db:init`
2. Default admin created in database
3. Correct credentials
4. Cookies enabled in browser

### Redirected to Login After Login

**Possible causes:**
1. Cookie not being set (check browser dev tools)
2. Session expired
3. Token validation failing

**Debug:**
```typescript
// In API route
console.log('Token:', request.cookies.get('auth-token')?.value);
console.log('Session:', sessions.findByToken(token));
```

### "Unauthorized" Error

**Check:**
1. Valid auth token in cookie
2. Session not expired
3. User has required role
4. Token matches database session

## Security Checklist

- [ ] Changed default admin password
- [ ] Using HTTPS in production
- [ ] Session timeout configured
- [ ] Strong password policy enforced
- [ ] Regular security audits
- [ ] Rate limiting enabled
- [ ] Failed login attempts tracked
- [ ] Secure environment variables
- [ ] Database backups enabled
- [ ] Audit logs implemented

---

**For more information, see:**
- [User Management](USER-MANAGEMENT.md)
- [API Reference](API.md)
- [Security Guide](SECURITY.md)




