import { Role } from "@/app/types/Auth";
import { createSupabaseServerClient } from "../supabase/server";

export async function getServerRole() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = (user?.app_metadata?.role as Role | undefined) ?? null;
  return { user, role };
}
