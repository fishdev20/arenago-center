"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCenterFields } from "@/lib/query/use-center-fields";
import {
  useCenterAvailabilityOverrides,
  useCenterPricingQuote,
  useCenterPricingRules,
  useCenterWeeklyAvailability,
  useCreateCenterAvailabilityOverride,
  useCreateCenterPricingRule,
  useDeleteCenterAvailabilityOverride,
  useDeleteCenterPricingRule,
  useSeedCenterPricingDemoData,
  useUpdateCenterAvailabilityOverride,
  useUpdateCenterPricingRule,
  useUpsertCenterWeeklyAvailability,
} from "@/lib/query/use-center-pricing";
import { format } from "date-fns";
import * as React from "react";
import { toast } from "sonner";
import {
  CustomerPreviewCard,
  dayMatches,
  getPreviewSlotsForDate,
  mergeMinuteRanges,
  minuteToTimeString,
  resolveRuleForSlot,
  subtractMinuteRanges,
  toMinute,
} from "./_components/customer-preview-card";
import { OverridesCard } from "./_components/overrides-card";
import { QuotePreviewCard } from "./_components/quote-preview-card";
import { RuleDialog } from "./_components/rule-dialog";
import { RulesStepCard } from "./_components/rules-step-card";
import { usePriceAvailabilityStore } from "./_components/use-price-availability-store";
import { WeeklyScheduleCard } from "./_components/weekly-schedule-card";

type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

const DAYS: { key: Day; label: string; index: number }[] = [
  { key: "Mon", label: "Monday", index: 1 },
  { key: "Tue", label: "Tuesday", index: 2 },
  { key: "Wed", label: "Wednesday", index: 3 },
  { key: "Thu", label: "Thursday", index: 4 },
  { key: "Fri", label: "Friday", index: 5 },
  { key: "Sat", label: "Saturday", index: 6 },
  { key: "Sun", label: "Sunday", index: 0 },
];
const RULE_TIMELINE_STYLES = [
  { bgClass: "bg-cyan-500/35", textClass: "text-cyan-950 dark:text-cyan-100" },
  { bgClass: "bg-emerald-500/35", textClass: "text-emerald-950 dark:text-emerald-100" },
  { bgClass: "bg-violet-500/35", textClass: "text-violet-950 dark:text-violet-100" },
  { bgClass: "bg-fuchsia-500/35", textClass: "text-fuchsia-950 dark:text-fuchsia-100" },
  { bgClass: "bg-orange-500/35", textClass: "text-orange-950 dark:text-orange-100" },
  { bgClass: "bg-sky-500/35", textClass: "text-sky-950 dark:text-sky-100" },
];

type Slot = { start: string; end: string };
type MinuteRange = { start: number; end: number };
type TimelineSegment = {
  id: string;
  label: string;
  startMin: number;
  endMin: number;
  priceLabel: string;
  bgClass: string;
  textClass?: string;
};

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

export default function PriceAvailabilityPageClient() {
  const { data: fieldsRes } = useCenterFields();
  const { data: rulesRes } = useCenterPricingRules();
  const { data: scheduleRes } = useCenterWeeklyAvailability();
  const { data: overridesRes } = useCenterAvailabilityOverrides();

  const createRule = useCreateCenterPricingRule();
  const updateRule = useUpdateCenterPricingRule();
  const deleteRule = useDeleteCenterPricingRule();
  const upsertSchedule = useUpsertCenterWeeklyAvailability();
  const createOverride = useCreateCenterAvailabilityOverride();
  const deleteOverride = useDeleteCenterAvailabilityOverride();
  const updateOverride = useUpdateCenterAvailabilityOverride();
  const quotePricing = useCenterPricingQuote();
  const seedDemoData = useSeedCenterPricingDemoData();

  const fields = React.useMemo(
    () =>
      (fieldsRes?.fields ?? []).map((f) => ({
        id: f.id,
        name: f.name,
      })),
    [fieldsRes],
  );

  const rules: FormattedRule[] = React.useMemo(
    () =>
      (rulesRes?.rules ?? []).map((r) => ({
        id: r.id,
        enabled: r.enabled,
        name: r.name,
        appliesTo: r.applies_to_all ? "all" : r.applies_field_ids,
        days: r.day_scope,
        timeRange: `${r.time_start.slice(0, 5)} - ${r.time_end.slice(0, 5)}`,
        pricePerHour: Number(r.price_per_hour),
        priority: r.priority,
      })),
    [rulesRes],
  );

  const scheduleByDay = React.useMemo(() => {
    const map = new Map<number, { is_open: boolean; slots: Slot[] }>();
    (scheduleRes?.schedule ?? []).forEach((d) => {
      map.set(d.day_of_week, {
        is_open: d.is_open,
        slots: Array.isArray(d.slots) ? d.slots : [],
      });
    });
    return map;
  }, [scheduleRes]);

  const overrides = overridesRes?.overrides ?? [];

  const {
    quoteField,
    setQuoteField,
    quoteDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    ruleForm,
    resetRuleForm,
    viewMode,
    setViewMode,
    setRuleDialogOpen,
    reset,
  } = usePriceAvailabilityStore();

  React.useEffect(() => {
    reset();
  }, [reset]);

  React.useEffect(() => {
    if (!quoteField && fields[0]?.id) setQuoteField(fields[0].id);
  }, [quoteField, fields]);

  const activeRules = React.useMemo(
    () => rules.filter((r) => r.enabled).sort((a, b) => b.priority - a.priority),
    [rules],
  );
  const quoteAvailability = React.useMemo(() => {
    if (!quoteDate || !quoteField) {
      return { startOptions: [] as string[], endOptions: [] as string[], hasOpenSlots: false };
    }

    const date = new Date(`${quoteDate}T00:00:00`);
    const dayIdx = date.getDay();
    const day = scheduleByDay.get(dayIdx);
    const fallbackSlots = (day?.is_open ? day.slots : [])
      .map((slot) => ({ start: toMinute(slot.start), end: toMinute(slot.end) }))
      .filter((s) => s.end > s.start);

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayOverrides = overrides.filter((o) => {
      if (o.scope === "field" && o.field?.id !== quoteField) return false;
      const startsAt = new Date(o.starts_at);
      const endsAt = new Date(o.ends_at);
      return startsAt < dayEnd && endsAt > dayStart;
    });

    const toDayRange = (startIso: string, endIso: string): MinuteRange => {
      const start = new Date(startIso);
      const end = new Date(endIso);
      const startMin = Math.max(0, start.getHours() * 60 + start.getMinutes());
      const endMin = Math.min(24 * 60, end.getHours() * 60 + end.getMinutes());
      return { start: startMin, end: endMin };
    };

    const openOverrides = dayOverrides
      .filter((o) => o.status === "OPEN")
      .map((o) => toDayRange(o.starts_at, o.ends_at));
    const blockOverrides = dayOverrides
      .filter((o) => o.status === "BLOCK")
      .map((o) => toDayRange(o.starts_at, o.ends_at));

    const baseOpen = mergeMinuteRanges([...fallbackSlots, ...openOverrides]);
    const slotRanges = subtractMinuteRanges(baseOpen, blockOverrides);

    const startSet = new Set<string>();
    for (const slot of slotRanges) {
      for (let t = slot.start; t <= slot.end - 15; t += 15) {
        startSet.add(minuteToTimeString(t));
      }
    }
    const startOptions = Array.from(startSet).sort();

    const selectedStart = toMinute(startTime);
    const containingSlot = slotRanges.find((s) => selectedStart >= s.start && selectedStart < s.end);
    const endOptions: string[] = [];
    if (containingSlot) {
      for (let t = selectedStart + 15; t <= containingSlot.end; t += 15) {
        endOptions.push(minuteToTimeString(t));
      }
    }

    return { startOptions, endOptions, hasOpenSlots: slotRanges.length > 0 };
  }, [overrides, quoteDate, quoteField, scheduleByDay, startTime]);

  React.useEffect(() => {
    if (quoteAvailability.startOptions.length === 0) return;
    if (!quoteAvailability.startOptions.includes(startTime)) {
      setStartTime(quoteAvailability.startOptions[0]!);
      return;
    }
    if (!quoteAvailability.endOptions.includes(endTime)) {
      setEndTime(quoteAvailability.endOptions[0] ?? quoteAvailability.startOptions[0]!);
    }
  }, [endTime, quoteAvailability.endOptions, quoteAvailability.startOptions, startTime]);
  const timelinePreview = React.useMemo(() => {
    if (!quoteDate) return null;

    const previewDate = new Date(`${quoteDate}T00:00:00`);
    const dayIdx = previewDate.getDay();
    const selectedFieldId = quoteField || fields[0]?.id || "";
    const daySchedule = scheduleByDay.get(dayIdx);
    const baseSlots = daySchedule?.is_open ? daySchedule.slots : [];
    const openSlots = getPreviewSlotsForDate(overrides, selectedFieldId, previewDate, baseSlots);

    const availabilityIntervals = openSlots
      .map((slot) => ({
        start: toMinute(slot.start),
        end: toMinute(slot.end),
      }))
      .filter((x) => x.end > x.start);
    const viewportStartMin =
      availabilityIntervals.length > 0 ? Math.min(...availabilityIntervals.map((x) => x.start)) : 0;
    const viewportEndMin =
      availabilityIntervals.length > 0
        ? Math.max(...availabilityIntervals.map((x) => x.end))
        : 24 * 60;

    const applicableRules = activeRules.filter((rule) => {
      if (rule.appliesTo !== "all" && !rule.appliesTo.includes(selectedFieldId)) return false;
      return dayMatches(rule.days, dayIdx);
    });
    const ruleStyleById = new Map<string, { bgClass: string; textClass: string }>();
    applicableRules.forEach((rule, idx) => {
      const style = RULE_TIMELINE_STYLES[idx % RULE_TIMELINE_STYLES.length]!;
      ruleStyleById.set(rule.id, style);
    });

    const boundaries = new Set<number>([0, 24 * 60]);
    availabilityIntervals.forEach((i) => {
      boundaries.add(i.start);
      boundaries.add(i.end);
    });
    applicableRules.forEach((r) => {
      const [start, end] = r.timeRange.split(" - ");
      if (!start || !end) return;
      boundaries.add(toMinute(start));
      boundaries.add(toMinute(end));
    });

    const sorted = Array.from(boundaries).sort((a, b) => a - b);
    const rawSegments: TimelineSegment[] = [];

    for (let i = 0; i < sorted.length - 1; i += 1) {
      const start = sorted[i]!;
      const end = sorted[i + 1]!;
      if (end <= start) continue;

      const mid = start + (end - start) / 2;
      const inOpenInterval = availabilityIntervals.some(
        (slot) => mid >= slot.start && mid < slot.end,
      );

      if (!inOpenInterval) {
        rawSegments.push({
          id: `closed-${start}-${end}`,
          label: "Closed",
          startMin: start,
          endMin: end,
          priceLabel: "Closed",
          bgClass: "bg-muted/40",
          textClass: "text-muted-foreground",
        });
        continue;
      }

      const rule = applicableRules.find((r) => {
        const [s, e] = r.timeRange.split(" - ");
        if (!s || !e) return false;
        return mid >= toMinute(s) && mid < toMinute(e);
      });

      if (!rule) {
        rawSegments.push({
          id: `open-${start}-${end}`,
          label: "Open (no rule)",
          startMin: start,
          endMin: end,
          priceLabel: "Open",
          bgClass: "bg-amber-500/20",
          textClass: "text-amber-700 dark:text-amber-400",
        });
        continue;
      }

      rawSegments.push({
        id: `${rule.id}-${start}-${end}`,
        label: rule.name,
        startMin: start,
        endMin: end,
        priceLabel: `EUR ${rule.pricePerHour.toFixed(0)}`,
        bgClass: ruleStyleById.get(rule.id)?.bgClass ?? "bg-primary/35",
        textClass: ruleStyleById.get(rule.id)?.textClass ?? "text-foreground",
      });
    }

    const merged: TimelineSegment[] = [];
    for (const segment of rawSegments) {
      const prev = merged[merged.length - 1];
      if (
        prev &&
        prev.label === segment.label &&
        prev.priceLabel === segment.priceLabel &&
        prev.bgClass === segment.bgClass &&
        prev.endMin === segment.startMin
      ) {
        prev.endMin = segment.endMin;
      } else {
        merged.push({ ...segment });
      }
    }

    const fieldName = fields.find((f) => f.id === selectedFieldId)?.name ?? "Selected field";
    const legend = [
      { label: "Rule applied (color by rule)", dotClass: "bg-cyan-500" },
      { label: "Open (no rule)", dotClass: "bg-amber-400" },
      { label: "Closed", dotClass: "bg-muted-foreground" },
    ];

    return {
      segments: merged,
      legend,
      viewportStartMin,
      viewportEndMin,
      footer: `Previewing ${fieldName} on ${previewDate.toLocaleDateString()}`,
    };
  }, [activeRules, fields, overrides, quoteDate, quoteField, scheduleByDay]);
  const openDaysCount = React.useMemo(() => {
    let count = 0;
    for (const day of DAYS) {
      if (scheduleByDay.get(day.index)?.is_open) count += 1;
    }
    return count;
  }, [scheduleByDay]);

  const breakdown = React.useMemo(
    () => ({
      items: quotePricing.data?.breakdown ?? [],
      total: quotePricing.data?.total ?? 0,
      winner: quotePricing.data?.winnerRuleName ?? null,
      note: quotePricing.data?.note ?? null,
    }),
    [quotePricing.data],
  );

  const handleCreateRule = async () => {
    try {
      await createRule.mutateAsync({
        name: ruleForm.name.trim(),
        enabled: ruleForm.enabled,
        appliesTo:
          ruleForm.appliesToMode === "all" ? "all" : ruleForm.fieldId ? [ruleForm.fieldId] : "all",
        days: ruleForm.days,
        timeStart: ruleForm.timeStart,
        timeEnd: ruleForm.timeEnd,
        pricePerHour: Number(ruleForm.pricePerHour),
        priority: Number(ruleForm.priority),
      });
      toast.success("Rule created.");
      setRuleDialogOpen(false);
      resetRuleForm();
    } catch (err: any) {
      toast.error(err?.data?.error ?? err?.message ?? "Failed to create rule.");
    }
  };

  const handleUpdateRule = async () => {
    if (!ruleForm.id) return;
    try {
      await updateRule.mutateAsync({
        id: ruleForm.id,
        name: ruleForm.name.trim(),
        enabled: ruleForm.enabled,
        appliesTo:
          ruleForm.appliesToMode === "all" ? "all" : ruleForm.fieldId ? [ruleForm.fieldId] : "all",
        days: ruleForm.days,
        timeStart: ruleForm.timeStart,
        timeEnd: ruleForm.timeEnd,
        pricePerHour: Number(ruleForm.pricePerHour),
        priority: Number(ruleForm.priority),
      });
      toast.success("Rule updated.");
      setRuleDialogOpen(false);
      resetRuleForm();
    } catch (err: any) {
      toast.error(err?.data?.error ?? err?.message ?? "Failed to update rule.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Pricing & Availability</h1>
          <p className="text-sm text-muted-foreground">
            Follow the workflow: set schedule, configure rules, add exceptions, then test quote.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                const res = await seedDemoData.mutateAsync();
                const summary = res.summary;
                toast.success(
                  `Demo loaded: ${summary.fields} fields, ${summary.rules} rules, ${summary.scheduleDays} days, ${summary.overrides} overrides.`,
                );
              } catch (err: any) {
                toast.error(err?.data?.error ?? err?.message ?? "Failed to load demo data.");
              }
            }}
            disabled={seedDemoData.isPending}
          >
            {seedDemoData.isPending ? "Loading demo..." : "Load demo data"}
          </Button>
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as "edit" | "preview")}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid gap-4">
        {viewMode === "edit" ? (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Step 1 - Weekly recurring availability</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Define open days and time slots first. Current open days: {openDaysCount}/7.
                </p>
              </CardHeader>
              <CardContent>
                <WeeklyScheduleCard
                  days={DAYS}
                  scheduleByDay={scheduleByDay}
                  onSave={async (dayOfWeek, isOpen, slots) => {
                    try {
                      await upsertSchedule.mutateAsync({ dayOfWeek, isOpen, slots });
                      toast.success("Schedule updated.");
                    } catch (err: any) {
                      toast.error(err?.data?.error ?? err?.message ?? "Failed to save schedule.");
                    }
                  }}
                />
              </CardContent>
            </Card>

            <RulesStepCard
              fields={fields}
              rules={[...rules].sort((a, b) => b.priority - a.priority)}
              onToggleEnabled={async (id, enabled) => {
                try {
                  await updateRule.mutateAsync({ id, enabled });
                } catch (err: any) {
                  toast.error(err?.data?.error ?? err?.message ?? "Failed to update rule.");
                }
              }}
              onDeleteRule={async (id) => {
                try {
                  await deleteRule.mutateAsync(id);
                  toast.success("Rule deleted.");
                } catch (err: any) {
                  toast.error(err?.data?.error ?? err?.message ?? "Failed to delete rule.");
                }
              }}
            />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Step 3 - Date-specific overrides</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Use overrides for maintenance, events, and special openings.
                </p>
              </CardHeader>
              <CardContent>
                <OverridesCard
                  fields={fields}
                  overrides={overrides}
                  onCreate={async (payload) => {
                    try {
                      if (!payload.startsAt || !payload.endsAt) {
                        toast.error("Start and end date are required.");
                        return;
                      }
                      await createOverride.mutateAsync({
                        scope: payload.scope,
                        fieldId: payload.fieldId,
                        status: payload.status,
                        startsAt: new Date(payload.startsAt).toISOString(),
                        endsAt: new Date(payload.endsAt).toISOString(),
                        reason: payload.reason,
                      });
                      toast.success("Override created.");
                    } catch (err: any) {
                      toast.error(err?.data?.error ?? err?.message ?? "Failed to create override.");
                    }
                  }}
                  onEdit={async (id, payload) => {
                    try {
                      await updateOverride.mutateAsync({ id, ...payload });
                      toast.success("Override updated.");
                    } catch (err: any) {
                      toast.error(err?.data?.error ?? err?.message ?? "Failed to update override.");
                    }
                  }}
                  onDelete={async (id) => {
                    try {
                      await deleteOverride.mutateAsync(id);
                      toast.success("Override deleted.");
                    } catch (err: any) {
                      toast.error(err?.data?.error ?? err?.message ?? "Failed to delete override.");
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>
        ) : null}

        {viewMode === "preview" ? (
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
              <QuotePreviewCard
                fields={fields}
                quoteAvailability={quoteAvailability}
                onCalculateQuote={async (payload) => {
                  try {
                    await quotePricing.mutateAsync({
                      fieldId: payload.fieldId,
                      date: payload.date,
                      startTime: payload.startTime,
                      endTime: payload.endTime,
                    });
                  } catch (err: any) {
                    toast.error(err?.data?.error ?? err?.message ?? "Failed to calculate quote.");
                  }
                }}
                isCalculating={quotePricing.isPending}
                breakdown={breakdown}
                timelinePreview={timelinePreview}
              />

              <CustomerPreviewCard
                fields={fields}
                scheduleByDay={scheduleByDay}
                activeRules={activeRules}
                overrides={overrides}
              />
            </div>

          </div>
        ) : null}
      </div>
      <RuleDialog fields={fields} onSubmit={ruleForm.id ? handleUpdateRule : handleCreateRule} />
    </div>
  );
}
