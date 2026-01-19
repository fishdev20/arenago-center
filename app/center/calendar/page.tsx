"use client";

import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, Mail, Phone, Plus, Search, Wrench, X } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type BookingStatus = "confirmed" | "completed" | "maintenance";

type Booking = {
  id: string;
  title: string;
  field: string;
  date: string; // YYYY-MM-DD
  startMin: number; // minutes from 00:00
  endMin: number;
  status: BookingStatus;
  price: number;
  customerName: string;
  phone?: string;
  email?: string;
  notes?: string;
};

type FieldCol = { id: string; name: string };

const FIELDS: FieldCol[] = [
  { id: "f1", name: "FIELD 1 - TURF" },
  { id: "f2", name: "FIELD 2 - INDOOR" },
  { id: "f3", name: "COURT 1 - BASKETBALL" },
];

const TODAY = "2023-10-24";

const BOOKINGS: Booking[] = [
  {
    id: "b1",
    title: "FC Tigers Training",
    field: "f1",
    date: TODAY,
    startMin: 8 * 60 + 30,
    endMin: 10 * 60,
    status: "confirmed",
    price: 120,
    customerName: "FC Tigers",
    phone: "+1 (555) 098-7654",
    email: "contact@fctigers.com",
    notes: "Bring cones + bibs",
  },
  {
    id: "b2",
    title: "Youth Soccer Session",
    field: "f2",
    date: TODAY,
    startMin: 9 * 60,
    endMin: 11 * 60,
    status: "completed",
    price: 140,
    customerName: "Youth Academy",
    phone: "+1 (555) 098-7654",
    email: "contact@elitestrikers.com",
  },
  {
    id: "b3",
    title: "Elite Strikers Academy",
    field: "f1",
    date: TODAY,
    startMin: 11 * 60,
    endMin: 13 * 60,
    status: "confirmed",
    price: 140,
    customerName: "Elite Strikers Academy",
    phone: "+1 (555) 098-7654",
    email: "contact@elitestrikers.com",
    notes: "Customer will arrive 10 min early",
  },
  {
    id: "m1",
    title: "Maintenance",
    field: "f3",
    date: TODAY,
    startMin: 11 * 60,
    endMin: 13 * 60,
    status: "maintenance",
    price: 0,
    customerName: "Internal",
    notes: "Replace net + clean floor",
  },
];

function mmToTime(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function minutesToLabel(min: number) {
  // 11:00 AM style (simple)
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const isPm = h24 >= 12;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${isPm ? "PM" : "AM"}`;
}

function statusStyles(status: BookingStatus) {
  if (status === "confirmed") {
    return "bg-primary text-primary-foreground border-primary/30";
  }
  if (status === "completed") {
    return "bg-emerald-500 text-white border-emerald-500/30";
  }
  return "bg-muted text-foreground border-border border-dashed";
}

function statusBadge(status: BookingStatus) {
  if (status === "confirmed") return <Badge>Confirmed</Badge>;
  if (status === "completed") return <Badge className="bg-emerald-500 text-white">Completed</Badge>;
  return <Badge variant="secondary">Maintenance</Badge>;
}

const START_HOUR = 7;
const END_HOUR = 20;
const ROWS = (END_HOUR - START_HOUR) * 2; // 30-min slots
const SLOT_MIN = 30;
const GRID_MINUTES = (END_HOUR - START_HOUR) * 60;

function yFromMin(min: number) {
  // relative to START_HOUR
  return ((min - START_HOUR * 60) / GRID_MINUTES) * 100;
}
function hFromRange(startMin: number, endMin: number) {
  return ((endMin - startMin) / GRID_MINUTES) * 100;
}

export default function CalendarPageClient() {
  const [view, setView] = React.useState<"day" | "week" | "month">("day");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Booking | null>(null);
  const [openSheet, setOpenSheet] = React.useState(false);

  const [currentDate, setCurrentDate] = React.useState(() => new Date(TODAY));

  const titleDate = React.useMemo(() => {
    if (view === "day") return format(currentDate, "EEEE, MMM d, yyyy");
    if (view === "week") {
      const s = startOfWeek(currentDate, { weekStartsOn: 1 });
      const e = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(s, "MMM d")} - ${format(e, "MMM d, yyyy")}`;
    }
    return format(currentDate, "MMMM yyyy");
  }, [currentDate, view]);

  function onPrev() {
    setSelected(null);
    if (view === "day") setCurrentDate((d) => addDays(d, -1));
    else if (view === "week") setCurrentDate((d) => addWeeks(d, -1));
    else setCurrentDate((d) => addMonths(d, -1));
  }

  function onNext() {
    setSelected(null);
    if (view === "day") setCurrentDate((d) => addDays(d, 1));
    else if (view === "week") setCurrentDate((d) => addWeeks(d, 1));
    else setCurrentDate((d) => addMonths(d, 1));
  }

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();

    // date range by view
    const rangeStart =
      view === "day"
        ? currentDate
        : view === "week"
          ? startOfWeek(currentDate, { weekStartsOn: 1 })
          : startOfMonth(currentDate);

    const rangeEnd =
      view === "day"
        ? currentDate
        : view === "week"
          ? endOfWeek(currentDate, { weekStartsOn: 1 })
          : endOfMonth(currentDate);

    return BOOKINGS.filter((b) => {
      const d = new Date(b.date);

      const inRange = view === "day" ? isSameDay(d, currentDate) : d >= rangeStart && d <= rangeEnd;

      if (!inRange) return false;

      if (!q) return true;

      return (
        b.title.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        (FIELDS.find((f) => f.id === b.field)
          ?.name.toLowerCase()
          .includes(q) ??
          false)
      );
    });
  }, [query, currentDate, view]);

  const totalBookings = filtered.filter((b) => b.status !== "maintenance").length;
  const occupancy = 78; // mock

  function openDetails(b: Booking) {
    setSelected(b);
    if (window.matchMedia("(max-width: 1279px)").matches) {
      setOpenSheet(true);
    }
  }

  return (
    <div className="space-y-3">
      {/* Toolbar (sticky feel) */}
      <Card className="p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Prev" onClick={onPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="icon" aria-label="Next" onClick={onNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Tabs
              value={view}
              onValueChange={(v) => {
                setSelected(null);
                setOpenSheet(false);
                setView(v as any);
              }}
            >
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
                placeholder="Search bookings..."
              />
            </div>

            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Booking
            </Button>
          </div>
        </div>

        <Separator className="my-3" />

        {/* Stats + legend row */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="text-muted-foreground">
              <span className="font-semibold text-foreground">TOTAL BOOKINGS:</span> {totalBookings}
            </div>
            <div className="text-muted-foreground">
              <span className="font-semibold text-foreground">OCCUPANCY:</span> {occupancy}%
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <LegendDot className="bg-primary" label="Confirmed" />
            <LegendDot className="bg-emerald-500" label="Completed" />
            <LegendDot className="bg-muted-foreground/40" label="Maintenance" />
          </div>
        </div>
      </Card>

      {/* Main content: Scheduler + Details */}
      <div
        className={["grid gap-3", selected ? "xl:grid-cols-[1fr_380px]" : "xl:grid-cols-1"].join(
          " ",
        )}
      >
        {/* Scheduler */}
        <Card className="overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {view === "day" ? (
            <DayView fields={FIELDS} bookings={filtered} onOpen={openDetails} />
          ) : view === "week" ? (
            <WeekView
              fields={FIELDS}
              bookings={filtered}
              weekStart={startOfWeek(currentDate, { weekStartsOn: 1 })}
              onOpen={openDetails}
            />
          ) : (
            <MonthView
              fields={FIELDS}
              bookings={filtered}
              currentDate={currentDate}
              onSelectDay={(d) => {
                setView("day");
                setCurrentDate(d);
              }}
              onOpen={openDetails}
            />
          )}
        </Card>

        {/* Details panel (desktop: show card; mobile: use sheet) */}
        {selected ? (
          <div className="hidden xl:block">
            <BookingDetailsCard booking={selected} onClear={() => setSelected(null)} />
          </div>
        ) : null}

        {/* Mobile/Tablet: Sheet */}
        <div className="xl:hidden">
          <Sheet open={openSheet} onOpenChange={setOpenSheet}>
            <SheetContent side="right" className="w-full sm:w-[420px] p-0">
              <BookingDetailsSheet booking={selected} onClose={() => setOpenSheet(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

function DayView({
  fields,
  bookings,
  onOpen,
}: {
  fields: FieldCol[];
  bookings: Booking[];
  onOpen: (b: Booking) => void;
}) {
  return (
    <>
      {/* Column headers */}
      <div className="grid grid-cols-[72px_repeat(3,1fr)] border-b bg-card">
        <div className="px-3 py-2 text-xs text-muted-foreground">Time</div>
        {fields.map((f) => (
          <div key={f.id} className="px-3 py-2 text-xs font-semibold">
            {f.name}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="relative grid grid-cols-[72px_repeat(3,1fr)]">
        {/* Time column */}
        <div className="relative border-r">
          {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i).map((h) => (
            <div key={h} className="h-14 border-b px-3 pt-2 text-xs text-muted-foreground">
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* Field columns */}
        {fields.map((f) => (
          <div key={f.id} className="relative border-r last:border-r-0">
            {/* background lines: 30-min */}
            <div className="absolute inset-0">
              {Array.from({ length: ROWS }, (_, i) => (
                <div
                  key={i}
                  className={[
                    "h-7",
                    "border-b",
                    i % 2 === 0 ? "border-border/70" : "border-border/40",
                  ].join(" ")}
                />
              ))}
            </div>

            {/* booking blocks */}
            <div className="absolute inset-0">
              {bookings
                .filter((b) => b.field === f.id)
                .map((b) => {
                  const top = yFromMin(b.startMin);
                  const height = hFromRange(b.startMin, b.endMin);

                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => onOpen(b)}
                      className={[
                        "absolute left-2 right-2 rounded-lg border p-3 text-left shadow-sm transition",
                        "hover:brightness-105",
                        statusStyles(b.status),
                      ].join(" ")}
                      style={{ top: `${top}%`, height: `${height}%` }}
                    >
                      <div className="text-xs opacity-90">
                        {mmToTime(b.startMin)} - {mmToTime(b.endMin)}
                      </div>
                      <div className="mt-1 truncate text-sm font-semibold">{b.title}</div>

                      <div className="mt-2 flex items-center justify-between text-xs opacity-90">
                        {b.status === "maintenance" ? (
                          <span className="inline-flex items-center gap-1">
                            <Wrench className="h-3.5 w-3.5" />
                            Maintenance
                          </span>
                        ) : (
                          <span>${b.price.toFixed(2)}</span>
                        )}

                        {b.status === "completed" ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-white/80" />
                            Checked-in
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function WeekView({
  fields,
  bookings,
  weekStart,
  onOpen,
}: {
  fields: FieldCol[];
  bookings: Booking[];
  weekStart: Date;
  onOpen: (b: Booking) => void;
}) {
  const days = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  return (
    <div className="overflow-auto">
      <div className="min-w-[980px]">
        {/* Header: days */}
        <div className="grid grid-cols-[240px_repeat(7,1fr)] border-b bg-card">
          <div className="px-3 py-3 text-xs font-medium text-muted-foreground">Field</div>
          {days.map((d) => (
            <div key={d.toISOString()} className="px-3 py-3">
              <div className="text-xs text-muted-foreground">{format(d, "EEE")}</div>
              <div className="text-sm font-semibold">{format(d, "MMM d")}</div>
            </div>
          ))}
        </div>

        {/* Rows: fields */}
        {fields.map((f) => (
          <div key={f.id} className="grid grid-cols-[240px_repeat(7,1fr)] border-b last:border-b-0">
            <div className="border-r px-3 py-3">
              <div className="text-sm font-semibold">{f.name}</div>
              <div className="text-xs text-muted-foreground">Weekly overview</div>
            </div>

            {days.map((d) => {
              const dayStr = format(d, "yyyy-MM-dd");
              const items = bookings
                .filter((b) => b.field === f.id && b.date === dayStr)
                .sort((a, b) => a.startMin - b.startMin);

              return (
                <div key={dayStr} className="border-r last:border-r-0 p-2">
                  {items.length === 0 ? (
                    <div className="h-[84px] rounded-lg border border-dashed bg-muted/20" />
                  ) : (
                    <div className="space-y-2">
                      {items.slice(0, 3).map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => onOpen(b)}
                          className={[
                            "w-full rounded-lg border px-2 py-2 text-left text-xs shadow-sm transition",
                            "hover:brightness-105",
                            statusStyles(b.status),
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-semibold">{b.title}</span>
                            <span className="opacity-90">
                              {mmToTime(b.startMin)}-{mmToTime(b.endMin)}
                            </span>
                          </div>
                        </button>
                      ))}

                      {items.length > 3 ? (
                        <div className="text-xs text-muted-foreground">
                          +{items.length - 3} more
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthView({
  fields,
  bookings,
  currentDate,
  onSelectDay,
  onOpen,
}: {
  fields: FieldCol[];
  bookings: Booking[];
  currentDate: Date;
  onSelectDay: (d: Date) => void;
  onOpen: (b: Booking) => void;
}) {
  const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });

  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);

  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="p-3">
      <div className="grid grid-cols-7 gap-2">
        {weekday.map((w) => (
          <div key={w} className="px-2 py-1 text-xs font-medium text-muted-foreground">
            {w}
          </div>
        ))}

        {days.map((d) => {
          const dayStr = format(d, "yyyy-MM-dd");
          const dayBookings = bookings
            .filter((b) => b.date === dayStr)
            .sort((a, b) => a.startMin - b.startMin);

          const inMonth = isSameMonth(d, currentDate);
          return (
            <div
              key={dayStr}
              className={[
                "min-h-[120px] rounded-xl border p-2 transition",
                inMonth ? "bg-card" : "bg-muted/20 text-muted-foreground",
                isSameDay(d, new Date(TODAY)) ? "ring-1 ring-primary/40" : "",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={() => onSelectDay(d)}
                className="flex w-full items-center justify-between"
              >
                <span className={["text-sm font-semibold", inMonth ? "" : "opacity-70"].join(" ")}>
                  {format(d, "d")}
                </span>

                {dayBookings.length ? (
                  <Badge variant="secondary" className="text-[11px]">
                    {dayBookings.length}
                  </Badge>
                ) : null}
              </button>

              <div className="mt-2 space-y-1">
                {dayBookings.slice(0, 3).map((b) => {
                  const fieldName = fields.find((f) => f.id === b.field)?.name ?? b.field;

                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => onOpen(b)}
                      className={[
                        "w-full rounded-md border px-2 py-1 text-left text-[11px] shadow-sm transition",
                        "hover:brightness-105",
                        statusStyles(b.status),
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold">{b.title}</span>
                        <span className="opacity-90">{mmToTime(b.startMin)}</span>
                      </div>
                      <div className="mt-0.5 truncate opacity-90">{fieldName}</div>
                    </button>
                  );
                })}

                {dayBookings.length > 3 ? (
                  <div className="text-[11px] text-muted-foreground">
                    +{dayBookings.length - 3} more
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={["h-2.5 w-2.5 rounded-full", className].join(" ")} />
      <span>{label}</span>
    </div>
  );
}

function BookingDetailsCard({
  booking,
  onClear,
}: {
  booking: Booking | null;
  onClear: () => void;
}) {
  return (
    <Card className="h-full">
      <div className="flex items-center justify-between border-b p-4">
        <div className="text-base font-semibold">Booking Details</div>
        <Button variant="ghost" size="icon" onClick={onClear} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="p-4">
          <DetailsContent booking={booking} />
        </div>
      </ScrollArea>

      <DetailsFooter booking={booking} />
    </Card>
  );
}

function BookingDetailsSheet({
  booking,
  onClose,
}: {
  booking: Booking | null;
  onClose: () => void;
}) {
  return (
    <div className="h-full">
      <SheetHeader className="flex flex-row items-center justify-between border-b p-4">
        <SheetTitle>Booking Details</SheetTitle>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </SheetHeader>

      <ScrollArea className="h-[calc(100vh-10.5rem)]">
        <div className="p-4">
          <DetailsContent booking={booking} />
        </div>
      </ScrollArea>

      <DetailsFooter booking={booking} />
    </div>
  );
}

function DetailsContent({ booking }: { booking: Booking | null }) {
  if (!booking) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        Select a booking block to view details.
      </div>
    );
  }

  const fieldName = FIELDS.find((f) => f.id === booking.field)?.name ?? "Unknown field";

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold">{booking.customerName}</div>
        <div className="text-sm text-muted-foreground">Booking ID: #{booking.id}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Info label="Status" value={statusBadge(booking.status)} />
        <Info label="Field" value={<div className="text-sm font-medium">{fieldName}</div>} />
        <Info label="Date" value={<div className="text-sm font-medium">Oct 24, 2023</div>} />
        <Info
          label="Time"
          value={
            <div className="text-sm font-medium">
              {minutesToLabel(booking.startMin)} - {minutesToLabel(booking.endMin)}
            </div>
          }
        />
      </div>

      <Card className="p-3">
        <div className="space-y-2 text-sm">
          {booking.phone ? (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{booking.phone}</span>
            </div>
          ) : null}
          {booking.email ? (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{booking.email}</span>
            </div>
          ) : null}
        </div>
      </Card>

      <div className="space-y-2">
        <div className="text-sm font-semibold">Payment Summary</div>
        <div className="text-sm text-muted-foreground">
          Base Rate ({(booking.endMin - booking.startMin) / 60} hrs)
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold">
            {booking.status === "maintenance" ? "—" : `$${booking.price.toFixed(2)}`}
          </span>
        </div>
        {booking.status !== "maintenance" ? (
          <Badge className="bg-emerald-500 text-white">Fully Paid</Badge>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">Internal Notes</div>
        <Textarea placeholder="Add notes for staff..." defaultValue={booking.notes ?? ""} />
      </div>
    </div>
  );
}

function DetailsFooter({ booking }: { booking: Booking | null }) {
  return (
    <div className="border-t p-4">
      <div className="grid grid-cols-3 gap-2">
        <Button disabled={!booking || booking.status !== "confirmed"} className="col-span-2">
          Check-in
        </Button>
        <Button variant="outline" disabled={!booking}>
          Edit
        </Button>
      </div>

      <div className="mt-2">
        <Button variant="destructive" className="w-full" disabled={!booking}>
          Delete
        </Button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div>{value}</div>
    </div>
  );
}
