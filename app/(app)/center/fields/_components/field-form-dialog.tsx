"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSports } from "@/lib/query/use-sports";

type Field = {
  id: string;
  name: string;
  sportId: string;
  status: "active" | "maintenance";
  area: "Outdoor" | "Indoor";
  locationNote?: string;
};

export function FieldFormDialog({
  open,
  onOpenChange,
  mode,
  initialValue,
  onSubmit,
  isSubmitting = false,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  initialValue: Field | null;
  onSubmit: (payload: Omit<Field, "id">) => void;
  isSubmitting?: boolean;
}) {
  const [name, setName] = React.useState("");
  const [sportId, setSportId] = React.useState<Field["sportId"]>("");
  const [status, setStatus] = React.useState<Field["status"]>("active");
  const [area, setArea] = React.useState<Field["area"]>("Outdoor");
  const [locationNote, setLocationNote] = React.useState("");
  const { data: sportsData, isLoading: sportsLoading } = useSports();

  React.useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialValue) {
      setName(initialValue.name);
      setSportId(initialValue.sportId);
      setStatus(initialValue.status);
      setArea(initialValue.area);
      setLocationNote(initialValue.locationNote ?? "");
      return;
    }

    // create mode
    setName("");
    setSportId(sportsData?.sports?.[0]?.id ?? "");
    setStatus("active");
    setArea("Outdoor");
    setLocationNote("");
  }, [open, mode, initialValue, sportsData]);

  const title = mode === "create" ? "Create field" : "Edit field";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Fields represent courts/areas customers can book.</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
          if (!sportId) return;
          onSubmit({
            name: name.trim(),
            sportId,
            status,
            area,
            locationNote: locationNote.trim() || undefined,
          });
        }}
      >
          <div className="space-y-1">
            <Label htmlFor="field-name">Name</Label>
            <Input
              id="field-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Court 1"
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Sport</Label>
              <Select value={sportId} onValueChange={(v) => setSportId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  {sportsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading sports...
                    </SelectItem>
                  ) : (
                    sportsData?.sports?.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Field["status"])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Area</Label>
            <Select value={area} onValueChange={(v) => setArea(v as Field["area"])}>
              <SelectTrigger>
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Outdoor">Outdoor</SelectItem>
                <SelectItem value="Indoor">Indoor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="location-note">Location note (optional)</Label>
            <Textarea
              id="location-note"
              value={locationNote}
              onChange={(e) => setLocationNote(e.target.value)}
              placeholder="Near gate A, next to reception..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!sportId || isSubmitting}>
              {mode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
