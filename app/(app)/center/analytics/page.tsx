"use client";

import { Download, TrendingUp } from "lucide-react";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/use-media-query";
import { FieldUtilizationHeatmap } from "./_components/field-utilization-heatmap";

type DailyMetric = {
  day: string;
  revenue: number;
  bookings: number;
};
type CancelMetric = {
  day: string;
  cancellations: number;
  noShows: number;
};

type FieldUtil = {
  name: string;
  utilization: number; // %
};

type FieldBookingsRow = {
  field: string;
  bookings: number;
};

const DAILY: DailyMetric[] = [
  { day: "Mon", revenue: 420, bookings: 12 },
  { day: "Tue", revenue: 380, bookings: 10 },
  { day: "Wed", revenue: 510, bookings: 14 },
  { day: "Thu", revenue: 460, bookings: 13 },
  { day: "Fri", revenue: 620, bookings: 18 },
  { day: "Sat", revenue: 880, bookings: 24 },
  { day: "Sun", revenue: 740, bookings: 20 },
];
const CANCELS: CancelMetric[] = [
  { day: "Mon", cancellations: 2, noShows: 1 },
  { day: "Tue", cancellations: 1, noShows: 1 },
  { day: "Wed", cancellations: 3, noShows: 1 },
  { day: "Thu", cancellations: 2, noShows: 2 },
  { day: "Fri", cancellations: 4, noShows: 2 },
  { day: "Sat", cancellations: 5, noShows: 3 },
  { day: "Sun", cancellations: 4, noShows: 2 },
];

const UTIL: FieldUtil[] = [
  { name: "Court 1", utilization: 76 },
  { name: "Court 2", utilization: 63 },
  { name: "Field 3", utilization: 49 },
];

const FIELD_BOOKINGS: FieldBookingsRow[] = [
  { field: "Court 1", bookings: 186 },
  { field: "Court 2", bookings: 305 },
  { field: "Field 3", bookings: 237 },
  { field: "Court 4", bookings: 73 },
];

function euro(n: number) {
  return `€${n.toLocaleString("en-US")}`;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--color-chart-1)",
  },
  bookings: {
    label: "Bookings",
    color: "var(--color-chart-2)",
  },
  label: {
    color: "var(--color-foreground)",
  },
  cancellations: {
    label: "Cancellations",
    color: "var(--color-chart-4)",
  },
  noShows: {
    label: "No-show",
    color: "var(--color-chart-5)",
  },
} satisfies ChartConfig;

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days", factor: 1, compare: 0.94, peak: 68, offPeak: 32 },
  { value: "30d", label: "Last 30 days", factor: 4.1, compare: 0.91, peak: 64, offPeak: 36 },
  { value: "90d", label: "Last 90 days", factor: 12.2, compare: 0.88, peak: 61, offPeak: 39 },
] as const;

export default function AnalyticsPageClient() {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [range, setRange] = React.useState<(typeof RANGE_OPTIONS)[number]["value"]>("30d");
  const rangeMeta = RANGE_OPTIONS.find((item) => item.value === range) ?? RANGE_OPTIONS[1];
  const scaledDaily = React.useMemo(
    () =>
      DAILY.map((d) => ({
        day: d.day,
        revenue: Math.round(d.revenue * rangeMeta.factor),
        bookings: Math.round(d.bookings * rangeMeta.factor),
      })),
    [rangeMeta.factor],
  );
  const scaledCancels = React.useMemo(
    () =>
      CANCELS.map((d) => ({
        day: d.day,
        cancellations: Math.round(d.cancellations * rangeMeta.factor),
        noShows: Math.round(d.noShows * rangeMeta.factor),
      })),
    [rangeMeta.factor],
  );
  const totals = React.useMemo(() => {
    const revenue = scaledDaily.reduce((s, x) => s + x.revenue, 0);
    const bookings = scaledDaily.reduce((s, x) => s + x.bookings, 0);
    const avg = bookings === 0 ? 0 : revenue / bookings;
    const previousRevenue = Math.round(revenue * rangeMeta.compare);
    const delta = previousRevenue === 0 ? 0 : ((revenue - previousRevenue) / previousRevenue) * 100;
    const cancellationTotal = scaledCancels.reduce((s, x) => s + x.cancellations + x.noShows, 0);
    const cancellationRate = bookings === 0 ? 0 : (cancellationTotal / bookings) * 100;
    return { revenue, bookings, avg, delta, cancellationRate };
  }, [scaledDaily, scaledCancels, rangeMeta.compare]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Track revenue, bookings, and field utilization.
          </p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="w-full sm:w-[180px]">
            <Select value={range} onValueChange={(v) => setRange(v as typeof range)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                {RANGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title={`Revenue (${rangeMeta.label})`} value={euro(totals.revenue)} />
        <Kpi title={`Bookings (${rangeMeta.label})`} value={String(totals.bookings)} />
        <Kpi title="Avg. booking value" value={euro(Math.round(totals.avg))} />
        <Kpi title="Cancellation rate" value={`${totals.cancellationRate.toFixed(1)}%`} />
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {/* Revenue trend */}
        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>

          <CardContent className="flex-1">
            <ChartContainer config={chartConfig} className="aspect-auto h-[180px] sm:h-[280px] xl:h-[340px] w-full">
              <LineChart accessibilityLayer data={scaledDaily} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Line
                  dataKey="revenue"
                  type="natural"
                  stroke="var(--color-revenue)"
                  strokeWidth={3}
                  dot={{ r: 2, fill: "var(--color-revenue)" }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>

          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium">
              Trending {totals.delta >= 0 ? "up" : "down"} by {Math.abs(totals.delta).toFixed(1)}%{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Compared to previous period
            </div>
          </CardFooter>
        </Card>

        {/* Bookings by field */}
        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle>Bookings by field</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>

          <CardContent className="flex-1">
            <ChartContainer config={chartConfig} className="aspect-auto h-[180px] sm:h-[280px] xl:h-[340px] w-full">
              <BarChart
                accessibilityLayer
                data={FIELD_BOOKINGS}
                layout="vertical"
                margin={{ right: 16 }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="field"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={isMobile ? 62 : 90}
                  tickFormatter={(value: string) =>
                    value.length > 10 ? `${value.slice(0, 10)}…` : value
                  }
                />
                <XAxis dataKey="bookings" type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Bar dataKey="bookings" layout="vertical" fill="var(--color-bookings)" radius={4}>
                  {!isMobile ? (
                    <LabelList
                      dataKey="field"
                      position="insideLeft"
                      offset={8}
                      className="fill-[var(--color-label)]"
                      fontSize={12}
                    />
                  ) : null}
                  <LabelList
                    dataKey="bookings"
                    position="right"
                    offset={8}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>

          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium">
              Trending up by 5.2% <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Compare with previous period (TODO)
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle>Cancellation & no-show trend</CardTitle>
            <CardDescription>{rangeMeta.label}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ChartContainer config={chartConfig} className="aspect-auto h-[170px] sm:h-[240px] xl:h-[300px] w-full">
              <LineChart accessibilityLayer data={scaledCancels} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Line
                  dataKey="cancellations"
                  type="monotone"
                  stroke="var(--color-cancellations)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="noShows"
                  type="monotone"
                  stroke="var(--color-noShows)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle>Peak vs off-peak utilization</CardTitle>
            <CardDescription>{rangeMeta.label}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4 pt-2">
            <div className="grid grid-cols-2 gap-2 rounded-md border p-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Peak window</div>
                <div className="font-medium">17:00 - 22:00</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Off-peak window</div>
                <div className="font-medium">06:00 - 16:00</div>
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Peak hours</span>
                <span className="font-semibold">{rangeMeta.peak}%</span>
              </div>
              <div className="h-2 w-full rounded bg-muted">
                <div className="h-2 rounded bg-primary" style={{ width: `${rangeMeta.peak}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Off-peak hours</span>
                <span className="font-semibold">{rangeMeta.offPeak}%</span>
              </div>
              <div className="h-2 w-full rounded bg-muted">
                <div className="h-2 rounded bg-chart-2" style={{ width: `${rangeMeta.offPeak}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Utilization */}
      <div className="grid gap-3 xl:grid-cols-2">
        <FieldUtilizationHeatmap />
        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle className="text-base">Field utilization</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="grid gap-3 sm:grid-cols-2">
              {UTIL.map((u) => (
                <div key={u.name} className="rounded-md border p-4">
                  <div className="text-sm font-medium">{u.name}</div>
                  <div className="mt-2 text-2xl font-semibold">{u.utilization}%</div>
                  <div className="mt-2 h-2 w-full rounded bg-muted">
                    <div className="h-2 rounded bg-primary" style={{ width: `${u.utilization}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
