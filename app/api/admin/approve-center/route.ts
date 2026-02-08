import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { notifyCenterRegistrationReviewed } from "@/lib/server/notifications";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function isAdmin(token: string) {
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return false;
  const role = authData.user.app_metadata?.role;
  return role === "admin" || role === "superadmin";
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!token || !(await isAdmin(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { centerId, action } = await req.json();

  if (!centerId || !action) {
    return NextResponse.json({ error: "Missing centerId or action" }, { status: 400 });
  }

  const status = action === "approve" ? "active" : action === "reject" ? "rejected" : null;
  if (!status) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("centers")
    .update({ status })
    .eq("id", centerId)
    .select("id,status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (status === "active" || status === "rejected") {
    try {
      await notifyCenterRegistrationReviewed(admin, {
        centerId,
        status,
      });
    } catch (notifyError) {
      console.error("[admin/approve-center] failed to notify center", notifyError);
    }
  }

  return NextResponse.json({ ok: true, center: data });
}
