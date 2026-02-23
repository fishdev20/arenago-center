import { NextResponse } from "next/server";
import { adminClient, getCenterIdFromBearerToken } from "@/lib/server/center-auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const centerId = await getCenterIdFromBearerToken(req);
  if (!centerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing override id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (body.scope === "center" || body.scope === "field") updates.scope = body.scope;
  if (body.status === "BLOCK" || body.status === "OPEN") updates.status = body.status;
  if (body.fieldId !== undefined) updates.field_id = body.fieldId;
  if (body.startsAt !== undefined) updates.starts_at = body.startsAt;
  if (body.endsAt !== undefined) updates.ends_at = body.endsAt;
  if (typeof body.reason === "string") updates.reason = body.reason.trim() || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await adminClient
    .from("center_availability_overrides")
    .update(updates)
    .eq("id", id)
    .eq("center_id", centerId)
    .select("*, field:center_fields(id,name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ override: data });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const centerId = await getCenterIdFromBearerToken(req);
  if (!centerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing override id" }, { status: 400 });

  const { error } = await adminClient
    .from("center_availability_overrides")
    .delete()
    .eq("id", id)
    .eq("center_id", centerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
