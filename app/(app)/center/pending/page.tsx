// app/center/pending/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { redirect } from "next/navigation";
import PendingClient from "./_components/pending-page";

export default async function CenterPendingPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      display_name,
      role,
      center_id,
      is_active,
      centers:centers (
        id,
        name,
        status,
        created_at
      )
    `,
    )
    .eq("id", user.id)
    .single();

  if (error || !profile) redirect("/auth/login");

  // if already active, you might redirect them
  if (profile.is_active && profile.centers?.status === "active") {
    redirect("/center/dashboard");
  }

  return (
    <PendingClient
      userDisplayName={profile.display_name ?? "Center Admin"}
      centerName={profile.centers?.name ?? "Your Center"}
      createdAt={profile.centers?.created_at ?? null}
      centerStatus={
        (profile.centers?.status as "pending" | "active" | "rejected" | null) ?? "pending"
      }
      canEdit={true}
    />
  );
}
