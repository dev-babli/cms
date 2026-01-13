"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Table2,
  CreditCard,
  ArrowLeftRight,
  User,
  FileText,
  Rocket,
  HelpCircle,
  Search,
  BookOpen,
  Briefcase,
  Users,
  FolderOpen,
  Newspaper,
  MessageSquare,
  Settings,
  BarChart3,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
];

const cmsNavItems: NavItem[] = [
  {
    title: "Blog Posts",
    href: "/admin/blog",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    title: "Team Members",
    href: "/admin/team",
    icon: <Users className="w-5 h-5" />,
  },
  {
    title: "Job Postings",
    href: "/admin/jobs",
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    title: "eBooks",
    href: "/admin/ebooks",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    title: "Case Studies",
    href: "/admin/case-studies",
    icon: <FolderOpen className="w-5 h-5" />,
  },
  {
    title: "News",
    href: "/admin/news",
    icon: <Newspaper className="w-5 h-5" />,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: <FolderOpen className="w-5 h-5" />,
  },
  {
    title: "Leads",
    href: "/admin/leads",
    icon: <Mail className="w-5 h-5" />,
  },
  {
    title: "Media Library",
    href: "/admin/media",
    icon: <FileText className="w-5 h-5" />,
  },
];

const toolsNavItems: NavItem[] = [
  {
    title: "Tables",
    href: "/admin/tables",
    icon: <Table2 className="w-5 h-5" />,
  },
  {
    title: "Kanban",
    href: "/admin/kanban",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: <BarChart3 className="w-5 h-5" />,
  },
];

const accountNavItems: NavItem[] = [
  {
    title: "Profile",
    href: "/admin/profile",
    icon: <User className="w-5 h-5" />,
  },
  {
    title: "Sign In",
    href: "/auth/login",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    title: "Sign Up",
    href: "/auth/register",
    icon: <Rocket className="w-5 h-5" />,
  },
];

export function VisionUISidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#0F172A] to-[#1E293B] border-r border-[#334155] z-50 flex flex-col">
      {/* Brand */}
      <div className="px-6 py-4 border-b border-[#334155]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#A855F7] flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-white font-semibold text-sm">VISION UI FREE</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-4">
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-[#3B82F6] text-white"
                    : "text-[#CBD5E1] hover:bg-[#334155] hover:text-white"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
                {item.badge && (
                  <span className="ml-auto text-xs bg-[#3B82F6] text-white px-2 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Separator */}
        <div className="my-4 border-t border-[#334155]" />

        {/* CMS Content Management */}
        <div className="mb-4">
          <p className="px-4 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
            CONTENT MANAGEMENT
          </p>
          <div className="space-y-1">
            {cmsNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-[#3B82F6] text-white"
                      : "text-[#CBD5E1] hover:bg-[#334155] hover:text-white"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Separator */}
        <div className="my-4 border-t border-[#334155]" />

        {/* Tools */}
        <div className="mb-4">
          <p className="px-4 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
            TOOLS
          </p>
          <div className="space-y-1">
            {toolsNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-[#3B82F6] text-white"
                      : "text-[#CBD5E1] hover:bg-[#334155] hover:text-white"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Separator */}
        <div className="my-4 border-t border-[#334155]" />

        {/* Account Pages */}
        <div className="mb-4">
          <p className="px-4 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
            ACCOUNT PAGES
          </p>
          <div className="space-y-1">
            {accountNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-[#3B82F6] text-white"
                      : "text-[#CBD5E1] hover:bg-[#334155] hover:text-white"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Help Section */}
      <div className="p-4 border-t border-[#334155]">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#A855F7] p-4">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-sm">Need help?</span>
            </div>
            <p className="text-white/90 text-xs mb-3">Please check our docs</p>
            <button className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium py-2 px-4 rounded-lg transition-colors">
              DOCUMENTATION
            </button>
          </div>
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8" />
        </div>
      </div>
    </aside>
  );
}

