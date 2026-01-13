"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function BreadcrumbNav() {
  const pathname = usePathname();
  
  const pathSegments = pathname
    .split("/")
    .filter((segment) => segment && segment !== "admin")
    .map((segment, index, array) => {
      const href = `/admin/${array.slice(0, index + 1).join("/")}`;
      const title = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return { href, title, segment };
    });

  if (pathSegments.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Home className="h-4 w-4" />
        <span className="font-medium text-foreground">Dashboard</span>
      </div>
    );
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link
        href="/admin"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        <span>Dashboard</span>
      </Link>
      {pathSegments.map((segment, index) => {
        const isLast = index === pathSegments.length - 1;
        return (
          <React.Fragment key={segment.href}>
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-foreground">
                {segment.title}
              </span>
            ) : (
              <Link
                href={segment.href}
                className="hover:text-foreground transition-colors"
              >
                {segment.title}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

