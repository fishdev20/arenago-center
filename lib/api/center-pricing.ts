import { api } from "@/lib/api/api-client";

export type PriceRule = {
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
  created_at: string;
};

export type WeeklyAvailabilityDay = {
  id: string;
  day_of_week: number;
  is_open: boolean;
  slots: { start: string; end: string }[];
};

export type AvailabilityOverride = {
  id: string;
  scope: "center" | "field";
  status: "BLOCK" | "OPEN";
  reason: string | null;
  starts_at: string;
  ends_at: string;
  field_id: string | null;
  field?: { id: string; name: string } | null;
};

export async function fetchCenterPricingRules() {
  return api.get<{ rules: PriceRule[] }>("/api/center/pricing/rules", { withAuth: true });
}

export async function createCenterPricingRule(payload: {
  name: string;
  enabled: boolean;
  appliesTo: "all" | string[];
  days: PriceRule["day_scope"];
  timeStart: string;
  timeEnd: string;
  pricePerHour: number;
  priority: number;
}) {
  return api.post<{ rule: PriceRule }>("/api/center/pricing/rules", payload, { withAuth: true });
}

export async function updateCenterPricingRule(payload: {
  id: string;
  name?: string;
  enabled?: boolean;
  appliesTo?: "all" | string[];
  days?: PriceRule["day_scope"];
  timeStart?: string;
  timeEnd?: string;
  pricePerHour?: number;
  priority?: number;
}) {
  const { id, ...body } = payload;
  return api.patch<{ rule: PriceRule }>(`/api/center/pricing/rules/${id}`, body, { withAuth: true });
}

export async function deleteCenterPricingRule(id: string) {
  return api.delete<{ ok: boolean }>(`/api/center/pricing/rules/${id}`, { withAuth: true });
}

export async function fetchCenterWeeklyAvailability() {
  return api.get<{ schedule: WeeklyAvailabilityDay[] }>("/api/center/pricing/schedule", {
    withAuth: true,
  });
}

export async function upsertCenterWeeklyAvailability(payload: {
  dayOfWeek: number;
  isOpen: boolean;
  slots: { start: string; end: string }[];
}) {
  return api.put<{ day: WeeklyAvailabilityDay }>("/api/center/pricing/schedule", payload, {
    withAuth: true,
  });
}

export async function fetchCenterAvailabilityOverrides() {
  return api.get<{ overrides: AvailabilityOverride[] }>("/api/center/pricing/overrides", {
    withAuth: true,
  });
}

export async function createCenterAvailabilityOverride(payload: {
  scope: "center" | "field";
  fieldId?: string | null;
  status: "BLOCK" | "OPEN";
  startsAt: string;
  endsAt: string;
  reason?: string;
}) {
  return api.post<{ override: AvailabilityOverride }>("/api/center/pricing/overrides", payload, {
    withAuth: true,
  });
}

export async function updateCenterAvailabilityOverride(payload: {
  id: string;
  scope?: "center" | "field";
  fieldId?: string | null;
  status?: "BLOCK" | "OPEN";
  startsAt?: string;
  endsAt?: string;
  reason?: string;
}) {
  const { id, ...body } = payload;
  return api.patch<{ override: AvailabilityOverride }>(
    `/api/center/pricing/overrides/${id}`,
    body,
    { withAuth: true },
  );
}

export async function deleteCenterAvailabilityOverride(id: string) {
  return api.delete<{ ok: boolean }>(`/api/center/pricing/overrides/${id}`, { withAuth: true });
}

export async function quoteCenterPricing(payload: {
  fieldId: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  return api.post<{
    total: number;
    breakdown: { label: string; price: number }[];
    winnerRuleName: string | null;
    note: string | null;
  }>("/api/center/pricing/quote", payload, { withAuth: true });
}

export async function seedCenterPricingDemoData() {
  return api.post<{ ok: boolean; summary: Record<string, number> }>(
    "/api/center/pricing/seed",
    {},
    { withAuth: true },
  );
}
