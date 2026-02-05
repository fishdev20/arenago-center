import { supabase } from "@/lib/supabase/client";

export async function getAuthToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
