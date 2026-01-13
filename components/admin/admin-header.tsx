"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SearchDialog } from "@/components/admin/search-dialog";
import { UserMenu } from "@/components/admin/user-menu";
import { NotificationBell } from "@/components/ui/notification-bell";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  userName: string;
  userRole: string;
  userEmail?: string;
}

export function AdminHeader({
  userName,
  userRole,
  userEmail,
}: AdminHeaderProps) {
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <>
      <header
        className={cn(
          "flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear",
          "sticky top-0 z-50 overflow-hidden rounded-t-[inherit] bg-background/50 backdrop-blur-md",
        )}
      >
        <div className="flex w-full items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-1 lg:gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
            <Button
              variant="link"
              className="!px-0 font-normal text-muted-foreground hover:no-underline"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-4" />
              Search
              <kbd className="ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium text-[10px]">
                <span className="text-xs">⌘</span>J
              </kbd>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserMenu name={userName} role={userRole} email={userEmail} />
          </div>
        </div>
      </header>
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        userRole={userRole}
      />
    </>
  );
}

