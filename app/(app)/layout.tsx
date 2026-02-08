import { AppSidebar } from "@/components/app/common/app-sidebar";
import { NavigationMenu } from "@/components/app/common/nav-menu";
import { RouteSearch } from "@/components/app/common/route-search";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getServerRole } from "@/lib/auth/get-server-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

export default async function CenterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const { user, role } = await getServerRole();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      `
    role,
    center_id,
    is_active,
    centers:centers (
      status
    )
  `,
    )
    .eq("id", user?.id)
    .single();

  if (!user) redirect("/auth/login");
  if (!role) notFound();
  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <SidebarInset className="bg-muted relative">
        <ScrollArea className="h-[calc(100svh-(32px))] rounded-md relative">
          <header className="sticky top-0 flex h-16 shrink-0 items-center justify-between gap-2 px-4 bg-muted/60 backdrop-blur-sm z-12 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-16 border-b">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
              <RouteSearch role={role} className="" />
            </div>
            <div className="items-center gap-2 flex">
              <NavigationMenu />
            </div>
          </header>

          <div className="p-4">
            <Suspense fallback={<>Loading...</>}>{children}</Suspense>
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
