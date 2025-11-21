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
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false, // Security: Remove X-Powered-By header
  reactStrictMode: true,
  // swcMinify is enabled by default in Next.js 15
  // Removed outputFileTracingRoot to fix Vercel deployment path issues
};

export default nextConfig;

