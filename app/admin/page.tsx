import Link from "next/link";
import { FadeIn } from "@/components/ui/scroll-reveal";
import { requireAuth } from "@/lib/auth/server";

export const dynamic = 'force-dynamic'; // Force dynamic rendering for admin page

export default async function AdminDashboard() {
  // Require authentication - will redirect to login if not authenticated
  const user = await requireAuth();
  const contentTypes = [
    {
      title: "Blog Posts",
      description: "Manage articles and content",
      href: "/admin/blog",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      count: 12,
    },
    {
      title: "Services",
      description: "Your service offerings",
      href: "/admin/services",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      count: 8,
    },
    {
      title: "Team Members",
      description: "Manage your team",
      href: "/admin/team",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      count: 6,
    },
    {
      title: "Job Postings",
      description: "Careers & openings",
      href: "/admin/jobs",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 14l9-5-9-5-9 5 9 5zm0 0v7"
          />
        </svg>
      ),
      count: 0,
    },
    {
      title: "Pages",
      description: "Static pages & content",
      href: "/admin/pages",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      count: 4,
    },
    {
      title: "User Management",
      description: "Manage users & permissions",
      href: "/admin/users",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      count: 0,
      adminOnly: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Clean Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <h1 className="text-xl font-semibold">Intellectt CMS</h1>
              <p className="text-xs text-muted-foreground">Content Management System</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Intellectt CMS
              </span>
              <form action="/api/auth/logout" method="POST">
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Welcome */}
          <FadeIn>
            <div className="mb-12">
              <h2 className="text-4xl font-semibold tracking-tight mb-2">
                Welcome back, {user.name}
              </h2>
              <p className="text-lg text-muted-foreground">
                Manage your content and publish updates • Logged in as <span className="font-medium">{user.role}</span>
              </p>
            </div>
          </FadeIn>

          {/* Quick Actions */}
          <FadeIn delay={0.1}>
            <div className="mb-12">
              <div className="flex items-center gap-3">
                <Link href="/admin/blog/new">
                  <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                    New Blog Post
                  </button>
                </Link>
                <Link href="/admin/services/new">
                  <button className="px-5 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors border">
                    New Service
                  </button>
                </Link>
              </div>
            </div>
          </FadeIn>

          {/* Content Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contentTypes.map((type, index) => (
              <FadeIn key={type.href} delay={0.15 + index * 0.05}>
                <Link href={type.href}>
                  <div className="group premium-card p-6 cursor-pointer hover:border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-muted rounded-lg text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {type.icon}
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {type.count}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                      {type.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
