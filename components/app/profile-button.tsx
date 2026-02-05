"use client";

import { CreditCard, LogOut, Paintbrush, PlusCircle, Settings, User, Users } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Profile = {
  name: string;
  email: string;
  avatarUrl?: string;
  online?: boolean;
  role?: string;
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
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [resolvedProfile, setResolvedProfile] = React.useState<Profile>(profile);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        if (!user) return;

        const { data: profileRow } = await supabase
          .from("profiles")
          .select(
            `
            display_name,
            email,
            photo_url,
            role,
            centers:centers (
              name
            )
          `,
          )
          .eq("id", user.id)
          .single();

        if (!active) return;

        const centerName =
          typeof profileRow?.centers === "object" && profileRow?.centers
            ? (profileRow.centers as { name?: string | null }).name
            : null;

        setResolvedProfile({
          name: centerName || profileRow?.display_name || user.email || "User",
          email: profileRow?.email || user.email || "",
          avatarUrl: profileRow?.photo_url || "",
          online: true,
          role: profileRow?.role || (user.app_metadata?.role as string) || "user",
        });
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    if (onLogout) {
      onLogout();
      return;
    }
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full bg-card"
          aria-label="Open profile menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={resolvedProfile.avatarUrl || undefined} alt={resolvedProfile.name} />
            <AvatarFallback>{initials(resolvedProfile.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-80 p-0">
        <div className="flex items-center gap-3 p-4">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={resolvedProfile.avatarUrl || undefined}
              alt={resolvedProfile.name}
            />
            <AvatarFallback>{initials(resolvedProfile.name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">
              {loading ? "Loading..." : resolvedProfile.name}
            </div>
            <div className="truncate text-sm text-muted-foreground">
              {resolvedProfile.email}
            </div>
            {resolvedProfile.role ? (
              <div className="mt-1 text-xs uppercase text-muted-foreground">
                {resolvedProfile.role}
              </div>
            ) : null}
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
                setOpen(false);
                setConfirmOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </PopoverContent>
      </Popover>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              You will be signed out of your account on this device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false);
                void handleLogout();
              }}
            >
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
