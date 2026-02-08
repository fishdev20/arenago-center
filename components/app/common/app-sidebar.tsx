"use client";
import { Role } from "@/app/types/Auth";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
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
  Activity,
  Bell,
  BookOpen,
  Bot,
  Calendar,
  ChartLine,
  ChevronRight,
  Icon,
  LayoutDashboard,
  Palette,
  Rows,
  Settings,
  Settings2,
  Shield,
  SquareTerminal,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

type SidebarItemType = {
  title: string;
  url: string;
  icon: any;
  roles?: Role[];
  submenus?: { title: string; url: string; icon: any }[];
};

const SoccerPitch = () => <Icon iconNode={soccerPitch} />;

export const SIDEBAR_ITEMS: SidebarItemType[] = [
  // ===== CENTER (UNCHANGED ROUTES) =====
  { title: "Dashboard", url: "/center/dashboard", icon: LayoutDashboard, roles: ["center"] },
  { title: "Calendar", url: "/center/calendar", icon: Calendar, roles: ["center"] },
  { title: "Fields", url: "/center/fields", icon: SoccerPitch, roles: ["center"] },
  {
    title: "Price & Availability",
    url: "/center/price-availability",
    icon: Tag,
    roles: ["center"],
  },
  { title: "Bookings", url: "/center/bookings", icon: Rows, roles: ["center"] },
  { title: "Analytics", url: "/center/analytics", icon: ChartLine, roles: ["center"] },
  {
    title: "Settings",
    url: "/center/settings",
    icon: Settings,
    roles: ["center"],
    submenus: [
      { title: "General", url: "/center/settings/general", icon: Settings },
      { title: "Profile", url: "/center/settings/profile", icon: User },
      { title: "Appearance", url: "/center/settings/appearance", icon: Palette },
      { title: "Amenities", url: "/center/settings/amenities", icon: Sparkles },
      { title: "Notifications", url: "/center/settings/notifications", icon: Bell },
    ],
  },

  // ===== ADMIN (NEW ROUTES) =====
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "superadmin"],
  },
  { title: "Centers", url: "/admin/centers", icon: Rows, roles: ["admin", "superadmin"] },
  { title: "Users", url: "/admin/users", icon: Rows, roles: ["admin", "superadmin"] },
  { title: "Analytics", url: "/admin/analytics", icon: ChartLine, roles: ["admin", "superadmin"] },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
    roles: ["admin", "superadmin"],
    submenus: [
      { title: "General", url: "/admin/settings/general", icon: Settings },
      { title: "Profile", url: "/admin/settings/profile", icon: User },
      { title: "Security", url: "/admin/settings/security", icon: Shield },
      { title: "Notifications", url: "/admin/settings/notifications", icon: Bell },
      { title: "Activity", url: "/admin/settings/activity", icon: Activity },
    ],
  },

  // ===== SUPERADMIN (NEW ROUTES, SUPERADMIN ONLY) =====
  { title: "Platform", url: "/superadmin/platform", icon: LayoutDashboard, roles: ["superadmin"] },
  { title: "Feature Flags", url: "/superadmin/feature-flags", icon: Tag, roles: ["superadmin"] },
  { title: "System Logs", url: "/superadmin/system-logs", icon: Rows, roles: ["superadmin"] },
  {
    title: "System Settings",
    url: "/superadmin/settings",
    icon: Settings,
    roles: ["superadmin"],
    submenus: [
      { title: "Integrations", url: "/superadmin/settings/integrations", icon: Settings2 },
      { title: "Jobs", url: "/superadmin/settings/jobs", icon: Activity },
      { title: "Security", url: "/superadmin/settings/security", icon: Shield },
    ],
  },
];

function filterItemsByRole(items: SidebarItemType[], role: Role) {
  return items
    .filter((i) => !i.roles || i.roles.includes(role))
    .map((i) => {
      if (!i.submenus) return i;
      // (optional) if you later add roles per submenu, you can filter here too
      return i;
    });
}

export function AppSidebar({
  role,
  ...props
}: React.ComponentProps<typeof Sidebar> & { role: Role }) {
  const pathname = usePathname();
  const { open } = useSidebar();
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});

  const items = React.useMemo(() => filterItemsByRole(SIDEBAR_ITEMS, role), [role]);

  React.useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const item of items) {
      if (!item.submenus) continue;

      const itemKey = item.url;
      next[itemKey] = item.submenus.some((s) => pathname.startsWith(s.url));
    }
    setOpenGroups((prev) => ({ ...prev, ...next }));
  }, [pathname, items]);

  const tests = [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ];

  return (
    <Sidebar {...props} collapsible="icon" className="bg-background">
      <SidebarHeader className="bg-muted h-16 border-b px-3 flex items-center transition-all duration-200 ease-linear group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="cursor-pointer
      hover:bg-transparent
      hover:text-inherit
      active:bg-transparent
      focus-visible:ring-0
      transition-all duration-200 ease-linear
      group-data-[collapsible=icon]:justify-center"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"></div>
              <div className="grid flex-1 text-left text-lg leading-tight transition-all duration-200 ease-linear group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:opacity-0">
                <span className="truncate text-xl font-semibold uppercase">Arena Go</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-muted">
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => {
              const itemKey = item.url;
              const isSubmenuActive = item.submenus?.some((submenu) =>
                pathname.startsWith(submenu.url),
              );
              const isActive = pathname === item.url || isSubmenuActive;

              if (item.submenus) {
                const isGroupOpen = Boolean(openGroups[itemKey]);
                return (
                  <Collapsible
                    key={itemKey}
                    asChild
                    defaultOpen={isActive}
                    className="group/collapsible"
                  >
                    {!open ? (
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            isActive={isActive}
                            className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                          >
                            <item.icon />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.submenus.map((sub) => (
                              <SidebarMenuItem
                                key={sub.url}
                                className={pathname === sub.url ? "bg-muted text-primary" : ""}
                              >
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === sub.url}
                                  className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                                >
                                  <Link href={sub.url}>
                                    <span>{sub.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    ) : (
                      <SidebarMenuItem>
                        <Collapsible
                          open={isGroupOpen}
                          onOpenChange={(v) => setOpenGroups((p) => ({ ...p, [itemKey]: v }))}
                        >
                          <CollapsibleTrigger asChild className="cursor-pointer">
                            <SidebarMenuButton
                              tooltip={item.title}
                              isActive={isActive}
                              className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
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
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={isSubmenuSelected}
                                      className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                                    >
                                      <Link href={submenu.url} className="w-full">
                                        <submenu.icon />
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
                  </Collapsible>
                );
              }

              return (
                <SidebarMenuItem key={itemKey}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive}
                    disabled
                    className="flex data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                    asChild
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
