"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { normalizeTime } from "./time-pickers";

type Day = { key: string; label: string; index: number };
type Slot = { start: string; end: string };
type Meridiem = "AM" | "PM";

const TIME_12H_OPTIONS = Array.from({ length: 48 }).map((_, index) => {
  const totalMinutes = index * 15;
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  return `${hours12}:${String(minutes).padStart(2, "0")}`;
});

function toMinute(value: string) {
  const [h, m] = value.slice(0, 5).split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

function to12hParts(time24: string): { time: string; meridiem: Meridiem } {
  const normalized = normalizeTime(time24);
  const [hRaw, mRaw] = normalized.split(":").map(Number);
  const h = Number.isFinite(hRaw) ? hRaw : 0;
  const m = Number.isFinite(mRaw) ? mRaw : 0;
  const meridiem: Meridiem = h >= 12 ? "PM" : "AM";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return { time: `${h12}:${String(m).padStart(2, "0")}`, meridiem };
}

function to24hTime(time12: string, meridiem: Meridiem): string {
  const [hourRaw, minuteRaw] = time12.split(":").map(Number);
  let hour = Number.isFinite(hourRaw) ? hourRaw : 12;
  const minute = Number.isFinite(minuteRaw) ? minuteRaw : 0;
  if (hour === 12) hour = 0;
  if (meridiem === "PM") hour += 12;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function WeeklyScheduleCard({
  days,
  scheduleByDay,
  onSave,
}: {
  days: Day[];
  scheduleByDay: Map<number, { is_open: boolean; slots: Slot[] }>;
  onSave: (dayOfWeek: number, isOpen: boolean, slots: Slot[]) => Promise<void>;
}) {
  const [isSavingAll, setIsSavingAll] = React.useState(false);

  const buildDraft = React.useCallback(() => {
    const next = new Map<number, { isOpen: boolean; slots: Slot[] }>();
    for (const day of days) {
      const item = scheduleByDay.get(day.index);
      next.set(day.index, {
        isOpen: item?.is_open ?? false,
        slots:
          item?.slots && item.slots.length > 0
            ? item.slots.map((slot) => ({ ...slot }))
            : [{ start: "08:00", end: "22:00" }],
      });
    }
    return next;
  }, [days, scheduleByDay]);

  const [draftByDay, setDraftByDay] = React.useState<
    Map<number, { isOpen: boolean; slots: Slot[] }>
  >(() => buildDraft());

  React.useEffect(() => {
    setDraftByDay(buildDraft());
  }, [buildDraft]);

  const totalOpenHours = React.useMemo(() => {
    let minutes = 0;
    for (const day of days) {
      const item = draftByDay.get(day.index);
      if (!item?.isOpen) continue;
      for (const slot of item.slots ?? []) {
        const m = toMinute(slot.end) - toMinute(slot.start);
        if (m > 0) minutes += m;
      }
    }
    return (minutes / 60).toFixed(1);
  }, [days, draftByDay]);

  const hasAnyChanges = React.useMemo(() => {
    for (const day of days) {
      const original = scheduleByDay.get(day.index) ?? { is_open: false, slots: [] };
      const draft = draftByDay.get(day.index) ?? { isOpen: false, slots: [] };
      if (draft.isOpen !== original.is_open) return true;

      const originalSlots = original.is_open ? original.slots : [];
      const draftSlots = draft.isOpen ? draft.slots : [];
      if (draftSlots.length !== originalSlots.length) return true;
      for (let i = 0; i < draftSlots.length; i += 1) {
        const a = draftSlots[i];
        const b = originalSlots[i];
        if (!a || !b) return true;
        if (normalizeTime(a.start) !== normalizeTime(b.start)) return true;
        if (normalizeTime(a.end) !== normalizeTime(b.end)) return true;
      }
    }
    return false;
  }, [days, draftByDay, scheduleByDay]);

  const updateDay = React.useCallback(
    (
      dayIndex: number,
      updater: (prev: { isOpen: boolean; slots: Slot[] }) => { isOpen: boolean; slots: Slot[] },
    ) => {
      setDraftByDay((prev) => {
        const next = new Map(prev);
        const current = next.get(dayIndex) ?? {
          isOpen: false,
          slots: [{ start: "08:00", end: "22:00" }],
        };
        next.set(dayIndex, updater(current));
        return next;
      });
    },
    [],
  );

  const applyTemplate = (type: "weekday" | "weekend" | "all") => {
    const target = days.filter((d) => {
      if (type === "all") return true;
      if (type === "weekday") return d.index >= 1 && d.index <= 5;
      return d.index === 0 || d.index === 6;
    });

    setDraftByDay((prev) => {
      const next = new Map(prev);
      for (const d of target) {
        next.set(d.index, {
          isOpen: true,
          slots: [{ start: "08:00", end: type === "weekend" ? "20:00" : "22:00" }],
        });
      }
      return next;
    });

    toast.success("Template applied to form. Click Save all changes.");
  };

  const saveAllDays = async () => {
    if (!hasAnyChanges) return;
    setIsSavingAll(true);
    try {
      await Promise.all(
        days.map(async (day) => {
          const draft = draftByDay.get(day.index) ?? { isOpen: false, slots: [] };
          await onSave(day.index, draft.isOpen, draft.isOpen ? draft.slots : []);
        }),
      );
      toast.success("Business hours updated.");
    } finally {
      setIsSavingAll(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 rounded-md border bg-muted p-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-muted-foreground">
          Weekly planned hours:{" "}
          <span className="font-semibold text-foreground">{totalOpenHours}h</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={isSavingAll}
            onClick={() => applyTemplate("weekday")}
          >
            Apply weekday template
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isSavingAll}
            onClick={() => applyTemplate("weekend")}
          >
            Apply weekend template
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isSavingAll}
            onClick={() => applyTemplate("all")}
          >
            Apply all days
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {days.map((day) => {
          const item = draftByDay.get(day.index) ?? {
            isOpen: false,
            slots: [{ start: "08:00", end: "22:00" }],
          };
          return (
            <div key={day.key} className="border-b p-3">
              <div className="grid items-start gap-4 md:grid-cols-[240px_1fr]">
                <div className="flex items-center gap-3 px-3 py-2">
                  <span className="w-24 shrink-0 font-medium leading-none">{day.label}</span>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Switch
                      checked={item.isOpen}
                      onCheckedChange={(checked) =>
                        updateDay(day.index, (prev) => ({ ...prev, isOpen: Boolean(checked) }))
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.isOpen ? "Open" : "Closed"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {item.isOpen && item.slots.length === 0 ? (
                    <div className="max-w-md rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
                      No slots
                    </div>
                  ) : null}
                  {item.slots.map((slot, slotIndex) => {
                    const start = to12hParts(slot.start);
                    const end = to12hParts(slot.end);
                    return (
                      <div
                        key={`${day.index}-${slotIndex}`}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <Select
                          value={start.time}
                          onValueChange={(nextTime) =>
                            updateDay(day.index, (prev) => {
                              const nextSlots = [...prev.slots];
                              const current = nextSlots[slotIndex] ?? {
                                start: "08:00",
                                end: "22:00",
                              };
                              nextSlots[slotIndex] = {
                                ...current,
                                start: to24hTime(nextTime, to12hParts(current.start).meridiem),
                              };
                              return { ...prev, slots: nextSlots };
                            })
                          }
                          disabled={!item.isOpen}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_12H_OPTIONS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={start.meridiem}
                          onValueChange={(nextMeridiem: Meridiem) =>
                            updateDay(day.index, (prev) => {
                              const nextSlots = [...prev.slots];
                              const current = nextSlots[slotIndex] ?? {
                                start: "08:00",
                                end: "22:00",
                              };
                              nextSlots[slotIndex] = {
                                ...current,
                                start: to24hTime(to12hParts(current.start).time, nextMeridiem),
                              };
                              return { ...prev, slots: nextSlots };
                            })
                          }
                          disabled={!item.isOpen}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>

                        <span className="px-1 text-sm text-muted-foreground">to</span>

                        <Select
                          value={end.time}
                          onValueChange={(nextTime) =>
                            updateDay(day.index, (prev) => {
                              const nextSlots = [...prev.slots];
                              const current = nextSlots[slotIndex] ?? {
                                start: "08:00",
                                end: "22:00",
                              };
                              nextSlots[slotIndex] = {
                                ...current,
                                end: to24hTime(nextTime, to12hParts(current.end).meridiem),
                              };
                              return { ...prev, slots: nextSlots };
                            })
                          }
                          disabled={!item.isOpen}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_12H_OPTIONS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={end.meridiem}
                          onValueChange={(nextMeridiem: Meridiem) =>
                            updateDay(day.index, (prev) => {
                              const nextSlots = [...prev.slots];
                              const current = nextSlots[slotIndex] ?? {
                                start: "08:00",
                                end: "22:00",
                              };
                              nextSlots[slotIndex] = {
                                ...current,
                                end: to24hTime(to12hParts(current.end).time, nextMeridiem),
                              };
                              return { ...prev, slots: nextSlots };
                            })
                          }
                          disabled={!item.isOpen}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          disabled={!item.isOpen}
                          onClick={() =>
                            updateDay(day.index, (prev) => ({
                              ...prev,
                              slots: prev.slots.filter((_, idx) => idx !== slotIndex),
                            }))
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                  {item.isOpen ? (
                    item.slots.length === 0 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Add slot"
                        className="h-7 w-7 rounded-full"
                        onClick={() =>
                          updateDay(day.index, (prev) => ({
                            ...prev,
                            slots: [...prev.slots, { start: "08:00", end: "22:00" }],
                          }))
                        }
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto px-0 text-xs"
                        onClick={() =>
                          updateDay(day.index, (prev) => ({
                            ...prev,
                            slots: [...prev.slots, { start: "08:00", end: "22:00" }],
                          }))
                        }
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Add slot
                      </Button>
                    )
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <Button disabled={isSavingAll || !hasAnyChanges} onClick={saveAllDays}>
          {isSavingAll ? "Saving..." : "Save all changes"}
        </Button>
      </div>
    </div>
  );
}
