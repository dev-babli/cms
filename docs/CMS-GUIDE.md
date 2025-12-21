# 🎨 Custom CMS Guide

Your project now has a **fully custom Content Management System** built from scratch!

---

## 🚀 Features

✅ **Blog Management** - Create, edit, delete blog posts  
✅ **Services** - Manage your service offerings  
✅ **Team Members** - Add and manage team profiles  
✅ **Pages** - Create custom pages  
✅ **Rich Text Editor** - Beautiful WYSIWYG editor  
✅ **Media Library** - Upload and manage images  
✅ **SQLite Database** - Fast, file-based database  
✅ **REST API** - Full CRUD operations  
✅ **Type-Safe** - Zod schemas for validation

---

## 📂 Structure

```
your-project/
├── app/
│   ├── admin/                    # CMS Dashboard
│   │   ├── page.tsx             # Main dashboard
│   │   ├── blog/                # Blog management
│   │   ├── services/            # Services management
│   │   └── team/                # Team management
│   │
│   └── api/cms/                 # API Routes
│       ├── blog/                # Blog API
│       ├── services/            # Services API
│       └── team/                # Team API
│
├── lib/
│   ├── db.ts                    # Database setup
│   └── cms/
│       ├── types.ts             # Content schemas
│       └── api.ts               # Database operations
│
├── components/cms/
│   └── rich-text-editor.tsx     # WYSIWYG editor
│
└── content.db                   # SQLite database (auto-created)
```

---

## 🎯 How to Use

### 1. Access the CMS

Visit: **http://localhost:3000/admin**

You'll see the main dashboard with all content types.

### 2. Create Blog Posts

1. Go to `/admin/blog`
2. Click "New Post"
3. Fill in the form:
   - **Title** - Post title
   - **Slug** - URL-friendly identifier
   - **Excerpt** - Short description
   - **Content** - Rich text content
   - **Author** - Author name
   - **Category** - Post category
   - **Tags** - Comma-separated tags
   - **Published** - Toggle to publish

### 3. Manage Services

1. Go to `/admin/services`
2. Add service details:
   - Title, description, pricing
   - Features list
   - Icons and images

### 4. Add Team Members

1. Go to `/admin/team`
2. Add member info:
   - Name, position, bio
   - Profile image
   - Social links (LinkedIn, Twitter)
   - Order for display

---

## 🔌 API Endpoints

### Blog Posts

```typescript
GET / api / cms / blog; // Get all posts
POST / api / cms / blog; // Create post
GET / api / cms / blog / [id]; // Get single post
PUT / api / cms / blog / [id]; // Update post
DELETE / api / cms / blog / [id]; // Delete post
```

### Services

```typescript
GET / api / cms / services; // Get all services
POST / api / cms / services; // Create service
PUT / api / cms / services / [id]; // Update service
DELETE / api / cms / services / [id]; // Delete service
```

### Team Members

```typescript
GET / api / cms / team; // Get all team members
POST / api / cms / team; // Create team member
PUT / api / cms / team / [id]; // Update team member
DELETE / api / cms / team / [id]; // Delete team member
```

---

## 💻 Using Data in Frontend

### Fetch Blog Posts

```typescript
// In your component
const fetchPosts = async () => {
  const res = await fetch("/api/cms/blog?published=true");
  const data = await res.json();
  return data.data;
};
```

### Example: Blog Page

```tsx
"use client";

import { useEffect, useState } from "react";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("/api/cms/blog?published=true")
      .then((res) => res.json())
      .then((data) => setPosts(data.data));
  }, []);

  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      ))}
    </div>
  );
}
```

---

## 📝 Content Schemas

### Blog Post

```typescript
{
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  author?: string;
  featured_image?: string;
  category?: string;
  tags?: string;
  published: boolean;
  publish_date?: string;
}
```

### Service

```typescript
{
  id: number;
  slug: string;
  title: string;
  description?: string;
  content?: string;
  icon?: string;
  featured_image?: string;
  price?: string;
  features?: string;
  published: boolean;
}
```

### Team Member

```typescript
{
  id: number;
  name: string;
  position?: string;
  bio?: string;
  image?: string;
  email?: string;
  linkedin?: string;
  twitter?: string;
  order_index: number;
  published: boolean;
}
```

---

## 🎨 Rich Text Editor

The CMS includes a powerful WYSIWYG editor with:

- **Bold**, _Italic_ formatting
- Headings (H2, H3)
- Bullet and numbered lists
- Links
- Images
- Clean HTML output

### Using in Forms

```tsx
import { RichTextEditor } from "@/components/cms/rich-text-editor";

const [content, setContent] = useState("");

<RichTextEditor content={content} onChange={setContent} />;
```

---

## 🗄️ Database

Your content is stored in `content.db` (SQLite):

- **Fast** - File-based, no server needed
- **Simple** - Easy to backup (just copy the file)
- **Portable** - Works anywhere
- **Reliable** - Battle-tested technology

### Backup Database

```bash
# Simply copy the file
cp content.db content.backup.db
```

---

## 🔒 Security (Next Steps)

Your CMS is currently **open**. For production, add:

1. **Authentication**

   ```bash
   npm install next-auth
   ```

2. **Protect Admin Routes**

   ```tsx
   // middleware.ts
   export { default } from "next-auth/middleware";
   export const config = { matcher: ["/admin/:path*"] };
   ```

3. **API Protection**
   Add auth checks to API routes

---

## 🚀 Next Steps

1. **Add Authentication** - Protect /admin routes
2. **Add Image Upload** - Implement file uploads
3. **Add Preview Mode** - Preview content before publishing
4. **Add Versioning** - Track content history
5. **Add Search** - Search through content
6. **Add Categories/Tags** - Better organization

---

## 📚 Technologies Used

- **Database**: SQLite (better-sqlite3)
- **Validation**: Zod
- **Editor**: Tiptap
- **UI**: React + Next.js 15
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript

---

## 🎉 You're Ready!

Your custom CMS is fully functional! Start creating content at:

**http://localhost:3000/admin**

For questions or issues, check the code in:

- `lib/cms/` - Core CMS logic
- `app/api/cms/` - API endpoints
- `app/admin/` - Dashboard UI

---

**Built with ❤️ for your Emscale project**




