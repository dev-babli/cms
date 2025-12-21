# ⚡ CMS Quick Start

Get started with your custom CMS in **2 minutes**!

---

## 🚀 Step 1: Access the Admin

1. Start your dev server:

```bash
npm run dev
```

2. Open your browser:

```
http://localhost:3000/admin
```

You'll see the CMS Dashboard! ✨

---

## ✍️ Step 2: Create Your First Blog Post

1. Click **"Blog Posts"**
2. Click **"+ New Post"**
3. Fill in the form:

```
Title:           "Getting Started with AI"
Slug:            "getting-started-with-ai" (auto-generated)
Excerpt:         "Learn the basics of artificial intelligence"
Content:         Use the editor to write your post
Author:          "Your Name"
Category:        "AI"
Tags:            "ai, machine-learning, tutorial"
Featured Image:  https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200
✅ Published:    Check this to publish
```

4. Click **"Create Blog Post"**

---

## 📖 Step 3: See It on Your Website

1. Go to: `http://localhost:3000/blog`
2. You'll see your post in a beautiful card!
3. Click on it to see the full post

---

## 🎨 Step 4: Customize the Layout

### Change Blog Card Style

Edit: `app/blog/page.tsx`

```tsx
// Change the grid layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

// To full width cards:
<div className="space-y-8">
```

### Customize Individual Post

Edit: `app/blog/[slug]/page.tsx`

```tsx
// Change the max width
<div className="container max-w-4xl mx-auto">

// Change typography
<h1 className="text-4xl md:text-5xl lg:text-6xl">
```

---

## 🔧 Quick Tips

### Auto-Generate Slugs

When you type a title, the slug auto-generates!

```
Title: "Hello World" → Slug: "hello-world"
```

### Rich Text Editor Shortcuts

- `Ctrl/Cmd + B` = Bold
- `Ctrl/Cmd + I` = Italic
- Just click the toolbar buttons!

### Add Images to Posts

1. Get image URL from Unsplash:
   ```
   https://unsplash.com/photos/[photo-id]
   ```
2. Add `?w=1200` for optimized size
3. Paste in "Featured Image URL"

### Preview Before Publishing

1. Uncheck "Published"
2. Create as draft
3. Go to `/blog/[your-slug]` to preview
4. Edit and publish when ready

---

## 🎯 Common Tasks

### Edit a Post

1. Go to `/admin/blog`
2. Click "Edit" on any post
3. Make changes
4. Click "Save Changes"

### Delete a Post

1. Go to `/admin/blog`
2. Click "Delete"
3. Confirm deletion

### Unpublish a Post

1. Edit the post
2. Uncheck "Published"
3. Save

---

## 🖼️ Adding Images

### Option 1: Unsplash (Free)

```
https://images.unsplash.com/photo-XXXXXX?w=1200&auto=format&fit=crop
```

### Option 2: Your Own Images

1. Place in `public/images/`
2. Use: `/images/your-image.jpg`

---

## 📱 What You Can Manage

### Blog Posts ✅

- Title, content, images
- Categories and tags
- Author information
- Publish/draft status

### Services ✅

- Service details
- Pricing information
- Features and benefits
- Icons and images

### Team Members ✅

- Name and position
- Biography
- Profile photos
- Social links

---

## 🎨 Frontend Pages

### Blog Listing

**URL:** `/blog`  
**Shows:** All published posts in a grid

### Individual Post

**URL:** `/blog/your-slug`  
**Shows:** Full post with formatting

### Services

**URL:** `/services`  
**Shows:** All your services (connect to CMS next!)

---

## ⚡ Power Features

### Search & Filter

Coming soon in `app/blog/page.tsx`:

```tsx
// Add search
const filtered = posts.filter((post) =>
  post.title.toLowerCase().includes(search.toLowerCase())
);

// Add category filter
const filtered = posts.filter(
  (post) => !category || post.category === category
);
```

### Pagination

```tsx
const postsPerPage = 9;
const currentPosts = posts.slice(0, postsPerPage);
```

---

## 🎉 You're Ready!

Your custom CMS is **fully functional**!

**Next:**

1. Create 2-3 sample blog posts
2. Visit `/blog` to see them
3. Click on posts to read them
4. Customize layouts as needed

**Admin Dashboard:** http://localhost:3000/admin  
**Blog Frontend:** http://localhost:3000/blog

---

**Questions?** Check [CMS-GUIDE.md](./CMS-GUIDE.md) for detailed docs!




