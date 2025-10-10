# ⚡ Quick Start Guide

Get up and running with your Emscale website in minutes!

---

## 🚀 First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# Visit: http://localhost:3000
```

✅ **Your website is now running!**

---

## 📝 Common Tasks

### 1️⃣ Change Homepage Hero Text

**File:** `components/sections/home/components/header-145.jsx`

```jsx
<h1 className="heading-h1 mb-5 font-bold md:mb-6">
  Your New Headline Here  {/* Change this */}
</h1>
<p className="text-medium">
  Your new description here  {/* Change this */}
</p>
```

### 2️⃣ Update Navigation Links

**File:** `components/sections/home/components/navbar-05.jsx`

```jsx
<a href="/services">Services</a>  {/* Update href */}
<a href="/about-us">About Us</a>
<a href="/blog">Blog</a>
```

### 3️⃣ Replace Images

**Step 1:** Add your image to `public/images/`

**Step 2:** Update component:

```jsx
// Find this:
<img src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg" />

// Replace with:
<img src="/images/your-image.jpg" />
```

### 4️⃣ Change Button Text

**File:** Any component with buttons

```jsx
<Button title="Get Started">Click Me {/* Change button text */}</Button>
```

### 5️⃣ Update Contact Form

**File:** `components/sections/about/components/contact-07.jsx`

- Update email handling
- Change form fields
- Customize validation

### 6️⃣ Modify Footer

**File:** `components/sections/home/components/footer-05.jsx`

- Update copyright
- Change social links
- Add/remove footer sections

---

## 🗂️ Where Are Things?

| What                | Where                                      |
| ------------------- | ------------------------------------------ |
| Homepage sections   | `components/sections/home/components/`     |
| About page content  | `components/sections/about/components/`    |
| Services content    | `components/sections/services/components/` |
| Blog layout         | `components/sections/blog/components/`     |
| Shared UI (buttons) | `components/ui/`                           |
| Images              | `public/images/`                           |
| Page routes         | `app/[page-name]/page.tsx`                 |

---

## 🎨 Color & Styling

### Change Colors

**File:** `app/globals.css`

```css
:root {
  --background: 0 0% 100%; /* White background */
  --foreground: 0 0% 3.9%; /* Dark text */
  --primary: 0 0% 9%; /* Primary color */
  /* Modify these values */
}
```

### Tailwind Classes

Components use Tailwind CSS classes:

```jsx
className = "bg-blue-500 text-white px-4 py-2 rounded-lg";
```

**Common classes:**

- `bg-[color]-[shade]` - Background color
- `text-[color]-[shade]` - Text color
- `px-[size]` - Horizontal padding
- `py-[size]` - Vertical padding
- `rounded-[size]` - Border radius

---

## 🔧 Development Tips

### Hot Reload

- Save any file → browser auto-refreshes
- No need to restart server!

### View All Pages

| URL                                  | Page           |
| ------------------------------------ | -------------- |
| http://localhost:3000                | Home           |
| http://localhost:3000/about-us       | About Us       |
| http://localhost:3000/services       | Services       |
| http://localhost:3000/service-detail | Service Detail |
| http://localhost:3000/blog           | Blog           |
| http://localhost:3000/blog-post      | Blog Post      |

### Find Components

Use VS Code search (Ctrl/Cmd + Shift + F):

- Search for text you see on the page
- It will show you which component file contains it

---

## 📦 Build for Production

```bash
# Build the production version
npm run build

# Start production server
npm start
```

---

## 🚢 Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Click "Deploy"

✅ **Live in 1 minute!**

---

## 🆘 Troubleshooting

### Server Won't Start

```bash
# Kill any process on port 3000
# Then restart
npm run dev
```

### Changes Not Showing

1. Save the file (Ctrl/Cmd + S)
2. Refresh browser (F5)
3. Check terminal for errors

### Import Errors

Make sure you use `@/` for absolute imports:

```jsx
// ✅ Correct
import { Button } from "@/components/ui/button";

// ❌ Wrong
import { Button } from "../../../components/ui/button";
```

---

## 📚 Learn More

- **Full Structure:** See [STRUCTURE.md](./STRUCTURE.md)
- **Full Docs:** See [README.md](./README.md)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Tailwind Docs:** [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

**Need help?** Open an issue or check the documentation!

---

✨ **Happy Coding!**


