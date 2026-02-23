"use client";

import { Button } from "@/components/ui/button";
import { Calendar as DatePickerCalendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

const TIME_OPTIONS = Array.from({ length: 96 }).map((_, index) => {
  const hours = Math.floor(index / 4);
  const minutes = (index % 4) * 15;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

function parseLocalDateTime(value: string) {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

export function normalizeTime(value: string) {
  return (value || "").slice(0, 5);
}

export function TimePickerField({
  value,
  onChange,
  className,
  options,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  options?: string[];
  disabled?: boolean;
}) {
  const normalized = normalizeTime(value) || "08:00";
  const renderOptions = options && options.length > 0 ? options : TIME_OPTIONS;

  return (
    <Select value={normalized} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select time" />
      </SelectTrigger>
      <SelectContent>
        {renderOptions.map((time) => (
          <SelectItem key={time} value={time}>
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function DateTimePickerField({
  value,
  onChange,
  placeholder = "Pick date & time",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = parseLocalDateTime(value);
  const timeValue = normalizeTime(value?.slice(11, 16)) || "09:00";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "PPP HH:mm") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto space-y-3 p-3" align="start">
        <DatePickerCalendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) return;
            const day = format(date, "yyyy-MM-dd");
            onChange(`${day}T${timeValue}`);
          }}
        />
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Time</Label>
          <TimePickerField
            value={timeValue}
            onChange={(nextTime) => {
              const day = selected ? format(selected, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
              onChange(`${day}T${nextTime}`);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
