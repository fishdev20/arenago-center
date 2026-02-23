import { NextResponse } from "next/server";
import { adminClient, getCenterIdFromBearerToken } from "@/lib/server/center-auth";

type Slot = { start: string; end: string };

function toIsoWithOffset(daysFromNow: number, time: string) {
  const now = new Date();
  const d = new Date(now);
  d.setDate(now.getDate() + daysFromNow);
  const [h, m] = time.split(":").map(Number);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toISOString();
}

export async function POST(req: Request) {
  const centerId = await getCenterIdFromBearerToken(req);
  if (!centerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: sports, error: sportsError } = await adminClient
    .from("sports")
    .select("id, name")
    .order("name", { ascending: true })
    .limit(3);

  if (sportsError || !sports || sports.length === 0) {
    return NextResponse.json(
      { error: "No sports found. Seed sports first." },
      { status: 400 },
    );
  }

  const { data: existingFields, error: fieldsError } = await adminClient
    .from("center_fields")
    .select("id, name")
    .eq("center_id", centerId)
    .order("created_at", { ascending: true });

  if (fieldsError) return NextResponse.json({ error: fieldsError.message }, { status: 400 });

  let fields = existingFields ?? [];
  if (fields.length === 0) {
    const sampleFields = [
      { name: "Badminton Court 1", sport_id: sports[0].id, area: "Indoor" },
      { name: "Badminton Court 2", sport_id: sports[0].id, area: "Indoor" },
      { name: "Training Court", sport_id: sports[Math.min(1, sports.length - 1)].id, area: "Indoor" },
    ];
    const { data: createdFields, error: createFieldsError } = await adminClient
      .from("center_fields")
      .insert(
        sampleFields.map((f) => ({
          center_id: centerId,
          name: f.name,
          sport_id: f.sport_id,
          area: f.area,
          status: "active",
        })),
      )
      .select("id, name");

    if (createFieldsError) {
      return NextResponse.json({ error: createFieldsError.message }, { status: 400 });
    }
    fields = createdFields ?? [];
  }

  await adminClient.from("center_availability_overrides").delete().eq("center_id", centerId);
  await adminClient.from("center_price_rules").delete().eq("center_id", centerId);
  await adminClient.from("center_weekly_availability").delete().eq("center_id", centerId);

  const weeklySlots: Record<number, { is_open: boolean; slots: Slot[] }> = {
    0: { is_open: false, slots: [] },
    1: { is_open: true, slots: [{ start: "08:00", end: "22:00" }] },
    2: { is_open: true, slots: [{ start: "08:00", end: "22:00" }] },
    3: { is_open: true, slots: [{ start: "08:00", end: "22:00" }] },
    4: { is_open: true, slots: [{ start: "08:00", end: "22:00" }] },
    5: { is_open: true, slots: [{ start: "08:00", end: "23:00" }] },
    6: { is_open: true, slots: [{ start: "09:00", end: "20:00" }] },
  };

  const scheduleRows = Array.from({ length: 7 }).map((_, day) => ({
    center_id: centerId,
    day_of_week: day,
    is_open: weeklySlots[day].is_open,
    slots: weeklySlots[day].slots,
  }));
  const { error: scheduleError } = await adminClient
    .from("center_weekly_availability")
    .insert(scheduleRows);

  if (scheduleError) return NextResponse.json({ error: scheduleError.message }, { status: 400 });

  const fieldIds = fields.map((f) => f.id);
  const premiumField = fieldIds[0] ?? null;
  const rules = [
    {
      center_id: centerId,
      name: "Standard Base",
      enabled: true,
      applies_to_all: true,
      applies_field_ids: [],
      day_scope: "Daily",
      time_start: "08:00",
      time_end: "22:00",
      price_per_hour: 40,
      priority: 100,
    },
    {
      center_id: centerId,
      name: "Weekday Morning Saver",
      enabled: true,
      applies_to_all: true,
      applies_field_ids: [],
      day_scope: "Weekdays",
      time_start: "08:00",
      time_end: "11:00",
      price_per_hour: 32,
      priority: 600,
    },
    {
      center_id: centerId,
      name: "Weekend Prime",
      enabled: true,
      applies_to_all: true,
      applies_field_ids: [],
      day_scope: "Weekend",
      time_start: "10:00",
      time_end: "20:00",
      price_per_hour: 55,
      priority: 800,
    },
    premiumField
      ? {
          center_id: centerId,
          name: "Premium Court Night",
          enabled: true,
          applies_to_all: false,
          applies_field_ids: [premiumField],
          day_scope: "Daily",
          time_start: "18:00",
          time_end: "22:00",
          price_per_hour: 65,
          priority: 900,
        }
      : null,
  ].filter(Boolean);

  const { error: rulesError } = await adminClient.from("center_price_rules").insert(rules);
  if (rulesError) return NextResponse.json({ error: rulesError.message }, { status: 400 });

  const overrides = [
    {
      center_id: centerId,
      scope: "center",
      field_id: null,
      status: "BLOCK",
      starts_at: toIsoWithOffset(2, "12:00"),
      ends_at: toIsoWithOffset(2, "14:00"),
      reason: "Deep cleaning",
    },
    {
      center_id: centerId,
      scope: premiumField ? "field" : "center",
      field_id: premiumField,
      status: "BLOCK",
      starts_at: toIsoWithOffset(4, "17:00"),
      ends_at: toIsoWithOffset(4, "19:00"),
      reason: "Court maintenance",
    },
    {
      center_id: centerId,
      scope: "center",
      field_id: null,
      status: "OPEN",
      starts_at: toIsoWithOffset(6, "10:00"),
      ends_at: toIsoWithOffset(6, "14:00"),
      reason: "Special holiday opening",
    },
  ];

  const { error: overridesError } = await adminClient
    .from("center_availability_overrides")
    .insert(overrides);
  if (overridesError) return NextResponse.json({ error: overridesError.message }, { status: 400 });

  return NextResponse.json({
    ok: true,
    summary: {
      fields: fields.length,
      rules: rules.length,
      scheduleDays: scheduleRows.length,
      overrides: overrides.length,
    },
  });
}
