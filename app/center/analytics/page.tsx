"use client";

import { TrendingUp } from "lucide-react";
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { FieldUtilizationHeatmap } from "./_components/field-utilization-heatmap";

type DailyMetric = {
  day: string;
  revenue: number;
  bookings: number;
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
    color: "var(--chart-1)",
  },
  bookings: {
    label: "Bookings",
    color: "var(--chart-1)",
  },
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig;

export default function AnalyticsPageClient() {
  const totals = React.useMemo(() => {
    const revenue = DAILY.reduce((s, x) => s + x.revenue, 0);
    const bookings = DAILY.reduce((s, x) => s + x.bookings, 0);
    const avg = bookings === 0 ? 0 : revenue / bookings;
    return { revenue, bookings, avg };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Track revenue, bookings, and field utilization.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Revenue (7d)" value={euro(totals.revenue)} />
        <Kpi title="Bookings (7d)" value={String(totals.bookings)} />
        <Kpi title="Avg. booking value" value={euro(Math.round(totals.avg))} />
        <Kpi title="Cancellation rate" value="4%" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* Revenue trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>

          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px]">
              <LineChart accessibilityLayer data={DAILY} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Line
                  dataKey="revenue"
                  type="natural"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>

          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium">
              Trending up by 5.2% <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Replace mock data with API later
            </div>
          </CardFooter>
        </Card>

        {/* Bookings by field */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings by field</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>

          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px]">
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
                  width={90}
                  tickFormatter={(value: string) =>
                    value.length > 10 ? `${value.slice(0, 10)}…` : value
                  }
                />
                <XAxis dataKey="bookings" type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Bar dataKey="bookings" layout="vertical" fill="var(--color-bookings)" radius={4}>
                  <LabelList
                    dataKey="field"
                    position="insideLeft"
                    offset={8}
                    className="fill-[var(--color-label)]"
                    fontSize={12}
                  />
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

      {/* Utilization */}
      <FieldUtilizationHeatmap />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Field utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
