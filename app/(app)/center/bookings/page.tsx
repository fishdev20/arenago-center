"use client";

import {
  BadgeCheck,
  Calendar,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock,
  MoreVertical,
  Search,
  XCircle,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";

type Booking = {
  id: string;
  date: string; // yyyy-mm-dd
  time: string; // 09:00–10:30
  customer: { name: string; email: string };
  field: { name: string; color: "blue" | "purple" | "green" };
  status: BookingStatus;
  price: number;
};

const MOCK_BOOKINGS: Booking[] = [
  {
    id: "1",
    date: "2026-01-12",
    time: "09:00 AM – 10:30 AM",
    customer: { name: "Minh Nguyen", email: "minh@example.com" },
    field: { name: "Soccer Pitch A", color: "blue" },
    status: "confirmed",
    price: 45,
  },
  {
    id: "2",
    date: "2026-01-12",
    time: "11:00 AM – 12:00 PM",
    customer: { name: "Anna Svensson", email: "anna@gmail.com" },
    field: { name: "Padel Court 2", color: "purple" },
    status: "pending",
    price: 30,
  },
  {
    id: "3",
    date: "2026-01-12",
    time: "02:00 PM – 04:00 PM",
    customer: { name: "John Doe", email: "john@outlook.com" },
    field: { name: "Main Gym Floor", color: "green" },
    status: "cancelled",
    price: 20,
  },
  {
    id: "4",
    date: "2026-01-11",
    time: "06:00 PM – 07:30 PM",
    customer: { name: "Robert Wilson", email: "rwilson@corp.com" },
    field: { name: "Soccer Pitch A", color: "blue" },
    status: "completed",
    price: 45,
  },
];

function formatDateLabel(date: string) {
  // Keep simple; replace with date-fns later if you want.
  // Input: 2026-01-12 → Jan 12, 2026
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

function FieldPill({ name, color }: { name: string; color: Booking["field"]["color"] }) {
  const cls =
    color === "blue"
      ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900"
      : color === "purple"
        ? "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900"
        : "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900";

  return (
    <Badge variant="outline" className={`rounded-full px-2.5 py-1 text-xs ${cls}`}>
      {name}
    </Badge>
  );
}

function StatusPill({ status }: { status: BookingStatus }) {
  const config = {
    confirmed: {
      label: "Confirmed",
      icon: CheckCircle2,
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
    },
    pending: {
      label: "Pending",
      icon: Clock,
      className:
        "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
    },
    cancelled: {
      label: "Cancelled",
      icon: XCircle,
      className:
        "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
    },
    completed: {
      label: "Completed",
      icon: BadgeCheck,
      className:
        "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
    },
  }[status];

  const Icon = config.icon;
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}

function Stat({
  title,
  value,
  delta,
  deltaUp,
  icon,
}: {
  title: string;
  value: string;
  delta: string;
  deltaUp: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-muted-foreground">{title}</div>
          <div className="mt-1 text-2xl font-semibold leading-none">{value}</div>
          <div className="mt-2 text-xs">
            <span className={deltaUp ? "text-emerald-600" : "text-red-600"}>
              {deltaUp ? "↑" : "↓"} {delta}
            </span>
          </div>
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
    </Card>
  );
}

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  // simple pagination like screenshot (1 2 3 … 12)
  const pages: (number | "dots")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3, "dots", totalPages);
  }

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        ← Previous
      </Button>

      <div className="flex items-center gap-1">
        {pages.map((p, idx) =>
          p === "dots" ? (
            <span key={`dots-${idx}`} className="px-2 text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={p}
              size="sm"
              variant={p === page ? "default" : "ghost"}
              className={p === page ? "h-8 w-8 p-0" : "h-8 w-8 p-0"}
              onClick={() => onPage(p)}
            >
              {p}
            </Button>
          ),
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        Next →
      </Button>
    </div>
  );
}

export default function BookingsTable() {
  const [status, setStatus] = React.useState<string>("all");
  const [field, setField] = React.useState<string>("all");
  const [range, setRange] = React.useState<string>("today");
  const [page, setPage] = React.useState(1);

  const PAGE_SIZE = 10;

  const filtered = React.useMemo(() => {
    return MOCK_BOOKINGS.filter((b) => {
      const okStatus = status === "all" ? true : b.status === status;
      const okField = field === "all" ? true : b.field.name === field;
      // range is mocked; wire later
      const okRange = !!range;
      return okStatus && okField && okRange;
    });
  }, [status, field, range]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  React.useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  // “enhanced” stats (mock)
  const totalBookingsToday = 42;
  const occupancyRate = 85;
  const revenueToday = 1240;

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Stat
          title="Total Bookings Today"
          value={String(totalBookingsToday)}
          delta="12%"
          deltaUp
          icon={<Calendar className="h-4 w-4" />}
        />
        <Stat
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          delta="2%"
          deltaUp={false}
          icon={<Search className="h-4 w-4" />}
        />
        <Stat
          title="Revenue Today"
          value={`$${revenueToday.toLocaleString()}`}
          delta="5%"
          deltaUp
          icon={<CircleDollarSign className="h-4 w-4" />}
        />
      </div>

      {/* Table card */}
      <Card className="overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-col gap-2 p-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={field} onValueChange={setField}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Fields" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                {Array.from(new Set(MOCK_BOOKINGS.map((b) => b.field.name))).map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="secondary" className="w-full sm:w-auto justify-between gap-2">
              <Calendar className="h-4 w-4" />
              Select Date Range
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </div>

          <div className="text-xs text-muted-foreground md:text-sm">
            Showing <span className="font-medium text-foreground">{paged.length}</span> of{" "}
            <span className="font-medium text-foreground">{filtered.length}</span> bookings
          </div>
        </div>

        <Separator />

        {/* Horizontal scroll on small screens */}
        <div className="w-full overflow-x-auto md:overflow-x-visible">
          <Table className="min-w-[860px] md:min-w-0">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">DATE &amp; TIME</TableHead>
                <TableHead>FIELD</TableHead>
                <TableHead>CUSTOMER</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>PRICE</TableHead>
                <TableHead className="text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paged.map((b) => (
                <TableRow key={b.id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="font-medium">{formatDateLabel(b.date)}</div>
                    <div className="text-xs text-muted-foreground">{b.time}</div>
                  </TableCell>

                  <TableCell>
                    <FieldPill name={b.field.name} color={b.field.color} />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {initials(b.customer.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{b.customer.name}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {b.customer.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <StatusPill status={b.status} />
                  </TableCell>

                  <TableCell className="font-medium">${b.price.toFixed(2)}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="sr-only">Confirm</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
                      >
                        <Calendar className="h-4 w-4" />
                        <span className="sr-only">Reschedule</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
                      >
                        <XCircle className="h-4 w-4" />
                        <span className="sr-only">Cancel</span>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">More</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Send receipt</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No bookings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Separator />

        {/* Pagination */}
        <div className="px-3">
          <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
        </div>
      </Card>
    </div>
  );
}
