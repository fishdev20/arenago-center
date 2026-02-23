import { NextResponse } from "next/server";
import { adminClient, getCenterIdFromBearerToken } from "@/lib/server/center-auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const centerId = await getCenterIdFromBearerToken(req);
  if (!centerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing rule id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
  if (typeof body.enabled === "boolean") updates.enabled = body.enabled;
  if (body.appliesTo === "all") {
    updates.applies_to_all = true;
    updates.applies_field_ids = [];
  } else if (Array.isArray(body.appliesTo)) {
    updates.applies_to_all = false;
    updates.applies_field_ids = body.appliesTo;
  }
  if (typeof body.days === "string") updates.day_scope = body.days;
  if (typeof body.timeStart === "string") updates.time_start = body.timeStart;
  if (typeof body.timeEnd === "string") updates.time_end = body.timeEnd;
  if (body.pricePerHour !== undefined) updates.price_per_hour = Number(body.pricePerHour);
  if (body.priority !== undefined) updates.priority = Number(body.priority);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await adminClient
    .from("center_price_rules")
    .update(updates)
    .eq("id", id)
    .eq("center_id", centerId)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ rule: data });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const centerId = await getCenterIdFromBearerToken(req);
  if (!centerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing rule id" }, { status: 400 });

  const { error } = await adminClient
    .from("center_price_rules")
    .delete()
    .eq("id", id)
    .eq("center_id", centerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
