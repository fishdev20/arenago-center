"use client";

import { format } from "date-fns";
import { CalendarIcon, Filter, Search } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type Status = "all" | "confirmed" | "completed" | "cancelled";

const FIELDS = [
  { id: "all", name: "All fields" },
  { id: "f1", name: "Court 1" },
  { id: "f2", name: "Court 2" },
  { id: "f3", name: "Field 3" },
];

export default function BookingsActions() {
  const [query, setQuery] = React.useState("");
  const [fieldId, setFieldId] = React.useState("all");
  const [status, setStatus] = React.useState<Status>("all");
  const [from, setFrom] = React.useState<Date | undefined>(new Date());
  const [to, setTo] = React.useState<Date | undefined>(undefined);
  const [open, setOpen] = React.useState(false);

  function onManualBooking() {
    // TODO: open modal
    alert("Open Manual Booking modal (TODO)");
  }

  const content = (
    <ActionsContent
      query={query}
      onQueryChange={setQuery}
      fieldId={fieldId}
      onFieldChange={setFieldId}
      status={status}
      onStatusChange={setStatus}
      from={from}
      to={to}
      onFromChange={setFrom}
      onToChange={setTo}
      onManualBooking={() => {
        onManualBooking();
        setOpen(false);
      }}
      onClear={() => {
        setQuery("");
        setFieldId("all");
        setStatus("all");
        setFrom(undefined);
        setTo(undefined);
      }}
    />
  );

  return (
    <div className="flex items-center gap-2">
      {/* Desktop / tablet: inline actions */}
      <div className="hidden xl:flex items-center gap-2">{content}</div>

      {/* Mobile: open Sheet */}
      <div className="xl:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Actions
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[340px] sm:w-[420px]">
            <SheetHeader>
              <SheetTitle>Bookings actions</SheetTitle>
            </SheetHeader>

            <div className="mt-4">{content}</div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

function ActionsContent({
  query,
  onQueryChange,
  fieldId,
  onFieldChange,
  status,
  onStatusChange,
  from,
  to,
  onFromChange,
  onToChange,
  onManualBooking,
  onClear,
}: {
  query: string;
  onQueryChange: (v: string) => void;

  fieldId: string;
  onFieldChange: (v: string) => void;

  status: Status;
  onStatusChange: (v: Status) => void;

  from?: Date;
  to?: Date;
  onFromChange: (d?: Date) => void;
  onToChange: (d?: Date) => void;

  onManualBooking: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center gap-3 md:gap-2">
      {/* Search */}
      <div className="relative w-full md:w-auto">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search customer..."
          className="h-9 w-full md:w-[220px] pl-8"
        />
      </div>

      {/* Date range */}
      <DateRangeButton from={from} to={to} onChangeFrom={onFromChange} onChangeTo={onToChange} />

      {/* Field */}
      <Select value={fieldId} onValueChange={onFieldChange}>
        <SelectTrigger className="h-9 w-full md:w-[160px]">
          <SelectValue placeholder="Field" />
        </SelectTrigger>
        <SelectContent>
          {FIELDS.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              {f.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select value={status} onValueChange={(v) => onStatusChange(v as Status)}>
        <SelectTrigger className="h-9 w-full md:w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {/* Actions */}
      <div className="flex items-center gap-2 md:ml-2">
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear
        </Button>
        <Button size="sm" onClick={onManualBooking}>
          Manual booking
        </Button>
      </div>
    </div>
  );
}

function DateRangeButton({
  from,
  to,
  onChangeFrom,
  onChangeTo,
}: {
  from?: Date;
  to?: Date;
  onChangeFrom: (d?: Date) => void;
  onChangeTo: (d?: Date) => void;
}) {
  const label = React.useMemo(() => {
    if (!from) return "Pick dates";
    if (!to) return `${format(from, "MMM d")} → …`;
    return `${format(from, "MMM d")} → ${format(to, "MMM d")}`;
  }, [from, to]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 w-full md:w-auto justify-start gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-3" align="end">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">From</div>
            <Calendar mode="single" selected={from} onSelect={onChangeFrom} initialFocus />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">To</div>
            <Calendar mode="single" selected={to} onSelect={onChangeTo} />
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onChangeFrom(undefined);
              onChangeTo(undefined);
            }}
          >
            Clear dates
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
