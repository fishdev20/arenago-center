"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HeatCell = {
  day: string; // Mon..Sun
  hour: number; // 6..23
  utilization: number; // 0..100
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 18 }, (_, i) => 6 + i); // 06:00 -> 23:00

// Mock data generator (replace with real data later)
function makeMock(fieldName: string): HeatCell[] {
  // deterministic-ish based on fieldName length
  const seed = fieldName.length * 17;

  const cells: HeatCell[] = [];
  for (let d = 0; d < DAYS.length; d++) {
    for (let h = 0; h < HOURS.length; h++) {
      const hour = HOURS[h];

      // Patterns: evenings + weekends higher
      const eveningBoost = hour >= 17 && hour <= 21 ? 30 : 0;
      const weekendBoost = d >= 5 ? 20 : 0;

      const noise = (seed + d * 11 + h * 7) % 25; // 0..24
      const base = 10 + noise;

      const utilization = clamp(base + eveningBoost + weekendBoost, 0, 100);

      cells.push({
        day: DAYS[d]!,
        hour,
        utilization,
      });
    }
  }
  return cells;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function level(util: number) {
  // map 0..100 to 0..4
  if (util >= 80) return 4;
  if (util >= 60) return 3;
  if (util >= 40) return 2;
  if (util >= 20) return 1;
  return 0;
}

function heatColorClass(lvl: number) {
  // Tailwind arbitrary color uses CSS var, theme switches automatically
  return [
    "bg-[hsl(var(--heat-0))]",
    "bg-[hsl(var(--heat-1))]",
    "bg-[hsl(var(--heat-2))]",
    "bg-[hsl(var(--heat-3))]",
    "bg-[hsl(var(--heat-4))]",
  ][lvl]!;
}

export function FieldUtilizationHeatmap({ fieldName = "All fields" }: { fieldName?: string }) {
  const data = React.useMemo(() => makeMock(fieldName), [fieldName]);

  // Fast lookup by day+hour
  const map = React.useMemo(() => {
    const m = new Map<string, HeatCell>();
    for (const c of data) m.set(`${c.day}-${c.hour}`, c);
    return m;
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Utilization heatmap</CardTitle>
        <div className="text-sm text-muted-foreground">{fieldName} • darker = more booked</div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Legend */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">Low</div>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map((lvl) => (
              <div key={lvl} className={`h-3 w-6 rounded ${heatColorClass(lvl)}`} />
            ))}
          </div>
          <div className="text-xs text-muted-foreground">High</div>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Hours header */}
            <div className="grid grid-cols-[56px_repeat(18,1fr)] gap-1">
              <div />
              {HOURS.map((h) => (
                <div key={h} className="text-[10px] text-muted-foreground text-center">
                  {String(h).padStart(2, "0")}
                </div>
              ))}
            </div>

            {/* Rows */}
            <div className="mt-2 grid gap-1">
              {DAYS.map((day) => (
                <div key={day} className="grid grid-cols-[56px_repeat(18,1fr)] gap-1">
                  <div className="text-xs text-muted-foreground flex items-center">{day}</div>

                  {HOURS.map((h) => {
                    const cell = map.get(`${day}-${h}`);
                    const util = cell?.utilization ?? 0;
                    const lvl = level(util);

                    return (
                      <div
                        key={`${day}-${h}`}
                        className={[
                          "h-6 rounded",
                          "border border-border/50",
                          heatColorClass(lvl),
                          "relative group",
                        ].join(" ")}
                      >
                        {/* Tooltip */}
                        <div className="pointer-events-none absolute left-1/2 top-0 z-20 hidden -translate-x-1/2 -translate-y-full group-hover:block">
                          <div className="whitespace-nowrap rounded-md border bg-background px-2 py-1 text-xs shadow-sm">
                            <div className="font-medium">
                              {day} {String(h).padStart(2, "0")}:00
                            </div>
                            <div className="text-muted-foreground">Utilization: {util}%</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Tip: use this to define peak-hour pricing and staffing.
        </div>
      </CardContent>
    </Card>
  );
}
