import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const centerId = await getCenterIdFromToken(token);
  if (!centerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing field id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const updates: Record<string, unknown> = {};

  if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
  if (typeof body.sportId === "string" && body.sportId.trim()) updates.sport_id = body.sportId.trim();
  if (body.area === "Indoor" || body.area === "Outdoor") updates.area = body.area;
  if (body.status === "active" || body.status === "maintenance") updates.status = body.status;
  if (typeof body.locationNote === "string") updates.location_note = body.locationNote.trim() || null;
  if (typeof body.imageUrl === "string") updates.image_url = body.imageUrl.trim() || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("center_fields")
    .update(updates)
    .eq("id", id)
    .eq("center_id", centerId)
    .select(
      `
      id,
      name,
      area,
      status,
      location_note,
      image_url,
      created_at,
      sport:sports (
        id,
        name,
        slug
      )
    `,
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ field: data });
}
