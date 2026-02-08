"use client";

import { Bell, CheckCheck } from "lucide-react";
import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase/client";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/lib/query/use-notifications";
import type { AppNotification } from "@/lib/api/notifications";
import { queryKeys } from "@/lib/query/query-keys";

function dotColor(type: string) {
  if (type === "center_registration_approved") return "bg-emerald-500";
  if (type === "center_registration_rejected") return "bg-red-500";
  if (type === "center_registration_submitted") return "bg-primary";
  return "bg-muted-foreground";
}

export function NotificationButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading } = useNotifications();
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const items = data?.notifications ?? [];

  const unread = items.filter((n) => !n.read_at).length;

  function formatTime(n: AppNotification) {
    return formatDistanceToNow(new Date(n.created_at), { addSuffix: true });
  }

  async function markAllRead() {
    if (unread === 0) return;
    await markAll.mutateAsync();
  }

  async function markRead(id: string) {
    await markOne.mutateAsync(id);
  }

  function getRoute(n: AppNotification) {
    const route = n.payload?.route;
    return typeof route === "string" ? route : null;
  }

  React.useEffect(() => {
    let disposed = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (disposed || !user) return;

      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `recipient_user_id=eq.${user.id}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
          },
        )
        .subscribe();
    }

    void init();

    return () => {
      disposed = true;
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [queryClient]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <Badge className="absolute -right-1 -top-1 h-4 min-w-4 justify-center px-1">
              {unread > 9 ? "9+" : unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-90 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="font-medium">Notifications</div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={markAllRead}
            disabled={unread === 0 || markAll.isPending}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        </div>

        <Separator />

        {/* List */}
        <ScrollArea className="max-h-[60vh]">
          <div className="p-2 space-y-2">
            {isLoading ? (
              <div className="p-6 text-sm text-muted-foreground">Loading notifications...</div>
            ) : items.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No notifications</div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={async () => {
                    if (!n.read_at) await markRead(n.id);
                    const route = getRoute(n);
                    if (route) router.push(route);
                  }}
                  className={[
                    "w-full rounded-md border p-3 text-left transition",
                    "hover:bg-muted/50",
                    !n.read_at ? "bg-background" : "opacity-80",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${dotColor(n.type)}`} />
                        <span className="truncate font-medium">{n.title}</span>
                        {!n.read_at && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            New
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">{n.message}</div>
                    </div>

                    <div className="shrink-0 text-xs text-muted-foreground">{formatTime(n)}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-xs text-muted-foreground">Click an item to mark as read</span>
          <Button variant="ghost" size="sm">
            Settings
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
