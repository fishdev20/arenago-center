"use client";

import { ArrowUpRight, CalendarDays, ChartLine, Clock, MapPin, Rows, Tag } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { KpiIllustrationCard } from "./_components/kpi-illustration-card";
import { KpiSparkCard } from "./_components/kpi-spark-card";

type BookingStatus = "confirmed" | "completed" | "cancelled";

type Booking = {
  id: string;
  time: string;
  field: string;
  customer: string;
  status: BookingStatus;
  price: string;
};

const TODAY_BOOKINGS: Booking[] = [
  {
    id: "b1",
    time: "09:00–10:30",
    field: "Court 1",
    customer: "Minh Nguyen",
    status: "confirmed",
    price: "€30.00",
  },
  {
    id: "b2",
    time: "12:00–13:00",
    field: "Court 2",
    customer: "Anna",
    status: "completed",
    price: "€25.00",
  },
  {
    id: "b3",
    time: "18:00–19:00",
    field: "Court 1",
    customer: "John",
    status: "cancelled",
    price: "€0.00",
  },
];

const incomeData = [
  { x: "1", y: 10 },
  { x: "2", y: 18 },
  { x: "3", y: 14 },
  { x: "4", y: 22 },
  { x: "5", y: 16 },
  { x: "6", y: 24 },
];

const expenseData = [
  { x: "1", y: 12 },
  { x: "2", y: 15 },
  { x: "3", y: 14 },
  { x: "4", y: 20 },
  { x: "5", y: 17 },
  { x: "6", y: 13 },
];

function badgeVariant(status: BookingStatus) {
  if (status === "confirmed") return "default";
  if (status === "completed") return "secondary";
  return "outline";
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded bg-muted">
      <div
        className="h-2 rounded bg-primary"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export default function DashboardPageClient() {
  const kpis = React.useMemo(() => {
    return {
      revenue7d: 4010,
      bookings7d: 111,
      utilizationToday: 68,
      cancellations7d: 4,
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of bookings, revenue, and operations.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Revenue (7d)"
          value={`€${kpis.revenue7d.toLocaleString("en-US")}`}
          icon={<ChartLine className="h-4 w-4" />}
        />
        <KpiCard
          title="Bookings (7d)"
          value={String(kpis.bookings7d)}
          icon={<Rows className="h-4 w-4" />}
        />
        <KpiCard
          title="Utilization (today)"
          value={`${kpis.utilizationToday}%`}
          icon={<Clock className="h-4 w-4" />}
        />
        <KpiCard
          title="Cancellation rate"
          value={`${kpis.cancellations7d}%`}
          icon={<Tag className="h-4 w-4" />}
        />
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <KpiSparkCard
          title="Income this month"
          value="$5,280"
          deltaPct={12.2}
          deltaLabel="vs Last month"
          data={incomeData}
        />
        <KpiSparkCard
          title="Expense this month"
          value="$4,120"
          deltaPct={-12.2}
          deltaLabel="vs Last month"
          data={expenseData}
        />
        <KpiIllustrationCard
          title="Total orders"
          pill="Last Week"
          value="42.4k"
          deltaText="+10.8%"
          imageSrc="/images/illustrations/profile.svg"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* Today bookings */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Today’s bookings</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href="/center/bookings">
                View all <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {TODAY_BOOKINGS.map((b) => (
              <div key={b.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{b.time}</span>
                      <Badge variant={badgeVariant(b.status)}>{b.status}</Badge>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {b.field} • {b.customer}
                    </div>
                  </div>
                  <div className="shrink-0 text-sm font-medium">{b.price}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick actions + Utilization */}
        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild variant="outline" className="justify-start gap-2">
                <Link href="/center/calendar">
                  <CalendarDays className="h-4 w-4" />
                  Open calendar
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start gap-2">
                <Link href="/center/price-availability">
                  <Tag className="h-4 w-4" />
                  Update pricing & availability
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start gap-2">
                <Link href="/center/fields">
                  <MapPin className="h-4 w-4" />
                  Manage fields
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Today utilization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Booked vs available</div>
                <div className="text-sm font-medium">{kpis.utilizationToday}%</div>
              </div>
              <ProgressBar value={kpis.utilizationToday} />
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <MiniStat label="Booked hours" value="23.5h" />
                <MiniStat label="Available hours" value="11.0h" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Optional: section placeholders for later */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue trend</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Plug in your shadcn LineChart here (Analytics style).
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Peak hours</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Plug in your utilization heatmap here.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
