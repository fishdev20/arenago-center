"use client";

import { addDays, format, startOfWeek } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Field = {
  id: string;
  name: string;
};

type BookingStatus = "confirmed" | "cancelled" | "completed";

type Booking = {
  id: string;
  fieldId: string;
  fieldName: string;
  customerName: string;
  startMin: number; // minutes from midnight
  endMin: number;
  status: BookingStatus;
  priceCents: number;
};

const FIELDS: Field[] = [
  { id: "all", name: "All fields" },
  { id: "f1", name: "Court 1" },
  { id: "f2", name: "Court 2" },
  { id: "f3", name: "สนาม 3" },
];

const MOCK_BOOKINGS: Booking[] = [
  {
    id: "b1",
    fieldId: "f1",
    fieldName: "Court 1",
    customerName: "Minh Nguyen",
    startMin: 9 * 60,
    endMin: 10 * 60 + 30,
    status: "confirmed",
    priceCents: 3000,
  },
  {
    id: "b2",
    fieldId: "f2",
    fieldName: "Court 2",
    customerName: "Anna",
    startMin: 12 * 60,
    endMin: 13 * 60,
    status: "completed",
    priceCents: 2500,
  },
  {
    id: "b3",
    fieldId: "f1",
    fieldName: "Court 1",
    customerName: "John",
    startMin: 18 * 60,
    endMin: 19 * 60,
    status: "cancelled",
    priceCents: 0,
  },
];

function minutesToTime(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function euro(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

function statusBadgeVariant(status: BookingStatus) {
  if (status === "confirmed") return "default";
  if (status === "completed") return "secondary";
  return "outline";
}

export default function CalendarPageClient() {
  const [view, setView] = React.useState<"day" | "week">("day");
  const [date, setDate] = React.useState<Date>(new Date());
  const [fieldId, setFieldId] = React.useState<string>("all");

  const bookings = React.useMemo(() => {
    if (fieldId === "all") return MOCK_BOOKINGS;
    return MOCK_BOOKINGS.filter((b) => b.fieldId === fieldId);
  }, [fieldId]);

  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekDays = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  return (
    <div className="space-y-4">
      {/* Page title row (inside page content, header actions are separate) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            View and manage bookings by time and field.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week")}>
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={fieldId} onValueChange={setFieldId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {FIELDS.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DatePicker value={date} onChange={setDate} />
        </div>
      </div>

      {/* Content */}
      <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week")}>
        <TabsContent value="day" className="mt-0">
          <DayGrid bookings={bookings} />
        </TabsContent>

        <TabsContent value="week" className="mt-0">
          <WeekList weekDays={weekDays} bookings={bookings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DatePicker({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarIcon className="h-4 w-4" />
          {format(value, "EEE, MMM d")}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="end">
        <Calendar mode="single" selected={value} onSelect={(d) => d && onChange(d)} initialFocus />
      </PopoverContent>
    </Popover>
  );
}

function DayGrid({ bookings }: { bookings: Booking[] }) {
  // Day view: 06:00 -> 23:00
  const start = 6 * 60;
  const end = 23 * 60;
  const total = end - start;

  return (
    <Card className="p-3">
      <div className="grid grid-cols-[72px_1fr] gap-3">
        {/* Time labels */}
        <div className="space-y-6 pt-2">
          {Array.from({ length: 18 }, (_, i) => 6 + i).map((h) => (
            <div key={h} className="text-xs text-muted-foreground">
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* Grid area */}
        <div className="relative h-[720px] rounded-md border bg-background">
          {/* hour lines */}
          {Array.from({ length: 18 }, (_, i) => i).map((i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t"
              style={{ top: `${(i / 18) * 100}%` }}
            />
          ))}

          {/* bookings */}
          {bookings.map((b) => {
            const top = ((b.startMin - start) / total) * 100;
            const height = ((b.endMin - b.startMin) / total) * 100;

            const hidden = b.endMin <= start || b.startMin >= end;
            if (hidden) return null;

            return (
              <div
                key={b.id}
                className="absolute left-3 right-3 rounded-md border bg-muted px-3 py-2 text-sm shadow-sm"
                style={{
                  top: `${top}%`,
                  height: `${height}%`,
                  minHeight: 44,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{b.customerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {b.fieldName} • {minutesToTime(b.startMin)}–{minutesToTime(b.endMin)}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={statusBadgeVariant(b.status)}>{b.status}</Badge>
                    <div className="text-xs text-muted-foreground">{euro(b.priceCents)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function WeekList({ weekDays, bookings }: { weekDays: Date[]; bookings: Booking[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {weekDays.map((d) => (
        <Card key={d.toISOString()} className="p-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">{format(d, "EEEE")}</div>
            <div className="text-sm text-muted-foreground">{format(d, "MMM d")}</div>
          </div>

          <div className="mt-3 space-y-2">
            {/* MVP: show same mocked bookings for each day */}
            {bookings.slice(0, 3).map((b) => (
              <div
                key={`${d.toISOString()}-${b.id}`}
                className="rounded-md border bg-muted/50 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{b.customerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {b.fieldName} • {minutesToTime(b.startMin)}–{minutesToTime(b.endMin)}
                    </div>
                  </div>
                  <Badge variant={statusBadgeVariant(b.status)}>{b.status}</Badge>
                </div>
              </div>
            ))}

            {bookings.length === 0 && (
              <div className="text-sm text-muted-foreground">No bookings</div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
