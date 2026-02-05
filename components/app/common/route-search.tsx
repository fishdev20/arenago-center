"use client";

import { Role } from "@/app/types/Auth";
import { SIDEBAR_ITEMS } from "@/components/app/common/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

type SearchItem = {
  title: string;
  url: string;
  group: string;
};

function buildSearchItems(role: Role) {
  const items = SIDEBAR_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
  const results: SearchItem[] = [];

  for (const item of items) {
    const group = item.submenus ? item.title : "Pages";
    results.push({ title: item.title, url: item.url, group });

    if (item.submenus) {
      for (const submenu of item.submenus) {
        results.push({ title: submenu.title, url: submenu.url, group: item.title });
      }
    }
  }

  return results;
}

export function RouteSearch({ role, className }: { role: Role; className?: string }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const groupedItems = React.useMemo(() => {
    const items = buildSearchItems(role);
    const groups = new Map<string, SearchItem[]>();

    for (const item of items) {
      if (!groups.has(item.group)) groups.set(item.group, []);
      groups.get(item.group)?.push(item);
    }

    return Array.from(groups.entries());
  }, [role]);

  return (
    <>
      <div className={cn("relative", className)}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 sm:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open page search"
        >
          <Search className="h-4 w-4" />
        </Button>

        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            readOnly
            placeholder="Search pages..."
            className="h-9 w-full pl-8 pr-14"
            onClick={() => setOpen(true)}
            onFocus={() => setOpen(true)}
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            <kbd className="rounded-md border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px]">
              Ctrl K
            </kbd>
          </span>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages..." />
        <CommandList>
          <CommandEmpty>No pages found.</CommandEmpty>
          {groupedItems.map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map((item) => (
                <CommandItem
                  key={item.url}
                  value={`${item.title} ${item.group}`}
                  onSelect={() => {
                    setOpen(false);
                    if (item.url !== pathname) router.push(item.url);
                  }}
                >
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
