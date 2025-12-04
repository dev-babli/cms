# 📝 Sign Up Page - Information

## ✅ Sign Up Page is Ready!

Your CMS has a **sign-up/registration page** at:
- **URL:** `/auth/register`
- **Full URL:** `http://localhost:3001/auth/register` (local)
- **Full URL:** `https://your-app.vercel.app/auth/register` (Vercel)

---

## 🎯 How It Works

### Registration Flow:

1. **User fills out form:**
   - Full name
   - Email address
   - Password (minimum 6 characters)
   - Confirm password

2. **Validation:**
   - Email format validation
   - Password match check
   - Minimum password length (6 characters)

3. **User Creation:**
   - Creates user in database
   - Default role: `author`
   - Status: `active`
   - Email verified: `true`

4. **Auto Login:**
   - Automatically creates session
   - Sets auth cookie
   - Redirects to `/admin/blog`

---

## 🔐 Default User Role

**New users are created with role: `author`**

This means they can:
- ✅ Create and edit their own blog posts
- ✅ Create and edit services
- ✅ Add team members
- ✅ Create job postings
- ❌ Cannot manage other users (admin only)
- ❌ Cannot change user roles (admin only)

---

## 👥 Available Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access - manage users, all content |
| `editor` | Can edit all content |
| `author` | Can create/edit own content (default) |
| `viewer` | Read-only access |

---

## 🔗 Links

**From Login Page:**
- Link to sign up: "Don't have an account? Sign up"

**Direct Access:**
- `/auth/register`

---

## ✅ Testing

### Test Registration:

1. **Go to:** `http://localhost:3001/auth/register`

2. **Fill out form:**
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `test123`
   - Confirm Password: `test123`

3. **Click:** "Create account"

4. **Result:**
   - User created in database
   - Automatically logged in
   - Redirected to `/admin/blog`

---

## 🛡️ Security Features

- ✅ Password hashing (bcrypt with cost 12)
- ✅ Email uniqueness check
- ✅ Password confirmation
- ✅ Input validation (Zod schema)
- ✅ HTTP-only cookies for sessions
- ✅ Secure cookies in production

---

## 📝 API Endpoint

**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "role": "author" // Optional, defaults to "author"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "User Name",
      "role": "author"
    },
    "session": {
      "token": "session-token",
      "expires_at": "2025-12-20T..."
    }
  }
}
```

---

## 🎯 Usage

**Anyone can sign up!** The sign-up page is publicly accessible.

**After sign-up:**
- User is automatically logged in
- Redirected to admin dashboard
- Can start creating content immediately

---

## ⚙️ Customization

### Change Default Role:

Edit `cms/app/auth/register/page.tsx`:
```typescript
role: "author", // Change to "editor" or "viewer"
```

### Restrict Sign-ups:

To disable public sign-ups, you can:
1. Remove the sign-up page
2. Add admin-only approval
3. Add email verification requirement

---

**Your sign-up page is ready to use!** ✅

Users can now create accounts and start using the CMS.


