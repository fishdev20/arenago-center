"use client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { soccerPitch } from "@lucide/lab";
import {
  Calendar,
  ChartLine,
  ChevronRight,
  Icon,
  LayoutDashboard,
  Rows,
  Settings,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

const SoccerPitch = () => <Icon iconNode={soccerPitch} />;

const items = [
  {
    title: "Dashboard",
    url: "/center/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Calendar",
    url: "/center/calendar",
    icon: Calendar,
  },
  {
    title: "Fields",
    url: "/center/fields",
    icon: SoccerPitch,
  },
  {
    title: "Price & Availability",
    url: "/center/price-availability",
    icon: Tag,
  },
  {
    title: "Bookings",
    url: "/center/bookings",
    icon: Rows,
  },
  {
    title: "Analytics",
    url: "/center/analytics",
    icon: ChartLine,
  },
  {
    title: "Settings",
    url: "/center/settings",
    icon: Settings,
    submenus: [
      { title: "General", url: "/center/settings/general", icon: Settings },
      { title: "Profile", url: "/center/settings/profile", icon: Settings },
      { title: "Appearance", url: "/center/settings/appearance", icon: Settings },
      { title: "Notifications", url: "/center/settings/notifications", icon: Settings },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { open } = useSidebar();
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const item of items) {
      if (!item.submenus) continue;
      next[item.title] = item.submenus.some((s) => pathname.startsWith(s.url));
    }
    setOpenGroups((prev) => ({ ...prev, ...next }));
  }, [pathname]);

  return (
    <Sidebar className="top-16" variant="inset" {...props} collapsible="icon">
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => {
            const isSubmenuActive = item.submenus?.some((submenu) =>
              pathname.startsWith(submenu.url),
            );
            const isActive = pathname === item.url || isSubmenuActive;

            if (item.submenus) {
              const isGroupOpen = Boolean(openGroups[item.title]);
              return (
                <div key={item.title}>
                  {!open ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                            <button type="button" className="flex w-full items-center gap-2">
                              <item.icon />
                              <span>{item.title}</span>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent className="w-56" side="right">
                        {item.submenus.map((sub) => (
                          <DropdownMenuItem
                            asChild
                            key={sub.url}
                            className={pathname === sub.url ? "bg-muted text-primary" : ""}
                          >
                            <Link href={sub.url}>
                              <span>{sub.title}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <SidebarMenuItem>
                      <Collapsible
                        open={isGroupOpen}
                        onOpenChange={(v) => setOpenGroups((p) => ({ ...p, [item.title]: v }))}
                      >
                        <CollapsibleTrigger asChild className="cursor-pointer">
                          <SidebarMenuButton
                            className="flex items-center justify-between w-full"
                            tooltip={item.title}
                            isActive={isActive}
                          >
                            <item.icon />
                            <span>{item.title}</span>
                            <ChevronRight
                              className={`ml-auto transition-transform duration-200 ${isGroupOpen ? "rotate-90" : ""}`}
                            />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                          <SidebarMenuSub>
                            {item.submenus.map((submenu) => {
                              const isSubmenuSelected = pathname === submenu.url;
                              return (
                                <SidebarMenuSubItem key={submenu.url}>
                                  <SidebarMenuSubButton asChild isActive={isSubmenuSelected}>
                                    <Link href={submenu.url} className="w-full">
                                      <item.icon />
                                      <span>{submenu.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuItem>
                  )}
                </div>
              );
            } else {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                    <Link href={`${item.url}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }
          })}
        </SidebarMenu>
      </SidebarContent>
      {/* <SidebarRail /> */}
    </Sidebar>
  );
}
