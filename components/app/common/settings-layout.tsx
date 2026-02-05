import SettingsTabs from "@/components/app/common/setting-tabs";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase.auth.getSession();
  const role = data.session?.user.app_metadata.role;

  if (!role) {
    throw new Error("User role is missing");
  }
  return (
    <div className=" flex items-center justify-center">
      <div className="relative flex flex-1 flex-col space-y-8 md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12 max-w-7xl">
        <SettingsTabs role={role} />
        <div className="w-full bg-card p-4 rounded-xl border shadow-sm">{children}</div>
      </div>
    </div>
  );
}
