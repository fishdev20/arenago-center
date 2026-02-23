"use client";

import { Button } from "@/components/ui/button";
import { Calendar as DatePickerCalendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { PricingTimelinePreview } from "./pricing-timeline-preview";
import { TimePickerField } from "./time-pickers";
import { usePriceAvailabilityStore } from "./use-price-availability-store";

type TimelinePreview = {
  segments: {
    id: string;
    label: string;
    startMin: number;
    endMin: number;
    priceLabel: string;
    bgClass: string;
    textClass?: string;
  }[];
  legend: { label: string; dotClass: string }[];
  viewportStartMin: number;
  viewportEndMin: number;
  footer: string;
};

export function QuotePreviewCard({
  fields,
  quoteAvailability,
  onCalculateQuote,
  isCalculating,
  breakdown,
  timelinePreview,
}: {
  fields: { id: string; name: string }[];
  quoteAvailability: { startOptions: string[]; endOptions: string[]; hasOpenSlots: boolean };
  onCalculateQuote: (payload: {
    fieldId: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => Promise<void>;
  isCalculating: boolean;
  breakdown: {
    items: { label: string; price: number }[];
    total: number;
    winner: string | null;
    note: string | null;
  };
  timelinePreview: TimelinePreview | null;
}) {
  const quoteField = usePriceAvailabilityStore((s) => s.quoteField);
  const setQuoteField = usePriceAvailabilityStore((s) => s.setQuoteField);
  const quoteDate = usePriceAvailabilityStore((s) => s.quoteDate);
  const setQuoteDate = usePriceAvailabilityStore((s) => s.setQuoteDate);
  const quoteDatePickerOpen = usePriceAvailabilityStore((s) => s.quoteDatePickerOpen);
  const setQuoteDatePickerOpen = usePriceAvailabilityStore((s) => s.setQuoteDatePickerOpen);
  const startTime = usePriceAvailabilityStore((s) => s.startTime);
  const setStartTime = usePriceAvailabilityStore((s) => s.setStartTime);
  const endTime = usePriceAvailabilityStore((s) => s.endTime);
  const setEndTime = usePriceAvailabilityStore((s) => s.setEndTime);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Step 4 - Test quote</CardTitle>
        <p className="text-sm text-muted-foreground">Simulate a booking to verify which rule is selected.</p>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">SELECT FIELD</div>
          <Select value={quoteField} onValueChange={setQuoteField}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fields.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">SELECT DATE</div>
          <Popover open={quoteDatePickerOpen} onOpenChange={setQuoteDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {quoteDate ? format(new Date(`${quoteDate}T00:00:00`), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DatePickerCalendar
                mode="single"
                selected={quoteDate ? new Date(`${quoteDate}T00:00:00`) : undefined}
                onSelect={(date) => {
                  if (!date) return;
                  setQuoteDate(format(date, "yyyy-MM-dd"));
                  setQuoteDatePickerOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-row gap-2">
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">START TIME</div>
            <TimePickerField
              value={startTime}
              onChange={setStartTime}
              options={quoteAvailability.startOptions}
              disabled={!quoteAvailability.hasOpenSlots}
            />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">END TIME</div>
            <TimePickerField
              value={endTime}
              onChange={setEndTime}
              options={quoteAvailability.endOptions}
              disabled={!quoteAvailability.hasOpenSlots || quoteAvailability.endOptions.length === 0}
            />
          </div>
        </div>
        {!quoteAvailability.hasOpenSlots ? (
          <div className="text-xs text-amber-500">This field is closed on selected date. Pick another date.</div>
        ) : null}

        <Button
          onClick={() => onCalculateQuote({ fieldId: quoteField, date: quoteDate, startTime, endTime })}
          disabled={isCalculating || !quoteAvailability.hasOpenSlots || quoteAvailability.endOptions.length === 0}
          className="w-full"
        >
          {isCalculating ? "Calculating..." : "Calculate Quote"}
        </Button>

        <Separator />

        <div className="space-y-2">
          <div className="text-sm font-semibold">Price Breakdown</div>
          <div className="space-y-2 text-sm">
            {breakdown.items.map((x, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-muted-foreground">{x.label}</span>
                <span className="font-medium">EUR {x.price.toFixed(2)}</span>
              </div>
            ))}
            {breakdown.items.length === 0 ? <div className="text-muted-foreground">No matching active rule.</div> : null}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-semibold">Estimated Total</span>
            <span className="text-lg font-semibold text-primary">EUR {breakdown.total.toFixed(2)}</span>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Conflict resolved:</span>{" "}
            {breakdown.winner ? `"${breakdown.winner}" was selected by priority.` : "No rule matched the selected time range."}
            {breakdown.note ? ` ${breakdown.note}` : ""}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="text-sm font-semibold">Timeline preview</div>
          <PricingTimelinePreview
            title="Pricing timeline (opening hours)"
            segments={timelinePreview?.segments}
            legend={timelinePreview?.legend}
            viewportStartMin={timelinePreview?.viewportStartMin}
            viewportEndMin={timelinePreview?.viewportEndMin}
            footer={timelinePreview?.footer ?? "Previewing with active rules"}
          />
        </div>
      </CardContent>
    </Card>
  );
}
