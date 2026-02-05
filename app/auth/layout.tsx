import { ThemeButton } from "@/components/app/theme-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Volleyball } from "lucide-react";
import Image from "next/image";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-full bg-background">
      <div className="flex h-full justify-center">
        <div className="lg:grid lg:grid-cols-2 w-full max-w-480 h-full">
          <ScrollArea className="h-screen py-6">
            <div className="h-full w-full px-4 py-8 sm:px-6 md:px-8 lg:py-0">
              <div className="flex items-center justify-between pb-6">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Volleyball className="h-4 w-4" />
                  <span>ARENA GO</span>
                </div>
                <ThemeButton />
              </div>
              <div className="flex min-h-[calc(100%-40px)] items-center justify-center">
                {children}
              </div>
            </div>
          </ScrollArea>
          {/* Left panel */}
          <div className="bg-muted h-screen p-5 max-lg:hidden">
            <div className="relative flex h-full flex-col justify-between gap-6 rounded-xl bg-primary py-8 text-card-foreground shadow-sm text-sm lg:text-base">
              <div className="grid gap-6 px-8">
                <p className="text-2xl font-bold text-primary-foreground lg:text-4xl">
                  Run your sports center in one place.
                </p>
                <p className="text-base text-primary-foreground lg:text-xl">
                  Manage bookings, courts, staff, and customer payments with a single, easy-to-use
                  dashboard.
                </p>
              </div>

              {/* Card-like content */}
              <div
                data-slot="card-content"
                className="relative z-1 mx-8 h-62 overflow-hidden rounded-2xl px-0"
              >
                <svg
                  width="1094"
                  height="249"
                  viewBox="0 0 1094 249"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="pointer-events-none absolute right-0 -z-1 select-none"
                  aria-hidden="true"
                >
                  <path
                    d="M0.263672 16.8809C0.263672 8.0443 7.42712 0.880859 16.2637 0.880859H786.394H999.115C1012.37 0.880859 1023.12 11.626 1023.12 24.8808L1023.12 47.3809C1023.12 60.6357 1033.86 71.3809 1047.12 71.3809H1069.6C1082.85 71.3809 1093.6 82.126 1093.6 95.3809L1093.6 232.881C1093.6 241.717 1086.43 248.881 1077.6 248.881H16.2637C7.42716 248.881 0.263672 241.717 0.263672 232.881V16.8809Z"
                    fill="var(--card)"
                  />
                </svg>

                <div className="bg-card absolute top-0 right-0 flex size-15 items-center justify-center rounded-2xl">
                  <Volleyball className="size-6 transition-transform duration-700 hover:rotate-180" />
                </div>

                <div className="flex flex-col gap-5 p-6">
                  <p className="line-clamp-2 pr-12 text-2xl font-bold lg:text-3xl">
                    Accept bookings, reduce no-shows, and fill your calendar.
                  </p>
                  <p className="line-clamp-2 text-sm lg:text-lg">
                    Give customers a smooth booking experience while keeping your operations
                    organized.
                  </p>

                  <div className="flex -space-x-4 self-end">
                    <span
                      data-slot="avatar"
                      className="relative flex size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-background"
                    >
                      <Image
                        data-slot="avatar-image"
                        className="aspect-square size-full"
                        alt="Olivia Sparks"
                        src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png"
                        width={48}
                        height={48}
                      />
                    </span>

                    <span
                      data-slot="avatar"
                      className="relative flex size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-background"
                    >
                      <Image
                        data-slot="avatar-image"
                        className="aspect-square size-full"
                        alt="Howard Lloyd"
                        src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png"
                        width={48}
                        height={48}
                      />
                    </span>

                    <span
                      data-slot="avatar"
                      className="relative flex size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-background"
                    >
                      <Image
                        data-slot="avatar-image"
                        className="aspect-square size-full"
                        alt="Hallie Richards"
                        src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png"
                        width={48}
                        height={48}
                      />
                    </span>

                    <span
                      data-slot="avatar"
                      className="relative flex size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-background"
                    >
                      <span
                        data-slot="avatar-fallback"
                        className="bg-muted flex size-full items-center justify-center rounded-full text-xs"
                      >
                        +3695
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
