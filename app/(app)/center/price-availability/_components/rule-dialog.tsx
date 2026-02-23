"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import * as React from "react";
import { TimePickerField } from "./time-pickers";
import { usePriceAvailabilityStore } from "./use-price-availability-store";

export type RuleForm = {
  id?: string;
  name: string;
  appliesToMode: "all" | "field";
  fieldId: string;
  days: "Daily" | "Weekdays" | "Weekend" | "Specific dates";
  timeStart: string;
  timeEnd: string;
  pricePerHour: string;
  priority: string;
  enabled: boolean;
};

export const defaultRuleForm: RuleForm = {
  name: "",
  appliesToMode: "all",
  fieldId: "",
  days: "Daily",
  timeStart: "08:00",
  timeEnd: "22:00",
  pricePerHour: "45",
  priority: "100",
  enabled: true,
};

export function RuleDialog({
  fields,
  onSubmit,
}: {
  fields: { id: string; name: string }[];
  onSubmit: () => Promise<void>;
}) {
  const open = usePriceAvailabilityStore((s) => s.ruleDialogOpen);
  const onOpenChange = usePriceAvailabilityStore((s) => s.setRuleDialogOpen);
  const form = usePriceAvailabilityStore((s) => s.ruleForm);
  const setForm = usePriceAvailabilityStore((s) => s.setRuleForm);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit rule" : "Create rule"}</DialogTitle>
          <DialogDescription>Configure days, time range, price, and priority.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Applies to</Label>
              <Select
                value={form.appliesToMode}
                onValueChange={(v: "all" | "field") => setForm((p) => ({ ...p, appliesToMode: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All fields</SelectItem>
                  <SelectItem value="field">Specific field</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Field</Label>
              <Select
                value={form.fieldId}
                onValueChange={(v) => setForm((p) => ({ ...p, fieldId: v }))}
                disabled={form.appliesToMode !== "field"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
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

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Days</Label>
              <Select
                value={form.days}
                onValueChange={(v: RuleForm["days"]) => setForm((p) => ({ ...p, days: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekdays">Weekdays</SelectItem>
                  <SelectItem value="Weekend">Weekend</SelectItem>
                  <SelectItem value="Specific dates">Specific dates</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Start</Label>
              <TimePickerField
                value={form.timeStart}
                onChange={(time) => setForm((p) => ({ ...p, timeStart: time }))}
              />
            </div>

            <div className="space-y-1">
              <Label>End</Label>
              <TimePickerField value={form.timeEnd} onChange={(time) => setForm((p) => ({ ...p, timeEnd: time }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Price per hour</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.pricePerHour}
                onChange={(e) => setForm((p) => ({ ...p, pricePerHour: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label>Priority</Label>
              <Input
                type="number"
                min="1"
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={form.enabled} onCheckedChange={(checked) => setForm((p) => ({ ...p, enabled: checked }))} />
            <span className="text-sm text-muted-foreground">Enabled</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>{form.id ? "Save changes" : "Create rule"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
