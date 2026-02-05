export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getServerRole } from "@/lib/auth/get-server-role";
import { notFound, redirect } from "next/navigation";

export default async function CenterLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await getServerRole();

  if (!user && !role) redirect("/auth/login");

  // Only center can access center routes
  if (role !== "center") {
    notFound();
  }

  return <>{children}</>;
}
