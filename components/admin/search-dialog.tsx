"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { adminNavGroups } from "@/navigation/admin-nav-items";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole?: string;
}

export function SearchDialog({ open, onOpenChange, userRole = "editor" }: SearchDialogProps) {
  const router = useRouter();

  // Flatten all nav items for search
  const allItems = React.useMemo(() => {
    const items: Array<{ title: string; url: string; group: string }> = [];
    adminNavGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.adminOnly && userRole !== "admin") {
          return;
        }
        items.push({
          title: item.title,
          url: item.url,
          group: group.title,
        });
        // Add sub-items if they exist
        if (item.items) {
          item.items.forEach((subItem) => {
            if (subItem.adminOnly && userRole !== "admin") {
              return;
            }
            items.push({
              title: `${item.title} > ${subItem.title}`,
              url: subItem.url,
              group: group.title,
            });
          });
        }
      });
    });
    return items;
  }, [userRole]);

  const runCommand = React.useCallback(
    (url: string) => {
      router.push(url);
      onOpenChange(false);
    },
    [router, onOpenChange]
  );

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  // Group items by their group
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, typeof allItems> = {};
    allItems.forEach((item) => {
      if (!groups[item.group]) {
        groups[item.group] = [];
      }
      groups[item.group].push(item);
    });
    return groups;
  }, [allItems]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search dashboards, pages, and more…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(groupedItems).map(([groupName, items], index) => (
          <React.Fragment key={groupName}>
            {index !== 0 && <CommandSeparator />}
            <CommandGroup heading={groupName}>
              {items.map((item) => (
                <CommandItem
                  key={item.url}
                  value={item.title}
                  onSelect={() => runCommand(item.url)}
                  className="!py-1.5"
                >
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

