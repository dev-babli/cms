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
      title: "eBooks",
      description: "Lead magnet eBooks",
      href: "/admin/ebooks",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      count: 0,
    },
    {
      title: "Case Studies",
      description: "Client success stories",
      href: "/admin/case-studies",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      count: 0,
    },
    {
      title: "Whitepapers",
      description: "Research & insights",
      href: "/admin/whitepapers",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      count: 0,
    },
    {
      title: "Categories",
      description: "Content categories",
      href: "/admin/categories",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      count: 0,
    },
    {
      title: "Leads",
      description: "Captured leads & exports",
      href: "/admin/leads",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      count: 0,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 via-white to-indigo-50/20">
      {/* Premium Header with Enhanced Glass Morphism */}
      <header className="sticky top-0 z-50 glass border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Intellectt CMS</h1>
              <p className="text-sm text-slate-600 font-medium">Content Management System</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-600 capitalize">{user.role}</p>
              </div>
              <form action="/api/auth/logout" method="POST">
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Premium Welcome Section */}
        <FadeIn>
          <div className="mb-12">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-semibold border border-blue-200/50">
                👋 Welcome Back
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Welcome back, {user.name}
            </h2>
            <p className="text-xl text-slate-600 font-medium">
              Manage your content and publish updates • <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-900 font-semibold capitalize">{user.role}</span>
            </p>
          </div>
        </FadeIn>

        {/* Quick Actions */}
        <FadeIn delay={0.1}>
          <div className="mb-12 flex flex-wrap items-center gap-3">
            <Link href="/admin/blog/new">
              <button className="btn-premium flex items-center gap-2 group">
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Blog Post
              </button>
            </Link>
            <Link href="/admin/services/new">
              <button className="px-6 py-3 bg-white text-slate-700 rounded-xl text-sm font-semibold hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-300 shadow-md border border-slate-200 hover:border-blue-300 hover:shadow-lg flex items-center gap-2 group">
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Service
              </button>
            </Link>
            <Link href="/admin/ebooks/new">
              <button className="px-6 py-3 bg-white text-slate-700 rounded-xl text-sm font-semibold hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-300 shadow-md border border-slate-200 hover:border-blue-300 hover:shadow-lg flex items-center gap-2 group">
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New eBook
              </button>
            </Link>
          </div>
        </FadeIn>

        {/* Content Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentTypes.map((type, index) => (
            <FadeIn key={type.href} delay={0.15 + index * 0.05}>
              <Link href={type.href}>
                <div className="group premium-card-gradient p-6 cursor-pointer hover-lift relative overflow-hidden">
                  {/* Animated Background Gradient on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-500 rounded-2xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white group-hover:from-blue-600 group-hover:to-indigo-700 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-blue-500/30">
                        {type.icon}
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                          {type.count}
                        </span>
                        <p className="text-xs text-slate-500 font-medium">Items</p>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                      {type.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {type.description}
                    </p>
                    {type.adminOnly && (
                      <span className="inline-block mt-3 px-3 py-1 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 text-xs font-bold rounded-full border border-red-200/50 shadow-sm">
                        🔒 Admin Only
                      </span>
                    )}
                    
                    {/* Arrow indicator */}
                    <div className="mt-4 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-sm font-semibold">View All</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
