import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const centerId = await getCenterIdFromToken(token);
  if (!centerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await admin
    .from("center_amenities")
    .select("id,name,slug,icon,is_active,created_at")
    .eq("center_id", centerId)
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ amenities: data });
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const centerId = await getCenterIdFromToken(token);
  if (!centerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = body?.name as string | undefined;
  const icon = (body?.icon as string | undefined) ?? null;

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const slug = toSlug(name);
  if (!slug) return NextResponse.json({ error: "Invalid amenity name" }, { status: 400 });

  const { data, error } = await admin
    .from("center_amenities")
    .insert({
      center_id: centerId,
      name: name.trim(),
      slug,
      icon,
    })
    .select("id,name,slug,icon,is_active,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ amenity: data });
}
