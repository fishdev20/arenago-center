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
  ChevronUp,
  Dot,
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
  // {
  //   title: "Notes",
  //   url: "", // We'll detect activity via submenus
  //   icon: SquarePen,
  //   submenus: [
  //     {
  //       title: "All Notes",
  //       url: "/center/notes",
  //     },
  //     {
  //       title: "New Note",
  //       url: "/center/notes/new",
  //     },
  //   ],
  // },
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
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { open } = useSidebar();
  const [isNotesOpen, setIsNotesOpen] = React.useState(pathname.startsWith("/notes"));

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
              return (
                <div key={item.title}>
                  {!open ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild
                            tooltip={item.title}
                            isActive={isActive}
                            className="text-lg"
                          >
                            <Link href={`${item.url}`}>
                              <item.icon size={32} />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" side="right">
                        {item.submenus.map((sub) => {
                          return (
                            <DropdownMenuItem
                              asChild
                              key={sub.url}
                              className={pathname === sub.url ? "bg-muted text-primary" : ""}
                            >
                              <Link href={`${sub.url}`}>
                                <span>{sub.title}</span>
                              </Link>
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <SidebarMenuItem key={item.title}>
                      <Collapsible open={isNotesOpen} onOpenChange={setIsNotesOpen}>
                        <CollapsibleTrigger asChild className="cursor-pointer">
                          <SidebarMenuButton
                            className="flex items-center justify-between w-full text-lg"
                            tooltip={item.title}
                            isActive={isActive}
                          >
                            <item.icon size={32} />
                            <span>{item.title}</span>
                            <ChevronUp
                              size={32}
                              className={`ml-auto transition-transform duration-200 ${
                                isNotesOpen ? "rotate-180" : ""
                              }`}
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
                                    className="text-base"
                                  >
                                    <Link href={submenu.url} className="w-full">
                                      <span>
                                        <Dot size={32} />
                                      </span>
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
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive}
                    // className="text-lg"
                  >
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
