"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Pencil, Plus, Trash } from "lucide-react";
import * as React from "react";
import { defaultRuleForm } from "./rule-dialog";
import { usePriceAvailabilityStore } from "./use-price-availability-store";

type FormattedRule = {
  id: string;
  enabled: boolean;
  name: string;
  appliesTo: "all" | string[];
  days: "Daily" | "Weekdays" | "Weekend" | "Specific dates";
  timeRange: string;
  pricePerHour: number;
  priority: number;
};

function priorityLabel(p: number) {
  if (p >= 1000) return { text: "HIGHEST", cls: "bg-rose-500/15 text-rose-600 dark:text-rose-400" };
  if (p >= 800)
    return { text: "HIGH", cls: "bg-orange-500/15 text-orange-600 dark:text-orange-400" };
  if (p >= 500) return { text: "MEDIUM", cls: "bg-sky-500/15 text-sky-600 dark:text-sky-400" };
  return { text: "LOW", cls: "bg-muted text-muted-foreground" };
}

function formatAppliesTo(
  appliesTo: FormattedRule["appliesTo"],
  fields: { id: string; name: string }[],
) {
  if (appliesTo === "all") return <Badge variant="secondary">All Fields</Badge>;
  return (
    <div className="flex flex-wrap gap-1">
      {appliesTo.map((id) => (
        <Badge key={id} variant="secondary">
          {fields.find((f) => f.id === id)?.name ?? id}
        </Badge>
      ))}
    </div>
  );
}

export function RulesStepCard({
  fields,
  rules,
  onToggleEnabled,
  onDeleteRule,
}: {
  fields: { id: string; name: string }[];
  rules: FormattedRule[];
  onToggleEnabled: (id: string, enabled: boolean) => Promise<void>;
  onDeleteRule: (id: string) => Promise<void>;
}) {
  const scope = usePriceAvailabilityStore((s) => s.scope);
  const setScope = usePriceAvailabilityStore((s) => s.setScope);
  const selectedField = usePriceAvailabilityStore((s) => s.selectedField);
  const setSelectedField = usePriceAvailabilityStore((s) => s.setSelectedField);
  const setRuleForm = usePriceAvailabilityStore((s) => s.setRuleForm);
  const setRuleDialogOpen = usePriceAvailabilityStore((s) => s.setRuleDialogOpen);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Step 2 - Pricing rules</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add reusable rules. Higher priority wins when multiple rules match.
              </p>
            </div>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => {
                setRuleForm({
                  ...defaultRuleForm,
                  name: scope === "center" ? "Center Base Rule" : "Field Rule",
                  appliesToMode: scope === "field" ? "field" : "all",
                  fieldId: selectedField || "",
                });
                setRuleDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New rule
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
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
                    {fields.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((r) => {
                  const p = priorityLabel(r.priority);
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Switch
                          checked={r.enabled}
                          onCheckedChange={(v) => onToggleEnabled(r.id, v)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>{formatAppliesTo(r.appliesTo, fields)}</TableCell>
                      <TableCell className="text-muted-foreground">{r.days}</TableCell>
                      <TableCell className="text-muted-foreground">{r.timeRange}</TableCell>
                      <TableCell className="text-right font-semibold">
                        EUR {r.pricePerHour.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={["rounded-md", p.cls].join(" ")}>{p.text}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const [timeStart, timeEnd] = r.timeRange.split(" - ");
                              setRuleForm({
                                id: r.id,
                                name: r.name,
                                appliesToMode: r.appliesTo === "all" ? "all" : "field",
                                fieldId: r.appliesTo === "all" ? "" : (r.appliesTo[0] ?? ""),
                                days: r.days,
                                timeStart: timeStart ?? "08:00",
                                timeEnd: timeEnd ?? "22:00",
                                pricePerHour: String(r.pricePerHour),
                                priority: String(r.priority),
                                enabled: r.enabled,
                              });
                              setRuleDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeleteTarget({ id: r.id, name: r.name })}
                          >
                            <Trash />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete pricing rule?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `This will permanently delete "${deleteTarget.name}". This action cannot be undone.`
                : "This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!deleteTarget || isDeleting}
              onClick={async () => {
                if (!deleteTarget) return;
                setIsDeleting(true);
                try {
                  await onDeleteRule(deleteTarget.id);
                  setDeleteTarget(null);
                } finally {
                  setIsDeleting(false);
                }
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
