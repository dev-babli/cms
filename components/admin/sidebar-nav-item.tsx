"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SidebarNavItem({ 
  href, 
  icon, 
  children,
  collapsed = false,
}: { 
  href: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      title={collapsed ? String(children) : undefined}
      aria-label={collapsed ? `${children} - navigate` : undefined}
      className={cn(
        "flex items-center gap-3 py-2 text-sm transition-colors duration-150 ease-out",
        collapsed ? "px-3 justify-center" : "px-4",
        isActive
          ? "bg-[#F9FAFB] text-[#111827] font-medium"
          : "text-[#111827] hover:bg-[#F9FAFB]"
      )}
    >
      <span className={cn(
        "shrink-0 transition-colors duration-150",
        isActive ? "text-[#111827]" : "text-[#6B7280]"
      )}>
        {icon}
      </span>
      {!collapsed && <span className="truncate">{children}</span>}
    </Link>
  );
}







