"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as DatePickerCalendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

type Slot = { start: string; end: string };

type FormattedRule = {
  id: string;
  enabled: boolean;
  name: string;
  appliesTo: "all" | string[];
  days: "Daily" | "Weekdays" | "Weekend" | "Specific dates";
  timeRange: string;
  pricePerHour: number;
  priority: number;
};

type Override = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: "BLOCK" | "OPEN";
  reason?: string | null;
  scope: "center" | "field";
  field?: { id: string; name: string } | null;
};

type PreviewSlot = { start: string; end: string; reason?: string | null };

type MinuteRange = { start: number; end: number };

export function dayMatches(scope: FormattedRule["days"], dayIdx: number) {
  if (scope === "Daily" || scope === "Specific dates") return true;
  if (scope === "Weekdays") return dayIdx >= 1 && dayIdx <= 5;
  if (scope === "Weekend") return dayIdx === 0 || dayIdx === 6;
  return false;
}

export function toMinute(value: string) {
  const [h, m] = value.slice(0, 5).split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

function toSlotDate(baseDate: Date, time: string) {
  const d = new Date(baseDate);
  const [h, m] = time.slice(0, 5).split(":").map(Number);
  d.setHours(Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0, 0, 0);
  return d;
}

function toTimeStringInLocal(dateIso: string) {
  const d = new Date(dateIso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function minuteToTimeString(minute: number) {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function resolveRuleForSlot(
  rules: FormattedRule[],
  fieldId: string,
  dayIdx: number,
  slot: Slot,
) {
  return rules.find((rule) => {
    if (rule.appliesTo !== "all" && !rule.appliesTo.includes(fieldId)) return false;
    if (!dayMatches(rule.days, dayIdx)) return false;
    const [start, end] = rule.timeRange.split(" - ");
    if (!start || !end) return false;
    return toMinute(slot.start) >= toMinute(start) && toMinute(slot.end) <= toMinute(end);
  });
}

export function resolveOverrideForSlot(
  overrides: Override[],
  fieldId: string,
  date: Date,
  slot: Slot,
) {
  const slotStart = toSlotDate(date, slot.start);
  const slotEnd = toSlotDate(date, slot.end);

  const matching = overrides.filter((o) => {
    if (o.scope === "field" && o.field?.id !== fieldId) return false;
    const startsAt = new Date(o.starts_at);
    const endsAt = new Date(o.ends_at);
    return startsAt < slotEnd && endsAt > slotStart;
  });

  if (matching.length === 0) return null;

  const hasBlock = matching.some((o) => o.status === "BLOCK");
  if (hasBlock) return { status: "BLOCK" as const };
  return { status: "OPEN" as const };
}

export function mergeMinuteRanges(ranges: MinuteRange[]) {
  if (ranges.length === 0) return [] as MinuteRange[];
  const sorted = [...ranges]
    .filter((r) => r.end > r.start)
    .sort((a, b) => a.start - b.start);
  const merged: MinuteRange[] = [sorted[0]!];
  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i]!;
    const prev = merged[merged.length - 1]!;
    if (current.start <= prev.end) {
      prev.end = Math.max(prev.end, current.end);
    } else {
      merged.push({ ...current });
    }
  }
  return merged;
}

export function subtractMinuteRanges(source: MinuteRange[], blockers: MinuteRange[]) {
  if (source.length === 0) return [] as MinuteRange[];
  if (blockers.length === 0) return source;
  let result = mergeMinuteRanges(source);
  const cuts = mergeMinuteRanges(blockers);

  for (const cut of cuts) {
    const next: MinuteRange[] = [];
    for (const slot of result) {
      if (cut.end <= slot.start || cut.start >= slot.end) {
        next.push(slot);
        continue;
      }
      if (cut.start > slot.start) {
        next.push({ start: slot.start, end: cut.start });
      }
      if (cut.end < slot.end) {
        next.push({ start: cut.end, end: slot.end });
      }
    }
    result = next.filter((r) => r.end > r.start);
  }

  return result;
}

export function getPreviewSlotsForDate(
  overrides: Override[],
  fieldId: string,
  date: Date,
  fallbackSlots: Slot[],
): PreviewSlot[] {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const dayOverrides = overrides.filter((o) => {
    if (o.scope === "field" && o.field?.id !== fieldId) return false;
    const startsAt = new Date(o.starts_at);
    const endsAt = new Date(o.ends_at);
    return startsAt < dayEnd && endsAt > dayStart;
  });

  const openOverrides = dayOverrides.filter((o) => o.status === "OPEN");
  if (openOverrides.length > 0) {
    return openOverrides
      .map((o) => ({
        start: toTimeStringInLocal(o.starts_at),
        end: toTimeStringInLocal(o.ends_at),
        reason: o.reason ?? null,
      }))
      .filter((s) => s.start !== s.end);
  }

  const blockedSlots = fallbackSlots.filter((slot) => {
    const override = resolveOverrideForSlot(overrides, fieldId, date, slot);
    return override?.status !== "BLOCK";
  });

  return blockedSlots;
}

export function CustomerPreviewCard({
  fields,
  scheduleByDay,
  activeRules,
  overrides,
}: {
  fields: { id: string; name: string }[];
  scheduleByDay: Map<number, { is_open: boolean; slots: Slot[] }>;
  activeRules: FormattedRule[];
  overrides: Override[];
}) {
  const [rangeOpen, setRangeOpen] = React.useState(false);
  const [previewRange, setPreviewRange] = React.useState<DateRange | undefined>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return { from: today, to: addDays(today, 6) };
  });

  const rangeFrom = React.useMemo(() => {
    const date = new Date(previewRange?.from ?? new Date());
    date.setHours(0, 0, 0, 0);
    return date;
  }, [previewRange?.from]);

  const rangeTo = React.useMemo(() => {
    const base = previewRange?.to ?? addDays(previewRange?.from ?? new Date(), 6);
    const date = new Date(base);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [previewRange?.from, previewRange?.to]);

  const previewByField = React.useMemo(() => {
    const rangeDiff = Math.floor((rangeTo.getTime() - rangeFrom.getTime()) / 86400000);
    const dayCount = Math.max(1, Math.min(31, rangeDiff + 1));

    return fields.map((field) => {
      const rows = Array.from({ length: dayCount }).map((_, offset) => {
        const date = new Date(rangeFrom);
        date.setDate(rangeFrom.getDate() + offset);
        const dayIdx = date.getDay();
        const day = scheduleByDay.get(dayIdx);
        const slots = day?.is_open ? day.slots : [];
        const visibleSlots = getPreviewSlotsForDate(overrides, field.id, date, slots).slice(0, 2);

        const slotPrices = visibleSlots.map((slot) => {
          const override = resolveOverrideForSlot(overrides, field.id, date, slot);
          const rule = resolveRuleForSlot(activeRules, field.id, dayIdx, slot);
          return {
            ...slot,
            pricePerHour: rule ? rule.pricePerHour : null,
            overrideStatus: override?.status ?? null,
          };
        });

        return {
          key: `${field.id}-${date.toISOString()}`,
          label: date.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
          isOpen: visibleSlots.length > 0,
          slots: slotPrices,
        };
      });
      return { field, rows };
    });
  }, [activeRules, fields, overrides, rangeFrom, rangeTo, scheduleByDay]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Customer view preview</CardTitle>
        <p className="text-sm text-muted-foreground">
          This is how availability and price look to users for all courts.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between rounded-md border p-2">
          <span className="text-xs text-muted-foreground">Preview range</span>
          <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {`${format(rangeFrom, "PPP")} - ${format(rangeTo, "PPP")}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <DatePickerCalendar
                mode="range"
                selected={previewRange}
                defaultMonth={rangeFrom}
                onSelect={(nextRange) => {
                  setPreviewRange(nextRange);
                  if (nextRange?.from && nextRange?.to) setRangeOpen(false);
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {previewByField.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No courts available yet.
          </div>
        ) : (
          <Tabs defaultValue={previewByField[0]?.field.id} className="space-y-3">
            <TabsList className="w-full justify-start overflow-x-auto">
              {previewByField.map(({ field }) => (
                <TabsTrigger
                  key={field.id}
                  value={field.id}
                  className="w-36 shrink-0 justify-start"
                  title={field.name}
                >
                  <span className="block w-full truncate text-left">{field.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {previewByField.map(({ field, rows }) => (
              <TabsContent key={field.id} value={field.id} className="mt-0 space-y-2">
                {rows.map((row) => (
                  <div
                    key={row.key}
                    className={[
                      "rounded-md border p-2 transition-colors",
                      row.isOpen ? "bg-background" : "bg-muted/40 border-muted",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{row.label}</span>
                      <Badge
                        className={
                          row.isOpen
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                        }
                      >
                        {row.isOpen ? "Open" : "Closed"}
                      </Badge>
                    </div>
                    {row.isOpen && row.slots.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {row.slots.map((slot, i) => (
                          <div key={`${row.key}-${i}`} className="flex items-center justify-between text-xs">
                            <div>
                              <span className="text-muted-foreground">
                                {slot.start} - {slot.end}
                              </span>
                              {slot.reason ? (
                                <div className="text-[11px] text-muted-foreground">{slot.reason}</div>
                              ) : null}
                            </div>
                            <span className="font-medium">
                              {slot.overrideStatus === "BLOCK"
                                ? "Blocked by override"
                                : slot.pricePerHour !== null
                                  ? `EUR ${slot.pricePerHour.toFixed(2)}/h`
                                  : "No rule"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-muted-foreground">No customer-bookable slots</div>
                    )}
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
