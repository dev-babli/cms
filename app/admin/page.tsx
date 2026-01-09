import Link from "next/link";
import { requireAuth, getCurrentUser } from "@/lib/auth/server";
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // requireAuth() will redirect to login if not authenticated
  // Don't catch the redirect error - let Next.js handle it
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
    <div className="p-6">
      {/* Page Title - Sanity Style */}
      <div className="mb-8">
        <h1 className="text-[18px] font-medium text-[#111827] mb-2">Dashboard</h1>
        <p className="text-sm text-[#6B7280]">Overview of your content and activity</p>
      </div>

      {/* Quick Actions - Minimal */}
      <div className="mb-8 flex items-center gap-2">
        <Link href="/admin/blog/new">
          <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors duration-150 ease-out">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Blog Post
          </button>
        </Link>
        <Link href="/admin/ebooks/new">
          <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB] transition-colors duration-150 ease-out">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New eBook
          </button>
        </Link>
      </div>

      {/* Content Types - List View (High Density) */}
      <div className="border border-[#E5E7EB] rounded-md bg-white">
        <div className="divide-y divide-[#E5E7EB]">
          {contentTypes.map((type) => (
            <Link key={type.href} href={type.href}>
              <div className="flex items-center gap-4 px-4 py-3 hover:bg-[#F9FAFB] transition-colors duration-150 ease-out">
                <div className="text-[#6B7280]">
                  {type.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-[#111827]">{type.title}</h3>
                      <p className="text-xs text-[#6B7280] mt-0.5">{type.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-[#6B7280]">{type.count} items</span>
                      {type.adminOnly && (
                        <span className="text-xs text-[#6B7280] px-2 py-0.5 bg-[#F3F4F6] rounded">Admin</span>
                      )}
                      <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
