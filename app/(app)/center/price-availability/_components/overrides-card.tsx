"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil } from "lucide-react";
import * as React from "react";
import { DateTimePickerField } from "./time-pickers";
import { usePriceAvailabilityStore } from "./use-price-availability-store";

type OverrideItem = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: "BLOCK" | "OPEN";
  reason: string | null;
  scope: "center" | "field";
  field?: { id: string; name: string } | null;
};

function formatDateTime(dateIso: string) {
  const d = new Date(dateIso);
  return d.toLocaleString();
}

export function OverridesCard({
  fields,
  overrides,
  onCreate,
  onEdit,
  onDelete,
}: {
  fields: { id: string; name: string }[];
  overrides: OverrideItem[];
  onCreate: (payload: {
    scope: "center" | "field";
    fieldId: string | null;
    status: "BLOCK" | "OPEN";
    startsAt: string;
    endsAt: string;
    reason: string;
  }) => Promise<void>;
  onEdit: (
    id: string,
    payload: {
      scope?: "center" | "field";
      fieldId?: string | null;
      status?: "BLOCK" | "OPEN";
      startsAt?: string;
      endsAt?: string;
      reason?: string;
    },
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const overrideScope = usePriceAvailabilityStore((s) => s.overrideScope);
  const setOverrideScope = usePriceAvailabilityStore((s) => s.setOverrideScope);
  const overrideField = usePriceAvailabilityStore((s) => s.overrideField);
  const setOverrideField = usePriceAvailabilityStore((s) => s.setOverrideField);
  const overrideStatus = usePriceAvailabilityStore((s) => s.overrideStatus);
  const setOverrideStatus = usePriceAvailabilityStore((s) => s.setOverrideStatus);
  const overrideStart = usePriceAvailabilityStore((s) => s.overrideStart);
  const setOverrideStart = usePriceAvailabilityStore((s) => s.setOverrideStart);
  const overrideEnd = usePriceAvailabilityStore((s) => s.overrideEnd);
  const setOverrideEnd = usePriceAvailabilityStore((s) => s.setOverrideEnd);
  const overrideReason = usePriceAvailabilityStore((s) => s.overrideReason);
  const setOverrideReason = usePriceAvailabilityStore((s) => s.setOverrideReason);
  const editingOverrideId = usePriceAvailabilityStore((s) => s.editingOverrideId);
  const setEditingOverrideId = usePriceAvailabilityStore((s) => s.setEditingOverrideId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Active Overrides</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid gap-2 md:grid-cols-2">
          <Select value={overrideScope} onValueChange={(v: "center" | "field") => setOverrideScope(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="center">Center-wide</SelectItem>
              <SelectItem value="field">Specific field</SelectItem>
            </SelectContent>
          </Select>

          <Select value={overrideStatus} onValueChange={(v: "BLOCK" | "OPEN") => setOverrideStatus(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BLOCK">BLOCK</SelectItem>
              <SelectItem value="OPEN">OPEN</SelectItem>
            </SelectContent>
          </Select>

          <DateTimePickerField value={overrideStart} onChange={setOverrideStart} placeholder="Start date & time" />
          <DateTimePickerField value={overrideEnd} onChange={setOverrideEnd} placeholder="End date & time" />

          <Select value={overrideField} onValueChange={setOverrideField} disabled={overrideScope !== "field"}>
            <SelectTrigger>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {fields.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} placeholder="Reason" />
        </div>

        <Button
          onClick={async () => {
            await onCreate({
              scope: overrideScope,
              fieldId: overrideScope === "field" ? overrideField : null,
              status: overrideStatus,
              startsAt: overrideStart,
              endsAt: overrideEnd,
              reason: overrideReason,
            });
            setOverrideReason("");
          }}
        >
          Create Override
        </Button>
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
                  <TableCell className="font-medium">
                    {formatDateTime(o.starts_at)} - {formatDateTime(o.ends_at)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.scope === "center" ? "Center-wide" : (o.field?.name ?? "Field")}
                  </TableCell>
                  <TableCell>
                    {o.status === "BLOCK" ? (
                      <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400">BLOCK</Badge>
                    ) : (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">OPEN</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{o.reason ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingOverrideId(o.id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(o.id)}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <EditOverrideDialog
          open={Boolean(editingOverrideId)}
          onOpenChange={(next) => {
            if (!next) setEditingOverrideId(null);
          }}
          override={overrides.find((o) => o.id === editingOverrideId) ?? null}
          fields={fields}
          onSubmit={async (payload) => {
            if (!editingOverrideId) return;
            await onEdit(editingOverrideId, payload);
            setEditingOverrideId(null);
          }}
        />
      </CardContent>
    </Card>
  );
}

function EditOverrideDialog({
  open,
  onOpenChange,
  override,
  fields,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  override: OverrideItem | null;
  fields: { id: string; name: string }[];
  onSubmit: (payload: {
    scope?: "center" | "field";
    fieldId?: string | null;
    status?: "BLOCK" | "OPEN";
    startsAt?: string;
    endsAt?: string;
    reason?: string;
  }) => Promise<void>;
}) {
  const [scope, setScope] = React.useState<"center" | "field">("center");
  const [status, setStatus] = React.useState<"BLOCK" | "OPEN">("BLOCK");
  const [fieldId, setFieldId] = React.useState("");
  const [startsAt, setStartsAt] = React.useState("");
  const [endsAt, setEndsAt] = React.useState("");
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    if (!override) return;
    setScope(override.scope);
    setStatus(override.status);
    setFieldId(override.field?.id ?? "");
    setStartsAt(override.starts_at.slice(0, 16));
    setEndsAt(override.ends_at.slice(0, 16));
    setReason(override.reason ?? "");
  }, [override]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit override</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <Select value={scope} onValueChange={(v: "center" | "field") => setScope(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Center-wide</SelectItem>
                <SelectItem value="field">Specific field</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={(v: "BLOCK" | "OPEN") => setStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BLOCK">BLOCK</SelectItem>
                <SelectItem value="OPEN">OPEN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={fieldId} onValueChange={setFieldId} disabled={scope !== "field"}>
            <SelectTrigger>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {fields.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <DateTimePickerField value={startsAt} onChange={setStartsAt} placeholder="Start date & time" />
            <DateTimePickerField value={endsAt} onChange={setEndsAt} placeholder="End date & time" />
          </div>

          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSubmit({
                scope,
                status,
                fieldId: scope === "field" ? fieldId : null,
                startsAt: new Date(startsAt).toISOString(),
                endsAt: new Date(endsAt).toISOString(),
                reason,
              })
            }
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
