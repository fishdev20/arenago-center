"use client";

import { Bell, CheckCheck } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type NotificationType = "booking" | "system" | "payment";

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  read: boolean;
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "New booking request",
    message: "Court 1 • Today 18:00–19:00 • Minh Nguyen",
    time: "2m ago",
    type: "booking",
    read: false,
  },
  {
    id: "n2",
    title: "Maintenance scheduled",
    message: "Arena Court A • Tomorrow 09:00–12:00",
    time: "1h ago",
    type: "system",
    read: false,
  },
  {
    id: "n3",
    title: "Payment received",
    message: "€30.00 received for booking #BK-1024",
    time: "Yesterday",
    type: "payment",
    read: true,
  },
];

function dotColor(type: NotificationType) {
  if (type === "booking") return "bg-primary";
  if (type === "payment") return "bg-emerald-500";
  return "bg-muted-foreground";
}

export function NotificationButton() {
  const [items, setItems] = React.useState<Notification[]>(MOCK_NOTIFICATIONS);

  const unread = items.filter((n) => !n.read).length;

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
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
            disabled={unread === 0}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        </div>

        <Separator />

        {/* List */}
        <ScrollArea className="max-h-[60vh]">
          <div className="p-2 space-y-2">
            {items.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No notifications</div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markRead(n.id)}
                  className={[
                    "w-full rounded-md border p-3 text-left transition",
                    "hover:bg-muted/50",
                    !n.read ? "bg-background" : "opacity-80",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${dotColor(n.type)}`} />
                        <span className="truncate font-medium">{n.title}</span>
                        {!n.read && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            New
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">{n.message}</div>
                    </div>

                    <div className="shrink-0 text-xs text-muted-foreground">{n.time}</div>
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
