"use client";

import { CreditCard, LogOut, Paintbrush, PlusCircle, Settings, User, Users } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

type Profile = {
  name: string;
  email: string;
  avatarUrl?: string;
  online?: boolean;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

export function ProfileButton({
  profile = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatarUrl: "",
    online: true,
  },
  onLogout,
}: {
  profile?: Profile;
  onLogout?: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full bg-card"
          aria-label="Open profile menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatarUrl || undefined} alt={profile.name} />
            <AvatarFallback>{initials(profile.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-80 p-0">
        <div className="flex items-center gap-3 p-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatarUrl || undefined} alt={profile.name} />
            <AvatarFallback>{initials(profile.name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{profile.name}</div>
            <div className="truncate text-sm text-muted-foreground">{profile.email}</div>
          </div>
        </div>

        <Separator />

        <div className="p-2">
          <MenuItem
            icon={<User className="h-4 w-4" />}
            label="My account"
            onSelect={() => setOpen(false)}
          />
          <MenuItem
            icon={<Settings className="h-4 w-4" />}
            label="Settings"
            onSelect={() => setOpen(false)}
          />
          <MenuItem
            icon={<CreditCard className="h-4 w-4" />}
            label="Billing"
            onSelect={() => setOpen(false)}
          />
        </div>

        <Separator />

        <div className="p-2">
          <MenuItem
            icon={<Users className="h-4 w-4" />}
            label="Manage team"
            onSelect={() => setOpen(false)}
          />
          <MenuItem
            icon={<Paintbrush className="h-4 w-4" />}
            label="Customization"
            onSelect={() => setOpen(false)}
          />
          <MenuItem
            icon={<PlusCircle className="h-4 w-4" />}
            label="Add team account"
            onSelect={() => setOpen(false)}
          />
        </div>

        <Separator />

        <div className="p-2">
          <button
            type="button"
            onClick={() => {
              onLogout?.();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MenuItem({
  icon,
  label,
  onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-muted"
    >
      <span className="text-muted-foreground">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
