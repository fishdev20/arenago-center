import { AppSidebar } from "@/components/app/center/app-sidebar";
import { NavigationMenuDemo } from "@/components/app/center/nav-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Suspense } from "react";

export default function CenterLayout({
  children,
  topbar,
}: Readonly<{
  children: React.ReactNode;
  topbar: React.ReactNode;
}>) {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xl">
          SC
        </div>
        <NavigationMenuDemo />
      </header>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="h-full peer-data-[variant=inset]:min-h-[calc(100svh-(--spacing(4))-4rem)]">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 w-full">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <Suspense fallback={null}>{topbar}</Suspense>
            </div>
          </header>
          <ScrollArea className="h-[calc(100svh-(--spacing(4))-(4rem*2))]">
            <div className="p-2">
              <Suspense fallback={<>Loading...</>}>{children}</Suspense>
            </div>
          </ScrollArea>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
