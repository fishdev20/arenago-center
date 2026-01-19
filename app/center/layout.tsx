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
        <div className="flex h-12 w-full max-w-12 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xl">
          AG
        </div>
        <h1 className="text-2xl font-bold hidden md:block">ARENAGO</h1>
        <NavigationMenuDemo />
      </header>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="h-full peer-data-[variant=inset]:min-h-[calc(100svh-(--spacing(4))-4rem)]">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-2 md:px-8 w-full">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
            <div className="items-center gap-2 hidden md:flex">
              <Suspense fallback={null}>{topbar}</Suspense>
            </div>
          </header>
          <ScrollArea className="h-[calc(100svh-(--spacing(4))-(4rem*2))]">
            <div className="p-2 md:p-8">
              <Suspense fallback={<>Loading...</>}>{children}</Suspense>
            </div>
          </ScrollArea>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
