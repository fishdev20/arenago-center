"use client";

import * as React from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type SparkPoint = { x: string; y: number };

function useIsDark() {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const el = document.documentElement;
    const update = () => setIsDark(el.classList.contains("dark"));
    update();

    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return isDark;
}

export function KpiSparkCard({
  title,
  value,
  deltaPct,
  deltaLabel = "vs Last month",
  data,
}: {
  title: string;
  value: string;
  deltaPct: number;
  deltaLabel?: string;
  data: SparkPoint[];
}) {
  const positive = deltaPct >= 0;
  const isDark = useIsDark();

  // ✅ Use your OKLCH theme primary
  const primary = "var(--chart-1)";

  // Dark mode: stronger fill + slight glow + thicker stroke
  const fillTop = isDark ? 0.6 : 0.35;
  const fillBottom = isDark ? 0.08 : 0;
  const strokeWidth = isDark ? 2.6 : 2;

  // Unique ids per card
  const id = React.useId();
  const gradId = `spark-grad-${id}`;
  const glowId = `spark-glow-${id}`;

  return (
    <Card className="overflow-hidden rounded-xl bg-card">
      <div className="flex h-[110px] items-stretch justify-between gap-4 p-5">
        {/* Left */}
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>

          <div className="mt-3 flex items-center gap-2">
            <Badge
              variant="secondary"
              className={[
                "rounded-md px-2 py-0.5 text-xs font-medium",
                positive
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400",
              ].join(" ")}
            >
              {positive ? "+" : ""}
              {deltaPct.toFixed(1)}%
            </Badge>

            <span className="text-xs text-muted-foreground">{deltaLabel}</span>
          </div>
        </div>

        {/* Right sparkline */}
        <div className="w-[140px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={primary} stopOpacity={fillTop} />
                  <stop offset="100%" stopColor={primary} stopOpacity={fillBottom} />
                </linearGradient>

                {/* Glow is subtle; only meaningful in dark mode */}
                <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow
                    dx="0"
                    dy="0"
                    stdDeviation={isDark ? 2.2 : 0}
                    floodColor={primary}
                    floodOpacity={isDark ? 0.55 : 0}
                  />
                </filter>
              </defs>

              <Tooltip
                cursor={false}
                contentStyle={{
                  background: "oklch(var(--background))",
                  border: "1px solid oklch(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ display: "none" }}
                formatter={(v: any) => [v, ""]}
              />

              <Area
                type="monotone"
                dataKey="y"
                stroke={primary}
                strokeWidth={strokeWidth}
                fill={`url(#${gradId})`}
                dot={false}
                activeDot={{ r: isDark ? 4 : 3 }}
                filter={`url(#${glowId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
