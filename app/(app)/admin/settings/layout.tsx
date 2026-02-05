import SettingsLayout from "@/components/app/common/settings-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SettingsLayout>{children}</SettingsLayout>;
}
