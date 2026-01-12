"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FieldCardMenu } from "./_components/field-card-menu";
import { FieldFormDialog } from "./_components/field-form-dialog";
import { useFieldDialog } from "./_hooks/use-field-dialog";

type FieldStatus = "open" | "closed";

type Field = {
  id: string;
  name: string;
  sport: "football" | "badminton" | "tennis" | "basketball" | "other";
  status: FieldStatus;
  locationNote?: string;
};

const INITIAL_FIELDS: Field[] = [
  { id: "f1", name: "Court 1", sport: "badminton", status: "open" },
  { id: "f2", name: "Court 2", sport: "badminton", status: "closed", locationNote: "Renovation" },
  { id: "f3", name: "สนาม 3", sport: "football", status: "open", locationNote: "Near gate A" },
];

function statusVariant(status: FieldStatus) {
  return status === "open" ? "default" : "secondary";
}

function sportLabel(s: Field["sport"]) {
  if (s === "football") return "Football";
  if (s === "badminton") return "Badminton";
  if (s === "tennis") return "Tennis";
  if (s === "basketball") return "Basketball";
  return "Other";
}

export default function FieldsPageClient() {
  const [fields, setFields] = React.useState<Field[]>(INITIAL_FIELDS);

  const [selected, setSelected] = React.useState<Field | null>(null);

  const { dialogOpen, mode, openCreate, openEdit, close } = useFieldDialog();

  function handleCreate(data: Omit<Field, "id">) {
    const id = `f_${Math.random().toString(16).slice(2)}`;
    setFields((prev) => [{ id, ...data }, ...prev]);
  }

  function handleUpdate(id: string, data: Omit<Field, "id">) {
    setFields((prev) => prev.map((f) => (f.id === id ? { id, ...data } : f)));
  }

  function handleDelete(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Fields</h1>
          <p className="text-sm text-muted-foreground">
            Manage your courts/fields and their availability status.
          </p>
        </div>

        {/* If you don’t want header action slot, keep this button here too */}
        <Button variant="outline" size="sm" onClick={openCreate}>
          New field
        </Button>
      </div>

      <Separator />

      {fields.length === 0 ? (
        <Card className="p-6">
          <div className="space-y-2">
            <div className="text-lg font-medium">No fields yet</div>
            <p className="text-sm text-muted-foreground">
              Create your first field to start accepting bookings.
            </p>
            <Button size="sm" onClick={openCreate}>
              Create field
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {fields.map((f) => (
            <Card key={f.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-base font-semibold">{f.name}</div>
                    <Badge variant={statusVariant(f.status)}>{f.status}</Badge>
                  </div>

                  <div className="mt-1 text-sm text-muted-foreground">
                    {sportLabel(f.sport)}
                    {f.locationNote ? ` • ${f.locationNote}` : ""}
                  </div>
                </div>

                <FieldCardMenu
                  onEdit={() => {
                    setSelected(f);
                    openEdit();
                  }}
                  onDelete={() => handleDelete(f.id)}
                  onToggleStatus={() => {
                    setFields((prev) =>
                      prev.map((x) =>
                        x.id === f.id
                          ? { ...x, status: x.status === "open" ? "closed" : "open" }
                          : x,
                      ),
                    );
                  }}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <FieldFormDialog
        open={dialogOpen}
        mode={mode}
        initialValue={selected}
        onOpenChange={(v) => {
          if (!v) {
            close();
            setSelected(null);
          }
        }}
        onSubmit={(payload) => {
          if (mode === "create") {
            handleCreate(payload);
          } else if (selected) {
            handleUpdate(selected.id, payload);
          }
          close();
          setSelected(null);
        }}
      />
    </div>
  );
}
