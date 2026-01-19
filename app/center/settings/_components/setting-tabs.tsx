"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CreditCard, User, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const TABS = [
  { href: "/center/settings/general", label: "General", icon: Wrench },
  { href: "/center/settings/profile", label: "Profile", icon: User },
  { href: "/center/settings/appearance", label: "Appearance", icon: CreditCard },
  { href: "/center/settings/notifications", label: "Notifications", icon: Bell },
];

export default function SettingsTabs() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab =
    TABS.find((t) => pathname.startsWith(t.href))?.href ?? "/center/settings/general";

  const activeLabel = TABS.find((t) => t.href === activeTab)?.label ?? "General";

  return (
    <>
      {/* SMALL: Select */}
      <div className="block sm:hidden">
        <Select value={activeTab} onValueChange={(v) => router.push(v)}>
          <SelectTrigger className="w-55">
            <SelectValue placeholder={activeLabel} />
          </SelectTrigger>
          <SelectContent>
            {TABS.map((t) => (
              <SelectItem key={t.href} value={t.href}>
                {t.label}
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
              {TABS.map(({ href, label, icon: Icon }) => (
                <TabsTrigger
                  key={href}
                  value={href}
                  asChild
                  className="gap-2 data-[state=active]:bg-muted px-3 py-2"
                >
                  <Link href={href}>
                    <Icon className="h-4 w-4" />
                    {label}
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
          <TabsList className="grid grid-cols-1 gap-1 bg-transparent p-0">
            {TABS.map(({ href, label, icon: Icon }) => (
              <TabsTrigger
                key={href}
                value={href}
                asChild
                className="justify-start gap-2 data-[state=active]:bg-muted px-3 py-2"
              >
                <Link href={href}>
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </aside>
    </>
  );
}
