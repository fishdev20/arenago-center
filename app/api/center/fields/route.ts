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

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const centerId = await getCenterIdFromToken(token);
  if (!centerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await admin
    .from("center_fields")
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
    .eq("center_id", centerId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ fields: data });
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const centerId = await getCenterIdFromToken(token);
  if (!centerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = body?.name as string | undefined;
  const sportId = body?.sportId as string | undefined;
  const area = body?.area as string | undefined;
  const status = body?.status as string | undefined;
  const locationNote = body?.locationNote as string | undefined;
  const imageUrl = body?.imageUrl as string | undefined;

  if (!name || !sportId) {
    return NextResponse.json({ error: "Missing name or sport" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("center_fields")
    .insert({
      center_id: centerId,
      name,
      sport_id: sportId,
      area: area ?? "Outdoor",
      status: status ?? "active",
      location_note: locationNote ?? null,
      image_url: imageUrl ?? null,
    })
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
