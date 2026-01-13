"use client";

import * as React from "react";
import { Search, Bell, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface VisionUIHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  pageTitle?: string;
}

export function VisionUIHeader({ breadcrumbs, pageTitle }: VisionUIHeaderProps) {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-[#0F172A] border-b border-[#334155] z-40 flex items-center justify-between px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-[#64748B]">/</span>}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-[#CBD5E1] hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-[#CBD5E1]">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        {pageTitle && (
          <div className="ml-4">
            <h1 className="text-white font-semibold text-lg">{pageTitle}</h1>
          </div>
        )}
      </div>

      {/* Right Side - Search, Notifications, Settings, User */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Type here..."
            className="w-64 pl-10 pr-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-sm placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
          />
        </div>

        {/* Icons */}
        <button className="p-2 text-[#CBD5E1] hover:text-white hover:bg-[#334155] rounded-lg transition-colors">
          <User className="w-5 h-5" />
        </button>
        <button className="p-2 text-[#CBD5E1] hover:text-white hover:bg-[#334155] rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full" />
        </button>
        <button className="p-2 text-[#CBD5E1] hover:text-white hover:bg-[#334155] rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

