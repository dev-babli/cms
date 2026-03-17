"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import LogoutButton from "@/components/auth/LogoutButton";
import { SidebarNavItem } from "./sidebar-nav-item";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { NotificationBell } from "@/components/ui/notification-bell";

const SIDEBAR_STORAGE_KEY = "cms-sidebar-collapsed";
export const WRITING_PATHS = ["/admin/blog/new", "/admin/blog/edit", "/admin/news/new", "/admin/news/edit"];

export const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  isWritingMode: boolean;
}>({ collapsed: false, setCollapsed: () => {}, isWritingMode: false });

export function useSidebar() {
  return useContext(SidebarContext);
}

export function AdminLayoutClient({
  navigation,
  user,
  children,
}: {
  navigation: { name: string; href: string; icon: React.ReactNode }[];
  user: { name: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isWritingMode = WRITING_PATHS.some((p) => pathname.startsWith(p));

  const [collapsed, setCollapsedState] = useState(false);

  const setCollapsed = (v: boolean) => {
    setCollapsedState(v);
    if (typeof window !== "undefined") {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(v));
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored !== null) {
      setCollapsedState(stored === "true");
    }
  }, []);

  useEffect(() => {
    if (isWritingMode) {
      setCollapsedState(true);
    }
  }, [isWritingMode]);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, isWritingMode }}>
      <div className="flex h-screen bg-[#F7F7F8]">
        <aside
          className={cn(
            "border-r border-[#E5E7EB] bg-white flex flex-col transition-all duration-200 ease-out shrink-0",
            collapsed ? "w-[64px]" : "w-[240px]"
          )}
        >
          <div className="h-[56px] border-b border-[#E5E7EB] flex items-center justify-between px-3">
            {!collapsed && (
              <h1 className="text-sm font-medium text-[#111827] truncate">Intellectt CMS</h1>
            )}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-md hover:bg-[#F9FAFB] text-[#6B7280] hover:text-[#111827] transition-colors shrink-0"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeft className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
            {navigation.map((item) => (
              <SidebarNavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                collapsed={collapsed}
              >
                {item.name}
              </SidebarNavItem>
            ))}
          </nav>

          <div className={cn("border-t border-[#E5E7EB] p-4", collapsed && "px-3 py-3")}>
            <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#111827] truncate">{user.name}</p>
                  <p className="text-xs text-[#6B7280] capitalize">{user.role}</p>
                </div>
              )}
              <LogoutButton collapsed={collapsed} />
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <header className="h-[56px] border-b border-[#E5E7EB] bg-white flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-4" />
            <div className="flex items-center gap-3">
              <NotificationBell />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-white min-h-0">
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
