# 📁 Project Structure

This document explains the organized structure of your Emscale website.

## 🗂️ Directory Layout

```
D:\Emscale (2)\
│
├── app/                                    # Next.js App Router
│   ├── layout.tsx                         # Root layout (fonts, metadata)
│   ├── globals.css                        # Global styles
│   ├── page.tsx                           # Home page (/)
│   ├── about-us/
│   │   └── page.tsx                       # About Us page (/about-us)
│   ├── services/
│   │   └── page.tsx                       # Services page (/services)
│   ├── service-detail/
│   │   └── page.tsx                       # Service Detail page (/service-detail)
│   ├── blog/
│   │   └── page.tsx                       # Blog listing page (/blog)
│   └── blog-post/
│       └── page.tsx                       # Blog post page (/blog-post)
│
├── components/                             # All React components
│   ├── ui/                                # Shared UI components (shadcn/ui)
│   │   ├── button.tsx                     # Button component
│   │   ├── input.tsx                      # Input field
│   │   ├── textarea.tsx                   # Textarea field
│   │   ├── label.tsx                      # Form label
│   │   └── checkbox.tsx                   # Checkbox
│   │
│   └── sections/                          # Page-specific sections (Relume exports)
│       ├── home/                          # Home page sections
│       │   └── components/
│       │       ├── navbar-05.jsx          # Navigation bar
│       │       ├── header-145.jsx         # Hero section
│       │       ├── layout-472.jsx         # Feature sections
│       │       ├── layout-237.jsx
│       │       ├── layout-32.jsx
│       │       ├── layout-420.jsx
│       │       ├── layout-421.jsx
│       │       ├── team-01.jsx            # Team section
│       │       ├── testimonial-06.jsx     # Testimonials
│       │       ├── cta-26.jsx             # Call-to-action
│       │       └── footer-05.jsx          # Footer
│       │
│       ├── about/                         # About page sections
│       │   └── components/
│       │       ├── navbar-05.jsx
│       │       ├── header-62.jsx
│       │       ├── team-01.jsx
│       │       ├── timeline-03.jsx        # Timeline/History
│       │       ├── logo-04.jsx            # Logo sections
│       │       ├── logo-06.jsx
│       │       ├── logo-06_1.jsx
│       │       ├── contact-07.jsx         # Contact form
│       │       └── footer-05.jsx
│       │
│       ├── services/                      # Services page sections
│       │   └── components/
│       │       ├── navbar-05.jsx
│       │       ├── header-62.jsx
│       │       ├── layout-239.jsx
│       │       ├── layout-13.jsx
│       │       ├── layout-472.jsx
│       │       ├── layout-237.jsx
│       │       ├── layout-237_1.jsx
│       │       ├── testimonial-06.jsx
│       │       ├── cta-26.jsx
│       │       └── footer-05.jsx
│       │
│       ├── service-detail/                # Service detail page sections
│       │   └── components/
│       │       ├── navbar-05.jsx
│       │       ├── header-62.jsx
│       │       ├── layout-237.jsx
│       │       ├── layout-13.jsx
│       │       ├── layout-356.jsx
│       │       ├── layout-356_1.jsx
│       │       ├── pricing-09.jsx         # Pricing table
│       │       ├── team-01.jsx
│       │       ├── testimonial-06.jsx
│       │       ├── cta-26.jsx
│       │       └── footer-05.jsx
│       │
│       ├── blog/                          # Blog page sections
│       │   └── components/
│       │       ├── navbar-05.jsx
│       │       ├── header-62.jsx
│       │       ├── blog-06.jsx            # Blog grid
│       │       ├── blog-66.jsx            # Blog list
│       │       ├── faq-03.jsx             # FAQ section
│       │       └── footer-05.jsx
│       │
│       └── blog-post/                     # Blog post page sections
│           └── components/
│               ├── navbar-05.jsx
│               └── footer-05.jsx
│
├── hooks/                                  # Custom React hooks
│   └── use-media-query.ts                # Media query hook for responsive design
│
├── lib/                                    # Utility functions
│   └── utils.ts                           # cn() function for className merging
│
├── public/                                 # Static assets
│   └── images/                            # Image assets
│       └── (your images here)
│
├── node_modules/                          # Dependencies (auto-generated)
│
├── Configuration Files
├── package.json                           # Dependencies and scripts
├── tsconfig.json                          # TypeScript configuration
├── tailwind.config.ts                     # Tailwind CSS configuration
├── next.config.ts                         # Next.js configuration
├── postcss.config.mjs                     # PostCSS configuration
├── .eslintrc.json                         # ESLint configuration
├── .gitignore                             # Git ignore rules
├── README.md                              # Main documentation
└── STRUCTURE.md                           # This file
```

---

## 🎯 Key Concepts

### 1. **App Router** (`app/`)

- Next.js 15 uses the **App Router** for file-based routing
- Each `page.tsx` file creates a route
- `layout.tsx` wraps all pages with common elements

### 2. **Component Organization**

- **`components/ui/`** - Reusable UI primitives (buttons, inputs, etc.)
- **`components/sections/`** - Page-specific sections from Relume
- Each page has its own folder with component files

### 3. **Path Aliases**

- Use `@/` to reference from project root
- Example: `import { Button } from "@/components/ui/button"`

---

## 📝 How to Add New Pages

### 1. Create the Page Route

```tsx
// app/new-page/page.tsx
import React from "react";

export default function NewPage() {
  return <div>New Page</div>;
}
```

### 2. Create Relume Components (if needed)

```
components/sections/new-page/
└── components/
    ├── navbar-05.jsx
    ├── header.jsx
    └── footer-05.jsx
```

### 3. Import and Use

```tsx
import { Navbar5 } from "@/components/sections/new-page/components/navbar-05";
```

---

## 🎨 How to Customize

### Update Content

1. Navigate to the section component (e.g., `components/sections/home/components/header-145.jsx`)
2. Edit text, images, and props directly
3. Save and see hot-reload in action

### Add Images

1. Place images in `public/images/`
2. Reference them: `<img src="/images/your-image.jpg" alt="..." />`
3. Or use Next.js Image: `<Image src="/images/your-image.jpg" ... />`

### Create New UI Components

1. Add to `components/ui/`
2. Follow shadcn/ui pattern
3. Export and import where needed

---

## 🚀 Common Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

---

## 📚 Import Patterns

### Absolute Imports (Recommended)

```tsx
import { Button } from "@/components/ui/button";
import { Navbar5 } from "@/components/sections/home/components/navbar-05";
import { cn } from "@/lib/utils";
```

### Component Usage

```tsx
<Button variant="default" size="lg">
  Click Me
</Button>

<Input type="email" placeholder="Enter email" />
```

---

## 🔧 Tech Stack Reference

- **Next.js 15** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Radix UI** - Accessible primitives
- **shadcn/ui** - UI components

---

## 📦 Component Reuse

Many components are used across multiple pages:

- `navbar-05.jsx` - Navigation (used on all pages)
- `footer-05.jsx` - Footer (used on all pages)
- `cta-26.jsx` - Call-to-action (home, services, service-detail)
- `team-01.jsx` - Team section (home, about, service-detail)

Consider extracting common components to `components/ui/` or `components/shared/` if you modify them frequently.

---

**Need help?** Check the main [README.md](./README.md) for setup instructions.


