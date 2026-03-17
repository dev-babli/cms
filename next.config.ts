import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d22po4pjz3o32e.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false, // Security: Remove X-Powered-By header
  reactStrictMode: true,
  // Ensure TipTap ESM packages are transpiled correctly during build
  transpilePackages: [
    "@tiptap/react",
    "@tiptap/starter-kit",
    "@tiptap/extension-link",
    "@tiptap/extension-image",
    "@tiptap/extension-youtube",
    "@tiptap/extension-text-style",
    "@tiptap/extension-text-align",
    "@tiptap/extension-underline",
    "@tiptap/extension-character-count",
    "@tiptap/extension-dropcursor",
    "@tiptap/extension-gapcursor",
    "@tiptap/extension-placeholder",
    "@tiptap/extension-mention",
    "@tiptap/extension-task-list",
    "@tiptap/extension-task-item",
    "@tiptap/extension-table",
    "@tiptap/extension-table-row",
    "@tiptap/extension-table-cell",
    "@tiptap/extension-table-header",
    "@tiptap/extension-typography",
    "@tiptap/pm",
  ],
  // swcMinify is enabled by default in Next.js 15
  // Removed outputFileTracingRoot to fix Vercel deployment path issues
};

export default nextConfig;

