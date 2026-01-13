# User Management Feature - Complete Guide

## 📍 Location

**Main Page:** `/admin/users`  
**File:** `app/admin/users/page.tsx`

**API Routes:**
- `app/api/admin/users/route.ts` - GET (list users), POST (create user)
- `app/api/admin/users/[id]/route.ts` - PUT (update user), DELETE (delete user)

---

## ✅ Available Features

### 1. **View All Users**
- **Location:** Main table on `/admin/users` page
- **Shows:**
  - User name and email
  - Role (Admin, Editor, Author, Viewer)
  - Status (Active, Pending, Inactive, Suspended)
  - Last login date
  - User avatar (initial letter)
- **Access:** Admin only

### 2. **Add/Create New User**
- **Button:** "Add User" button in header
- **Form Fields:**
  - Full Name (required)
  - Email (required, validated)
  - Password (required, minimum 6 characters)
  - Role (dropdown: Viewer, Author, Editor, Admin)
- **API:** `POST /api/admin/users`
- **Access:** Admin only
- **Features:**
  - Email validation
  - Duplicate email check
  - Auto-confirms email for admin-created users
  - Sets status to "active" immediately

### 3. **Delete User**
- **Button:** "Delete" button in Actions column
- **Confirmation:** Yes/No dialog before deletion
- **API:** `DELETE /api/admin/users/[id]`
- **Access:** Admin only
- **Protection:** Cannot delete your own account
- **Location:** Each user row has a Delete button

### 4. **Update User Role**
- **Method:** Dropdown selector in Role column
- **Available Roles:**
  - **Viewer** - Read-only access
  - **Author** - Can create and edit own content
  - **Editor** - Can create, edit, and publish content
  - **Admin** - Full access including user management
- **API:** `PUT /api/admin/users/[id]` with `{ role: "..." }`
- **Access:** Admin only
- **Real-time:** Updates immediately in UI

### 5. **Update User Status**
- **Method:** Dropdown selector in Status column
- **Available Statuses:**
  - **Active** - User can log in
  - **Pending** - Waiting for admin approval
  - **Inactive** - Account deactivated
  - **Suspended** - Account suspended
- **API:** `PUT /api/admin/users/[id]` with `{ status: "..." }`
- **Access:** Admin only
- **Real-time:** Updates immediately in UI

### 6. **Pending Users Approval System**
- **Location:** Yellow banner section at top of page
- **Shows:** All users with "pending" status
- **Actions:**
  - **Approve** - Changes status to "active"
  - **Reject** - Deletes the user (with confirmation)
- **Features:**
  - Separate section for pending users
  - Can change role before approving
  - Visual distinction (yellow background)

### 7. **User Information Display**
- **Avatar:** Initial letter in colored circle
- **Name:** Full name
- **Email:** User email address
- **Role Badge:** Color-coded role badges
  - Admin: Red
  - Editor: Blue
  - Author: Green
  - Viewer: Slate/Gray
- **Status Badge:** Color-coded status badges
  - Active: Green
  - Pending: Yellow
  - Inactive: Gray
  - Suspended: Red
- **Last Login:** Shows last login date or "Never"

---

## 🔐 Security & Access Control

### Admin-Only Access
- All user management features require **admin role**
- API endpoints check authentication and role
- Non-admin users get 403 Forbidden error

### Role Hierarchy
1. **Admin** - Full access (can manage users)
2. **Editor** - Can create/edit/publish content
3. **Author** - Can create/edit own content
4. **Viewer** - Read-only access

### Protection Features
- Cannot delete your own account
- Email uniqueness validation
- Password strength requirements (min 6 chars)
- Input validation with Zod schemas

---

## 📊 API Endpoints

### GET `/api/admin/users`
- **Purpose:** Fetch all users
- **Auth:** Admin only
- **Returns:** Array of user objects
- **Features:**
  - Fetches from Supabase Auth
  - Transforms to internal format
  - Includes metadata (role, status, etc.)

### POST `/api/admin/users`
- **Purpose:** Create new user
- **Auth:** Admin only
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "author"
  }
  ```
- **Validation:**
  - Name: min 2 characters
  - Email: valid email format
  - Password: min 6 characters
  - Role: enum (admin, editor, author, viewer)
- **Features:**
  - Checks for duplicate emails
  - Auto-confirms email
  - Sets status to "active"

### PUT `/api/admin/users/[id]`
- **Purpose:** Update user
- **Auth:** Admin only
- **Body:** (all fields optional)
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "role": "editor",
    "status": "active"
  }
  ```
- **Features:**
  - Partial updates supported
  - Email uniqueness check
  - Updates user metadata in Supabase

### DELETE `/api/admin/users/[id]`
- **Purpose:** Delete user
- **Auth:** Admin only
- **Protection:** Cannot delete own account
- **Features:**
  - Permanently deletes from Supabase Auth
  - Returns success message

---

## 🎨 UI Features

### Design
- Modern gradient background
- Card-based layout
- Color-coded badges
- Hover effects
- Responsive design

### Pending Users Section
- Yellow/amber color scheme
- Prominent display at top
- Separate table layout
- Quick approve/reject actions

### All Users Table
- Clean table layout
- Inline role/status dropdowns
- Delete button per row
- User avatars with initials

### Create User Modal
- Modal overlay
- Form validation
- Error messages
- Loading states
- Cancel/Submit buttons

---

## 📝 User Status Flow

1. **Registration** → Status: `pending`
2. **Admin Approval** → Status: `active`
3. **Admin can change to:**
   - `inactive` - Deactivate account
   - `suspended` - Suspend account
   - `active` - Reactivate account

### Login Behavior
- **Pending:** Cannot log in (403 error)
- **Inactive/Suspended:** Cannot log in (401 error)
- **Active:** Can log in normally

---

## 🔗 Navigation

**Access from Dashboard:**
- Dashboard → Quick Access → "User Management"
- Direct URL: `/admin/users`

**Breadcrumb:**
- Dashboard ← User Management

---

## 📋 Quick Reference

| Feature | Location | Access | API Endpoint |
|---------|----------|--------|--------------|
| View Users | `/admin/users` | Admin | `GET /api/admin/users` |
| Add User | "Add User" button | Admin | `POST /api/admin/users` |
| Delete User | Delete button | Admin | `DELETE /api/admin/users/[id]` |
| Update Role | Role dropdown | Admin | `PUT /api/admin/users/[id]` |
| Update Status | Status dropdown | Admin | `PUT /api/admin/users/[id]` |
| Approve User | Approve button | Admin | `PUT /api/admin/users/[id]` |
| Reject User | Reject button | Admin | `DELETE /api/admin/users/[id]` |

---

## 🛠️ Technical Details

### Database
- Uses **Supabase Auth** for user storage
- User metadata stored in `user_metadata`:
  - `name` - User's full name
  - `role` - User role (admin, editor, author, viewer)

### Authentication
- Uses Supabase Auth service
- Admin role checked via `getCurrentUser()`
- Service role key required for admin operations

### Error Handling
- Comprehensive error messages
- Input validation
- Duplicate email checks
- Self-deletion protection

---

## 🚀 Usage Examples

### Creating a New Admin User
1. Go to `/admin/users`
2. Click "Add User"
3. Fill in:
   - Name: "Admin User"
   - Email: "admin@example.com"
   - Password: "securepassword"
   - Role: "Admin"
4. Click "Create User"
5. User is immediately active and can log in

### Approving a Pending User
1. Go to `/admin/users`
2. See pending users in yellow section
3. Optionally change role
4. Click "Approve"
5. User status changes to "active"

### Changing User Role
1. Go to `/admin/users`
2. Find user in table
3. Click role dropdown
4. Select new role
5. Role updates immediately

---

## ✅ All Features Confirmed Working

- ✅ View all users
- ✅ Add new user
- ✅ Delete user
- ✅ Update user role
- ✅ Update user status
- ✅ Approve pending users
- ✅ Reject pending users
- ✅ Admin-only access
- ✅ Self-deletion protection
- ✅ Email validation
- ✅ Duplicate email check
- ✅ Beautiful UI
- ✅ Responsive design





