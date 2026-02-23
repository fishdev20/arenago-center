import { NextResponse } from "next/server";
import { adminClient, getCenterIdFromBearerToken } from "@/lib/server/center-auth";

export async function GET(req: Request) {
  const centerId = await getCenterIdFromBearerToken(req);
  if (!centerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await adminClient
    .from("center_price_rules")
    .select("*")
    .eq("center_id", centerId)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ rules: data ?? [] });
}

export async function POST(req: Request) {
  const centerId = await getCenterIdFromBearerToken(req);
  if (!centerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" && body.name.trim() ? body.name.trim() : null;
  if (!name) return NextResponse.json({ error: "Rule name is required" }, { status: 400 });

  const { data, error } = await adminClient
    .from("center_price_rules")
    .insert({
      center_id: centerId,
      name,
      enabled: Boolean(body?.enabled ?? true),
      applies_to_all: body?.appliesTo === "all",
      applies_field_ids: Array.isArray(body?.appliesTo) ? body.appliesTo : [],
      day_scope: body?.days ?? "Daily",
      time_start: body?.timeStart ?? "00:00",
      time_end: body?.timeEnd ?? "23:59",
      price_per_hour: Number(body?.pricePerHour ?? 0),
      priority: Number(body?.priority ?? 100),
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ rule: data });
}
