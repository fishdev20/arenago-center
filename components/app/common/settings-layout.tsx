import SettingsTabs from "@/components/app/common/setting-tabs";
import { getServerRole } from "@/lib/auth/get-server-role";
import { redirect } from "next/navigation";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await getServerRole();
  if (!user) redirect("/auth/login");
  return (
    <div className="flex items-center justify-center">
      <div className="relative flex flex-1 flex-col space-y-8 md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12 max-w-7xl">
        <SettingsTabs role={role ?? "user"} />
        <div className="w-full bg-card p-4 rounded-xl border shadow-sm">{children}</div>
      </div>
    </div>
  );
}
