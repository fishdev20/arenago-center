"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import * as React from "react";
import { PricingTimelinePreview } from "./_components/pricing-timeline-preview";

type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

type Field = { id: string; name: string };

type PriceRule = {
  id: string;
  enabled: boolean;
  name: string;
  appliesTo: "all" | string[]; // field ids
  days: "Daily" | "Weekdays" | "Weekend" | "Specific dates";
  timeRange: string; // "08:00 - 22:00"
  pricePerHour: number;
  priority: number;
};

type Override = {
  id: string;
  dateTime: string; // display string
  scope: "Center-wide" | string; // field name
  status: "BLOCK" | "OPEN";
  reason: string;
};

const FIELDS: Field[] = [
  { id: "f1", name: "Field 1 (Turf)" },
  { id: "f2", name: "Field 2 (Indoor)" },
  { id: "f3", name: "Court 1 (Basketball)" },
];

const RULES_INIT: PriceRule[] = [
  {
    id: "r1",
    enabled: true,
    name: "Holiday Special",
    appliesTo: "all",
    days: "Specific dates",
    timeRange: "00:00 - 23:59",
    pricePerHour: 65,
    priority: 1000,
  },
  {
    id: "r2",
    enabled: true,
    name: "Weekend Prime",
    appliesTo: ["f1", "f2"],
    days: "Weekend",
    timeRange: "08:00 - 22:00",
    pricePerHour: 55,
    priority: 800,
  },
  {
    id: "r3",
    enabled: true,
    name: "Weekday Morning",
    appliesTo: "all",
    days: "Weekdays",
    timeRange: "06:00 - 10:00",
    pricePerHour: 35,
    priority: 500,
  },
  {
    id: "r4",
    enabled: true,
    name: "Standard Base",
    appliesTo: "all",
    days: "Daily",
    timeRange: "00:00 - 23:59",
    pricePerHour: 45,
    priority: 100,
  },
];

const OVERRIDES_INIT: Override[] = [
  {
    id: "o1",
    dateTime: "Dec 24, 2026 • 08:00 AM - 12:00 PM",
    scope: "Center-wide",
    status: "BLOCK",
    reason: "Christmas Eve shortened hours",
  },
  {
    id: "o2",
    dateTime: "Jan 15, 2027 • All day",
    scope: "Field 1 (Turf)",
    status: "BLOCK",
    reason: "Turf maintenance",
  },
  {
    id: "o3",
    dateTime: "Feb 14, 2027 • 06:00 PM - 11:59 PM",
    scope: "Center-wide",
    status: "OPEN",
    reason: "Late night special event",
  },
];

function priorityLabel(p: number) {
  if (p >= 1000) return { text: "HIGHEST", cls: "bg-rose-500/15 text-rose-600 dark:text-rose-400" };
  if (p >= 800)
    return { text: "HIGH", cls: "bg-orange-500/15 text-orange-600 dark:text-orange-400" };
  if (p >= 500) return { text: "MEDIUM", cls: "bg-sky-500/15 text-sky-600 dark:text-sky-400" };
  return { text: "LOW", cls: "bg-muted text-muted-foreground" };
}

function formatAppliesTo(appliesTo: PriceRule["appliesTo"]) {
  if (appliesTo === "all") return <Badge variant="secondary">All Fields</Badge>;
  return (
    <div className="flex flex-wrap gap-1">
      {appliesTo.map((id) => (
        <Badge key={id} variant="secondary">
          {FIELDS.find((f) => f.id === id)?.name ?? id}
        </Badge>
      ))}
    </div>
  );
}

export default function PriceAvailabilityPageClient() {
  const [rules, setRules] = React.useState<PriceRule[]>(RULES_INIT);
  const [overrides] = React.useState<Override[]>(OVERRIDES_INIT);

  const [scope, setScope] = React.useState<"center" | "field">("center");
  const [selectedField, setSelectedField] = React.useState<string>("");

  // Quote panel inputs
  const [quoteField, setQuoteField] = React.useState(FIELDS[0]?.id ?? "");
  const [quoteDate, setQuoteDate] = React.useState("10/24/2026");
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("11:30");

  const activeRules = React.useMemo(
    () => rules.filter((r) => r.enabled).sort((a, b) => b.priority - a.priority),
    [rules],
  );

  // Mock quote result
  const breakdown = React.useMemo(() => {
    // just demo: pick 2 rules
    const items = [
      { label: "09:00 - 10:00 (Weekday Morning)", price: 35 },
      { label: "10:00 - 11:30 (Weekend Prime)", price: 82.5 },
    ];
    const total = items.reduce((s, x) => s + x.price, 0);
    return { items, total };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Pricing & Availability</h1>
          <p className="text-sm text-muted-foreground">
            Configure recurring schedules and date-specific exceptions. Overrides take precedence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Import
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New rule
          </Button>
        </div>
      </div>

      {/* Scope + field selection (like right screenshot) */}
      <Card className="p-3">
        <div className="grid gap-3 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <div className="text-xs font-medium text-muted-foreground">FIELD SCOPE</div>
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant={scope === "center" ? "default" : "outline"}
                size="sm"
                onClick={() => setScope("center")}
              >
                Center-wide
              </Button>
              <Button
                variant={scope === "field" ? "default" : "outline"}
                size="sm"
                onClick={() => setScope("field")}
              >
                Specific Field
              </Button>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-muted-foreground">SELECT FIELD</div>
            <div className="mt-2">
              <Select
                value={selectedField}
                onValueChange={setSelectedField}
                disabled={scope !== "field"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a field..." />
                </SelectTrigger>
                <SelectContent>
                  {FIELDS.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Complex rules + Quote panel (like left screenshot) */}
      <div className="grid gap-3 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Complex Pricing Rules</CardTitle>
              <div className="mt-1 text-sm text-muted-foreground">
                Rules are evaluated from highest to lowest priority.
              </div>
            </div>
            <Button size="sm">+ Create New Rule</Button>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[90px]">Enabled</TableHead>
                    <TableHead>Rule name</TableHead>
                    <TableHead>Applies to</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Time range</TableHead>
                    <TableHead className="text-right">Price/hr</TableHead>
                    <TableHead className="text-right">Priority</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {activeRules.map((r) => {
                    const p = priorityLabel(r.priority);
                    return (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={r.enabled}
                              onCheckedChange={(v) =>
                                setRules((prev) =>
                                  prev.map((x) => (x.id === r.id ? { ...x, enabled: v } : x)),
                                )
                              }
                            />
                          </div>
                        </TableCell>

                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell>{formatAppliesTo(r.appliesTo)}</TableCell>
                        <TableCell className="text-muted-foreground">{r.days}</TableCell>
                        <TableCell className="text-muted-foreground">{r.timeRange}</TableCell>
                        <TableCell className="text-right font-semibold">
                          €{r.pricePerHour.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className={["rounded-md", p.cls].join(" ")}>{p.text}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <Separator />

            {/* Pricing timeline preview (simple placeholder; can be upgraded to real chart later) */}
            {/* <div className="space-y-2">
              <div className="text-sm font-semibold">Pricing Timeline Preview (24h)</div>
              <div className="rounded-lg border p-3">
                <div className="grid grid-cols-12 gap-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className={[
                        "h-8 rounded-md",
                        i < 3 ? "bg-muted" : i < 8 ? "bg-primary/25" : "bg-muted",
                      ].join(" ")}
                      title="Preview segment"
                    />
                  ))}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Preview is simplified. We can render a real timeline once your pricing resolver is
                  ready.
                </div>
              </div>
            </div> */}
            <PricingTimelinePreview footer="Previewing for: Saturday, Oct 14th (Field 1)" />
          </CardContent>
        </Card>

        {/* Quote Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Test Quote Panel</CardTitle>
            <div className="text-sm text-muted-foreground">
              Validate pricing rules and see conflict resolution.
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">SELECT FIELD</div>
              <Select value={quoteField} onValueChange={setQuoteField}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELDS.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">SELECT DATE</div>
              <Input value={quoteDate} onChange={(e) => setQuoteDate(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">START TIME</div>
                <Input value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">END TIME</div>
                <Input value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            <Button className="w-full">Calculate Quote</Button>

            <Separator />

            <div className="space-y-2">
              <div className="text-sm font-semibold">Price Breakdown</div>

              <div className="space-y-2 text-sm">
                {breakdown.items.map((x, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{x.label}</span>
                    <span className="font-medium">€{x.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-semibold">Estimated Total</span>
                <span className="text-lg font-semibold text-primary">
                  €{breakdown.total.toFixed(2)}
                </span>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Conflict resolved:</span> “Weekend
                Prime” was used over “Standard Base” due to higher priority.
              </div>
            </div>

            <Card className="border bg-card">
              <CardContent className="p-3">
                <div className="text-sm font-semibold">Need help?</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Learn how to configure rules for holidays, events, and priority resolution.
                </div>
                <Button variant="link" className="px-0 text-xs">
                  View guide
                </Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Schedule + Overrides (like right screenshot) */}
      <div className="grid gap-3 xl:grid-cols-2">
        <WeeklyScheduleCard />
        <OverridesCard overrides={overrides} />
      </div>
    </div>
  );
}

function WeeklyScheduleCard() {
  // mock: only Monday has slots
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Weekly Recurring Schedule</CardTitle>
        <Button variant="link" className="h-auto px-0 text-xs">
          Bulk apply Monday’s hours
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        <DayRow
          day="Monday"
          open
          slots={[
            ["08:00 AM", "12:00 PM"],
            ["01:00 PM", "10:00 PM"],
          ]}
        />
        <DayRow day="Tuesday" open={false} slots={[]} hint="No slots defined. Facility closed." />
        <MiniDaysStrip />
      </CardContent>
    </Card>
  );
}

function DayRow({
  day,
  open,
  slots,
  hint,
}: {
  day: string;
  open: boolean;
  slots: [string, string][];
  hint?: string;
}) {
  return (
    <Card className="border bg-card">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="font-semibold">{day}</div>
            <div className="mt-2 flex items-center gap-2">
              <Switch checked={open} />
              <span className="text-xs font-medium text-muted-foreground">
                {open ? "OPEN" : "CLOSED"}
              </span>
            </div>
          </div>

          <div className="flex-1 md:pl-6">
            {open ? (
              <div className="space-y-2">
                {slots.map((s, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
                    <Input defaultValue={s[0]} />
                    <span className="text-xs text-muted-foreground">to</span>
                    <Input defaultValue={s[1]} />
                    <Button variant="outline" size="icon" aria-label="Remove slot">
                      ×
                    </Button>
                  </div>
                ))}
                <Button variant="link" className="h-auto px-0 text-xs">
                  + Add slot
                </Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">{hint ?? "Closed"}</div>
            )}
          </div>

          <div className="md:text-right">
            <div className="text-xs text-muted-foreground">DAILY TOTAL</div>
            <div className="text-sm font-semibold">13h 00m</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniDaysStrip() {
  return (
    <div className="grid grid-cols-7 gap-2">
      {[
        ["Wed", "08:00 - 22:00"],
        ["Thu", "08:00 - 22:00"],
        ["Fri", "08:00 - 23:00"],
        ["Sat", "06:00 - 00:00"],
        ["Sun", "08:00 - 21:00"],
        ["Mon", "08:00 - 22:00"],
        ["Tue", "Closed"],
      ].map(([d, t]) => (
        <div key={d} className="rounded-lg border p-2 text-center">
          <div className="text-xs font-semibold">{d}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">{t}</div>
        </div>
      ))}
    </div>
  );
}

function OverridesCard({ overrides }: { overrides: Override[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Active Overrides</CardTitle>
        <Button size="sm" variant="outline">
          + Create Override
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          Date-specific exceptions for maintenance, holidays, or events.
        </div>

        <Separator />

        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & time</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {overrides.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.dateTime}</TableCell>
                  <TableCell className="text-muted-foreground">{o.scope}</TableCell>
                  <TableCell>
                    {o.status === "BLOCK" ? (
                      <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400">
                        BLOCK
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        OPEN
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{o.reason}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Button variant="link" className="h-auto px-0 text-xs">
          View all historical overrides
        </Button>
      </CardContent>
    </Card>
  );
}
