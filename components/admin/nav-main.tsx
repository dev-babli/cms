"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { adminNavGroups, type NavItem } from "@/navigation/admin-nav-items";

interface NavMainProps {
  userRole?: string;
}

const IsComingSoon = () => (
  <span className="ml-auto rounded-md bg-gray-200 px-2 py-1 text-xs dark:bg-gray-800 dark:text-gray-200">Soon</span>
);

export function NavMain({ userRole = "editor" }: NavMainProps) {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();

  const isItemActive = (url: string, subItems?: NavItem["items"]) => {
    if (subItems?.length) {
      return subItems.some((sub) => pathname.startsWith(sub.url));
    }
    if (url === "/admin") {
      return pathname === url;
    }
    return pathname.startsWith(url);
  };

  const isSubmenuOpen = (subItems?: NavItem["items"]) => {
    return subItems?.some((sub) => pathname.startsWith(sub.url)) ?? false;
  };

  const renderNavItem = (item: NavItem) => {
    // Filter admin-only items
    if (item.adminOnly && userRole !== "admin") {
      return null;
    }

    const active = isItemActive(item.url, item.items);
    const hasSubItems = item.items && item.items.length > 0;
    const submenuOpen = isSubmenuOpen(item.items);

    // Collapsed sidebar view (icon mode)
    if (state === "collapsed" && !isMobile && hasSubItems) {
      return (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton
            disabled={item.comingSoon}
            tooltip={item.title}
            isActive={active}
          >
            {item.icon}
            <span>{item.title}</span>
            <ChevronRight />
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    // Expanded view with collapsible submenus
    if (hasSubItems) {
      return (
        <Collapsible key={item.url} asChild defaultOpen={submenuOpen} className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                disabled={item.comingSoon}
                isActive={active}
                tooltip={item.title}
              >
                {item.icon}
                <span>{item.title}</span>
                {item.comingSoon && <IsComingSoon />}
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items?.map((subItem) => {
                  if (subItem.adminOnly && userRole !== "admin") {
                    return null;
                  }
                  return (
                    <SidebarMenuSubItem key={subItem.url}>
                      <SidebarMenuSubButton
                        asChild
                        aria-disabled={subItem.comingSoon}
                        isActive={isItemActive(subItem.url)}
                      >
                        <Link prefetch={false} href={subItem.url}>
                          {subItem.icon}
                          <span>{subItem.title}</span>
                          {subItem.comingSoon && <IsComingSoon />}
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    }

    // Simple link item
    return (
      <SidebarMenuItem key={item.url}>
        <SidebarMenuButton
          asChild
          aria-disabled={item.comingSoon}
          isActive={active}
          tooltip={item.title}
        >
          <Link prefetch={false} href={item.url}>
            {item.icon}
            <span>{item.title}</span>
            {item.comingSoon && <IsComingSoon />}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <>
      {adminNavGroups.map((group) => (
        <SidebarGroup key={group.title}>
          {group.title && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {group.items.map((item) => renderNavItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}

