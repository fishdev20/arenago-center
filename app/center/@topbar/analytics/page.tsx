"use client";

import { format } from "date-fns";
import { CalendarIcon, Download } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function AnalyticsHeaderActions() {
  const [from, setFrom] = React.useState<Date | undefined>(new Date());
  const [to, setTo] = React.useState<Date | undefined>(undefined);

  const label = React.useMemo(() => {
    if (!from) return "Pick dates";
    if (!to) return `${format(from, "MMM d")} → …`;
    return `${format(from, "MMM d")} → ${format(to, "MMM d")}`;
  }, [from, to]);

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">Dates</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-3" align="end">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">From</div>
              <Calendar mode="single" selected={from} onSelect={setFrom} initialFocus />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">To</div>
              <Calendar mode="single" selected={to} onSelect={setTo} />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button size="sm" className="gap-2">
        <Download className="h-4 w-4" />
        Export
      </Button>
    </div>
  );
}
