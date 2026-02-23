import { NextResponse } from "next/server";
import { adminClient, getCenterIdFromBearerToken } from "@/lib/server/center-auth";

type RuleRow = {
  id: string;
  name: string;
  enabled: boolean;
  applies_to_all: boolean;
  applies_field_ids: string[];
  day_scope: "Daily" | "Weekdays" | "Weekend" | "Specific dates";
  time_start: string;
  time_end: string;
  price_per_hour: number;
  priority: number;
};

type WeeklyDayRow = {
  day_of_week: number;
  is_open: boolean;
  slots: { start: string; end: string }[];
};

type OverrideRow = {
  scope: "center" | "field";
  field_id: string | null;
  status: "BLOCK" | "OPEN";
  starts_at: string;
  ends_at: string;
};

function toMinutes(value: string) {
  const [h, m] = value.slice(0, 5).split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

function inDayScope(date: Date, scope: RuleRow["day_scope"]) {
  const d = date.getDay();
  if (scope === "Daily") return true;
  if (scope === "Weekdays") return d >= 1 && d <= 5;
  if (scope === "Weekend") return d === 0 || d === 6;
  return true;
}

function parseDateInput(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function toSlotDate(base: Date, time: string) {
  const d = new Date(base);
  const [h, m] = time.slice(0, 5).split(":").map(Number);
  d.setHours(Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0, 0, 0);
  return d;
}

export async function POST(req: Request) {
  const centerId = await getCenterIdFromBearerToken(req);
  if (!centerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const fieldId = typeof body?.fieldId === "string" ? body.fieldId : "";
  const dateStr = typeof body?.date === "string" ? body.date : "";
  const startTime = typeof body?.startTime === "string" ? body.startTime : "";
  const endTime = typeof body?.endTime === "string" ? body.endTime : "";

  if (!fieldId || !dateStr || !startTime || !endTime) {
    return NextResponse.json({ error: "Missing quote inputs" }, { status: 400 });
  }

  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);
  if (endMinutes <= startMinutes) {
    return NextResponse.json({ error: "Invalid time range" }, { status: 400 });
  }

  const quoteDate = parseDateInput(dateStr);
  if (!quoteDate) {
    return NextResponse.json({ error: "Invalid date input" }, { status: 400 });
  }
  const slotStartAt = toSlotDate(quoteDate, startTime);
  const slotEndAt = toSlotDate(quoteDate, endTime);

  const [{ data: weekly, error: weeklyError }, { data: overrides, error: overridesError }] =
    await Promise.all([
      adminClient
        .from("center_weekly_availability")
        .select("day_of_week, is_open, slots")
        .eq("center_id", centerId)
        .eq("day_of_week", quoteDate.getDay())
        .maybeSingle(),
      adminClient
        .from("center_availability_overrides")
        .select("scope, field_id, status, starts_at, ends_at")
        .eq("center_id", centerId),
    ]);

  if (weeklyError) return NextResponse.json({ error: weeklyError.message }, { status: 400 });
  if (overridesError) return NextResponse.json({ error: overridesError.message }, { status: 400 });

  const dayRow = weekly as WeeklyDayRow | null;
  const daySlots = Array.isArray(dayRow?.slots) ? dayRow!.slots : [];
  const insideWeeklySlot = daySlots.some((slot) => {
    const s = toMinutes(slot.start);
    const e = toMinutes(slot.end);
    return startMinutes >= s && endMinutes <= e;
  });
  const weeklyOpen = Boolean(dayRow?.is_open) && insideWeeklySlot;

  const matchedOverrides = ((overrides ?? []) as OverrideRow[]).filter((o) => {
    if (o.scope === "field" && o.field_id !== fieldId) return false;
    const startsAt = new Date(o.starts_at);
    const endsAt = new Date(o.ends_at);
    return startsAt < slotEndAt && endsAt > slotStartAt;
  });

  const hasBlockOverride = matchedOverrides.some((o) => o.status === "BLOCK");
  const hasOpenOverride = matchedOverrides.some((o) => o.status === "OPEN");
  const isAvailable = hasBlockOverride ? false : hasOpenOverride ? true : weeklyOpen;

  if (!isAvailable) {
    return NextResponse.json({
      total: 0,
      breakdown: [],
      winnerRuleName: null,
      note: hasBlockOverride
        ? "Blocked by override."
        : "Closed in weekly availability.",
    });
  }

  const { data: rules, error } = await adminClient
    .from("center_price_rules")
    .select("*")
    .eq("center_id", centerId)
    .eq("enabled", true)
    .order("priority", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const applicable = ((rules ?? []) as RuleRow[]).filter((rule) => {
    if (!rule.applies_to_all && !(rule.applies_field_ids ?? []).includes(fieldId)) return false;
    if (!inDayScope(quoteDate, rule.day_scope)) return false;
    const ruleStart = toMinutes(rule.time_start);
    const ruleEnd = toMinutes(rule.time_end);
    return startMinutes >= ruleStart && endMinutes <= ruleEnd;
  });

  const winner = applicable.sort((a, b) => b.priority - a.priority)[0] ?? null;
  if (!winner) {
    return NextResponse.json({
      total: 0,
      breakdown: [],
      winnerRuleName: null,
      note: "Available but no matching active price rule.",
    });
  }

  const durationHours = (endMinutes - startMinutes) / 60;
  const total = Number((durationHours * Number(winner.price_per_hour)).toFixed(2));
  return NextResponse.json({
    total,
    breakdown: [{ label: `${startTime} - ${endTime} (${winner.name})`, price: total }],
    winnerRuleName: winner.name,
    note:
      winner.day_scope === "Specific dates"
        ? "Specific date rules are treated as active by priority."
        : null,
  });
}
