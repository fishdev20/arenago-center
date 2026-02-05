export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getServerRole } from "@/lib/auth/get-server-role";
import { notFound, redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await getServerRole();
  console.log("admin", role);
  // not logged in → go login
  if (!user) redirect("/auth/login");

  // logged in but not admin/superadmin → either 404 or forbidden
  const allowed = role === "admin" || role === "superadmin";
  if (!allowed) {
    notFound();
  }

  return <>{children}</>;
}
