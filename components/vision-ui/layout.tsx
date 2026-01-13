"use client";

import * as React from "react";
import { VisionUISidebar } from "./sidebar";
import { VisionUIHeader } from "./header";
import { usePathname } from "next/navigation";

interface VisionUILayoutProps {
  children: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  pageTitle?: string;
}

export function VisionUILayout({
  children,
  breadcrumbs,
  pageTitle,
}: VisionUILayoutProps) {
  const pathname = usePathname();
  
  // Auto-generate breadcrumbs if not provided
  const autoBreadcrumbs = React.useMemo(() => {
    if (breadcrumbs) return breadcrumbs;
    
    const segments = pathname?.split("/").filter(Boolean) || [];
    if (segments.length === 0) return [{ label: "Dashboard" }];
    
    const result: Array<{ label: string; href?: string }> = [];
    let currentPath = "";
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = (segment || "")
        .split("-")
        .map((s) => s && s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : "")
        .filter(Boolean)
        .join(" ");
      
      if (index === segments.length - 1) {
        result.push({ label });
      } else {
        result.push({ label, href: currentPath });
      }
    });
    
    return result;
  }, [pathname, breadcrumbs]);
  
  // Auto-generate page title if not provided
  const autoPageTitle = React.useMemo(() => {
    if (pageTitle) return pageTitle;
    
    const segments = pathname?.split("/").filter(Boolean) || [];
    if (segments.length === 0) return "Dashboard";
    
    const lastSegment = segments[segments.length - 1] || "";
    return lastSegment
      .split("-")
      .map((s) => s && s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : "")
      .filter(Boolean)
      .join(" ");
  }, [pathname, pageTitle]);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <VisionUISidebar />
      <VisionUIHeader breadcrumbs={autoBreadcrumbs} pageTitle={autoPageTitle} />
      <main className="ml-64 mt-16 p-6">
        {children}
      </main>
    </div>
  );
}

