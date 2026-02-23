import { NextResponse } from "next/server";
import { adminClient, getCenterIdFromBearerToken } from "@/lib/server/center-auth";

export async function GET(req: Request) {
  const centerId = await getCenterIdFromBearerToken(req);
  if (!centerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await adminClient
    .from("center_availability_overrides")
    .select("*, field:center_fields(id,name)")
    .eq("center_id", centerId)
    .order("starts_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ overrides: data ?? [] });
}

export async function POST(req: Request) {
  const centerId = await getCenterIdFromBearerToken(req);
  if (!centerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const scope = body?.scope === "field" ? "field" : "center";
  const fieldId = scope === "field" ? (body?.fieldId ?? null) : null;
  const status = body?.status === "OPEN" ? "OPEN" : "BLOCK";
  const startsAt = body?.startsAt;
  const endsAt = body?.endsAt;
  const reason = typeof body?.reason === "string" ? body.reason.trim() : null;

  if (!startsAt || !endsAt) {
    return NextResponse.json({ error: "startsAt and endsAt are required" }, { status: 400 });
  }

  const { data, error } = await adminClient
    .from("center_availability_overrides")
    .insert({
      center_id: centerId,
      scope,
      field_id: fieldId,
      status,
      starts_at: startsAt,
      ends_at: endsAt,
      reason,
    })
    .select("*, field:center_fields(id,name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ override: data });
}
