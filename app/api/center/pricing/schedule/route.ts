import { NextResponse } from "next/server";
import { adminClient, getCenterIdFromBearerToken } from "@/lib/server/center-auth";

export async function GET(req: Request) {
  const centerId = await getCenterIdFromBearerToken(req);
  if (!centerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await adminClient
    .from("center_weekly_availability")
    .select("*")
    .eq("center_id", centerId)
    .order("day_of_week", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ schedule: data ?? [] });
}

export async function PUT(req: Request) {
  const centerId = await getCenterIdFromBearerToken(req);
  if (!centerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const dayOfWeek = Number(body?.dayOfWeek);
  const isOpen = Boolean(body?.isOpen);
  const slots = Array.isArray(body?.slots) ? body.slots : [];

  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    return NextResponse.json({ error: "Invalid dayOfWeek" }, { status: 400 });
  }

  const sanitizedSlots = slots
    .map((slot: any) => ({
      start: typeof slot?.start === "string" ? slot.start : "",
      end: typeof slot?.end === "string" ? slot.end : "",
    }))
    .filter((slot: any) => slot.start && slot.end);

  const { data, error } = await adminClient
    .from("center_weekly_availability")
    .upsert(
      {
        center_id: centerId,
        day_of_week: dayOfWeek,
        is_open: isOpen,
        slots: sanitizedSlots,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "center_id,day_of_week" },
    )
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ day: data });
}
