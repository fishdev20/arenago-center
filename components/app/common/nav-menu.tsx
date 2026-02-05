import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "../language-switcher";
import { NotificationButton } from "../notification-button";
import { ProfileButton } from "../profile-button";
import { ThemeButton } from "../theme-button";

export function NavigationMenu() {
  return (
    <div className="flex items-end justify-end w-full">
      <div className="flex items-center gap-2 ml-auto">
        <LanguageSwitcher />
        <NotificationButton />
        <ThemeButton />
        <Separator
          orientation="vertical"
          className="bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px mx-2 data-[orientation=vertical]:h-4"
        />
        <ProfileButton />
      </div>
    </div>
  );
}
