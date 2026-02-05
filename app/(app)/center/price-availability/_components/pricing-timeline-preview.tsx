"use client";

import { Info } from "lucide-react";

type TimelineSegment = {
  id: string;
  label: string; // Standard / Weekend Prime / Holiday
  startMin: number; // 0..1439
  endMin: number; // 1..1440
  priceLabel: string; // "$45" or "€45"
  // Provide a class for background to match your legend colors
  // You can adjust these to your brand later.
  bgClass: string;
  textClass?: string;
};

const TOTAL_MIN = 24 * 60;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function widthPct(startMin: number, endMin: number) {
  const s = clamp(startMin, 0, TOTAL_MIN);
  const e = clamp(endMin, 0, TOTAL_MIN);
  return ((e - s) / TOTAL_MIN) * 100;
}

function leftPct(startMin: number) {
  const s = clamp(startMin, 0, TOTAL_MIN);
  return (s / TOTAL_MIN) * 100;
}

type LegendItem = { label: string; dotClass: string };

export function PricingTimelinePreview({
  title = "Pricing Timeline Preview (24h)",
  labels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"],
  legend = [
    { label: "Standard", dotClass: "bg-primary" },
    { label: "Weekend Prime", dotClass: "bg-amber-400" },
    { label: "Holiday", dotClass: "bg-violet-500" },
  ],
  segments = [
    {
      id: "s1",
      label: "Standard",
      startMin: 0,
      endMin: 360, // 00:00-06:00
      priceLabel: "$45",
      bgClass: "bg-primary/35",
      textClass: "text-foreground",
    },
    {
      id: "s2",
      label: "Weekday Morning",
      startMin: 360,
      endMin: 600, // 06:00-10:00
      priceLabel: "$35",
      bgClass: "bg-muted",
      textClass: "text-muted-foreground",
    },
    {
      id: "s3",
      label: "Weekend Prime",
      startMin: 600,
      endMin: 1200, // 10:00-20:00
      priceLabel: "$55",
      bgClass: "bg-amber-400",
      textClass: "text-white",
    },
    {
      id: "s4",
      label: "Standard",
      startMin: 1200,
      endMin: 1440, // 20:00-24:00
      priceLabel: "$45",
      bgClass: "bg-primary/35",
      textClass: "text-foreground",
    },
  ],
  footer = "Previewing for: Saturday, Oct 14th (Field 1)",
}: {
  title?: string;
  labels?: string[];
  legend?: LegendItem[];
  segments?: TimelineSegment[];
  footer?: string;
}) {
  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">{title}</div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {legend.map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <span className={["h-2.5 w-2.5 rounded-full", l.dotClass].join(" ")} />
              <span>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Time labels */}
      <div className="grid grid-cols-7 text-xs text-muted-foreground">
        {labels.map((t) => (
          <div key={t} className="text-center">
            {t}
          </div>
        ))}
      </div>

      {/* Bar */}
      <div className="relative overflow-hidden rounded-xl border bg-card">
        {/* subtle vertical grid lines */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={i === 0 ? "" : "border-l border-border/60"} />
          ))}
        </div>

        <div className="relative h-16">
          {segments.map((seg) => {
            const left = leftPct(seg.startMin);
            const w = widthPct(seg.startMin, seg.endMin);
            return (
              <div
                key={seg.id}
                className={[
                  "absolute top-0 h-full",
                  seg.bgClass,
                  "flex items-center justify-center",
                ].join(" ")}
                style={{
                  left: `${left}%`,
                  width: `${w}%`,
                }}
                title={`${seg.label}: ${seg.priceLabel} (${seg.startMin}-${seg.endMin})`}
              >
                <span
                  className={["text-sm font-semibold", seg.textClass ?? "text-foreground"].join(
                    " ",
                  )}
                >
                  {seg.priceLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4" />
        <span className="italic">{footer}</span>
      </div>
    </div>
  );
}
