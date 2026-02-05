"use client";

import { Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import type { CenterAmenity } from "@/lib/api/center-amenities";
import {
  useCenterAmenities,
  useCreateCenterAmenity,
  useDeleteCenterAmenity,
  useUpdateCenterAmenity,
} from "@/lib/query/use-center-amenities";

type OptimisticAction =
  | { type: "add"; amenity: CenterAmenity }
  | { type: "toggle"; id: string; isActive: boolean }
  | { type: "remove"; id: string };

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\\s-]/g, "")
    .replace(/\\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AmenitiesSettingsPage() {
  const [name, setName] = React.useState("");
  const { data, isLoading } = useCenterAmenities();
  const [isPending, startTransition] = React.useTransition();
  const createAmenity = useCreateCenterAmenity();
  const updateAmenity = useUpdateCenterAmenity();
  const deleteAmenity = useDeleteCenterAmenity();

  const amenities = data?.amenities ?? [];
  const [optimisticAmenities, applyOptimistic] = React.useOptimistic<
    CenterAmenity[],
    OptimisticAction
  >(amenities, (state, action) => {
    if (action.type === "add") return [action.amenity, ...state];
    if (action.type === "toggle") {
      return state.map((item) =>
        item.id === action.id ? { ...item, is_active: action.isActive } : item,
      );
    }
    if (action.type === "remove") {
      return state.filter((item) => item.id !== action.id);
    }
    return state;
  });

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const amenityName = name.trim();
    setName("");

    startTransition(async () => {
      applyOptimistic({
        type: "add",
        amenity: {
          id: `temp-${Date.now()}`,
          name: amenityName,
          slug: toSlug(amenityName),
          icon: null,
          is_active: true,
          created_at: new Date().toISOString(),
        },
      });

      try {
        await createAmenity.mutateAsync({ name: amenityName });
        toast.success("Amenity added.");
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to add amenity.");
      }
    });
  };

  const onToggle = async (id: string, isActive: boolean) => {
    startTransition(async () => {
      applyOptimistic({ type: "toggle", id, isActive });
      try {
        await updateAmenity.mutateAsync({ id, isActive });
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to update amenity.");
      }
    });
  };

  const onDelete = async (id: string) => {
    startTransition(async () => {
      applyOptimistic({ type: "remove", id });
      try {
        await deleteAmenity.mutateAsync(id);
        toast.success("Amenity removed.");
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to remove amenity.");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Amenities</h2>
        <p className="text-sm text-muted-foreground">
          Add and manage amenities available in your center.
        </p>
      </div>

      <form className="flex gap-2" onSubmit={onCreate}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add amenity (e.g. Shower, Parking, Wi-Fi)"
        />
        <Button type="submit" disabled={!name.trim() || createAmenity.isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </form>
      <Separator />
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={`amenity-skeleton-${idx}`}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-10 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))
        ) : optimisticAmenities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No amenities yet.</p>
        ) : (
          optimisticAmenities.map((amenity) => {
            const isTemp = amenity.id.startsWith("temp-");
            return (
              <div
                key={amenity.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">{amenity.name}</div>
                  {isTemp ? (
                    <span className="text-[10px] text-muted-foreground animate-pulse">
                      Syncing...
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-muted-foreground">{amenity.slug}</div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={amenity.is_active}
                  onCheckedChange={(v) => onToggle(amenity.id, v)}
                  disabled={updateAmenity.isPending || isTemp}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(amenity.id)}
                  disabled={deleteAmenity.isPending || isTemp}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
