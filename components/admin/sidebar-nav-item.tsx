"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SidebarNavItem({ 
  href, 
  icon, 
  children 
}: { 
  href: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-150 ease-out",
        isActive
          ? "bg-[#F9FAFB] text-[#111827] font-medium"
          : "text-[#111827] hover:bg-[#F9FAFB]"
      )}
    >
      <span className={cn(
        "transition-colors duration-150",
        isActive ? "text-[#111827]" : "text-[#6B7280]"
      )}>
        {icon}
      </span>
      <span>{children}</span>
    </Link>
  );
}







