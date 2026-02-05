import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function getCenterIdFromToken(token: string) {
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return null;

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("center_id, role")
    .eq("id", authData.user.id)
    .single();

  if (profileError || profile?.role !== "center" || !profile.center_id) return null;
  return profile.center_id;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const centerId = await getCenterIdFromToken(token);
  if (!centerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const isActive = body?.isActive as boolean | undefined;
  if (typeof isActive !== "boolean") {
    return NextResponse.json({ error: "isActive is required" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("center_amenities")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("center_id", centerId)
    .select("id,name,slug,icon,is_active,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ amenity: data });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const centerId = await getCenterIdFromToken(token);
  if (!centerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { error } = await admin
    .from("center_amenities")
    .delete()
    .eq("id", id)
    .eq("center_id", centerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
