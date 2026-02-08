import { Role } from "@/app/types/Auth";
import { createSupabaseServerClient } from "../supabase/server";

export async function getServerRole() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, role: null };

  const jwtRole = user.app_metadata?.role as Role | undefined;
  if (jwtRole) return { user, role: jwtRole };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, center_id")
    .eq("id", user.id)
    .single();

  if (profile?.role) return { user, role: profile.role as Role };
  if (profile?.center_id) return { user, role: "center" as Role };

  return { user, role: "user" as Role };
}
