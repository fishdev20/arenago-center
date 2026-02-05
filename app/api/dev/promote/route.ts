import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only
);

export async function POST(req: Request) {
  const { userId, role } = await req.json();

  if (!userId || !role) {
    return NextResponse.json({ error: "Missing userId or role" }, { status: 400 });
  }
  if (!["admin", "superadmin", "center", "user"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Set JWT role (app_metadata)
  const { error: authErr } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role },
  });
  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 });

  // Optional: keep profiles.role in sync (for UI)
  const { error: profErr } = await admin.from("profiles").update({ role }).eq("id", userId);
  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
