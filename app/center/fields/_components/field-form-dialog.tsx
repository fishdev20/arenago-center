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

type FieldStatus = "open" | "closed";

type Field = {
  id: string;
  name: string;
  sport: "football" | "badminton" | "tennis" | "basketball" | "other";
  status: FieldStatus;
  locationNote?: string;
};

export function FieldFormDialog({
  open,
  onOpenChange,
  mode,
  initialValue,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  initialValue: Field | null;
  onSubmit: (payload: Omit<Field, "id">) => void;
}) {
  const [name, setName] = React.useState("");
  const [sport, setSport] = React.useState<Field["sport"]>("badminton");
  const [status, setStatus] = React.useState<FieldStatus>("open");
  const [locationNote, setLocationNote] = React.useState("");

  React.useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialValue) {
      setName(initialValue.name);
      setSport(initialValue.sport);
      setStatus(initialValue.status);
      setLocationNote(initialValue.locationNote ?? "");
      return;
    }

    // create mode
    setName("");
    setSport("badminton");
    setStatus("open");
    setLocationNote("");
  }, [open, mode, initialValue]);

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
            onSubmit({
              name: name.trim(),
              sport,
              status,
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
              <Select value={sport} onValueChange={(v) => setSport(v as Field["sport"])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="badminton">Badminton</SelectItem>
                  <SelectItem value="football">Football</SelectItem>
                  <SelectItem value="tennis">Tennis</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as FieldStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <Button type="submit">{mode === "create" ? "Create" : "Save"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
