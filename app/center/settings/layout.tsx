import SettingsTabs from "./_components/setting-tabs";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col space-y-8 md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12">
      <SettingsTabs />
      <div className="w-full">{children}</div>
    </div>
  );
}
