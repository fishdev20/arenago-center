"use client";

import { Role } from "@/app/types/Auth";
import { SIDEBAR_ITEMS } from "@/components/app/common/app-sidebar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function SettingsTabs({ role }: { role: Role }) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs =
    SIDEBAR_ITEMS.find((item) => item.title === "Settings" && item.roles?.includes(role))
      ?.submenus ?? [];

  const activeTab =
    tabs.find((t) => pathname.startsWith(t.url))?.url ?? `/${role}/settings/general`;

  const activeLabel = tabs.find((t) => t.url === activeTab)?.title ?? "General";

  return (
    <>
      {/* SMALL: Select */}
      <div className="block sm:hidden">
        <Select value={activeTab} onValueChange={(v) => router.push(v)}>
          <SelectTrigger className="w-55">
            <SelectValue placeholder={activeLabel} />
          </SelectTrigger>
          <SelectContent>
            {tabs.map((t) => (
              <SelectItem key={t.url} value={t.url}>
                {t.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* MEDIUM: Horizontal tabs in scroll view */}
      <div className="hidden sm:block lg:hidden">
        <Tabs value={activeTab}>
          <ScrollArea className="w-full">
            <TabsList className="inline-flex h-auto w-max gap-1 bg-transparent p-0">
              {tabs.map(({ url, title, icon: Icon }) => (
                <TabsTrigger
                  key={url}
                  value={url}
                  asChild
                  className="gap-2 px-3 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Link href={url}>
                    <Icon className="h-4 w-4" />
                    {title}
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Tabs>
      </div>

      {/* LARGE: Vertical sidebar tabs */}
      <aside className="hidden lg:block lg:sticky lg:top-20 lg:w-60">
        <Tabs value={activeTab} orientation="vertical" className="w-full">
          <TabsList className="grid grid-cols-1 gap-1 p-0 w-full">
            {tabs.map(({ url, title, icon: Icon }) => (
              <TabsTrigger
                key={url}
                value={url}
                asChild
                className="justify-start gap-2 px-3 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <Link href={url}>
                  <Icon className="h-5 w-5" />
                  {title}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </aside>
    </>
  );
}
