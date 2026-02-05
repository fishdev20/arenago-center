"use client";

import {
  BadgeCheck,
  CalendarClock,
  ChevronDown,
  Download,
  Eye,
  Grid2X2,
  LayoutGrid,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Table2,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  useCenterFields,
  useCreateCenterField,
  useUpdateCenterField,
} from "@/lib/query/use-center-fields";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FieldFormDialog } from "./_components/field-form-dialog";

type AssetStatus = "active" | "maintenance";

type Asset = {
  id: string;
  name: string;
  type: string;
  sportId: string;
  description?: string;
  area: "Outdoor" | "Indoor";
  status: AssetStatus;
  next?: string; // "2:00 PM" or "Available"
  imageUrl?: string | null;
};

function FieldDetailsPanel({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const isTemp = asset.id.startsWith("temp-");
  return (
    <Card className="h-fit p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold">{asset.name}</h3>
          <p className="text-xs text-muted-foreground">{asset.type}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Status</span>
          <StatusPill status={asset.status} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Area</span>
          <AreaTag area={asset.area} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Sport</span>
          <span className="font-medium">{asset.type}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Availability</span>
          <span className="font-medium">{asset.next ?? "Available"}</span>
        </div>
        <div>
          <div className="mb-1 text-muted-foreground">Description</div>
          <p className="rounded-md border p-2 text-sm">
            {asset.description?.trim() || "No description yet."}
          </p>
        </div>
        {isTemp ? (
          <p className="animate-pulse text-xs text-muted-foreground">
            Syncing field data to database...
          </p>
        ) : null}
      </div>
    </Card>
  );
}

function StatusPill({ status }: { status: AssetStatus }) {
  const config =
    status === "active"
      ? {
          label: "ACTIVE",
          icon: BadgeCheck,
          className:
            "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
        }
      : {
          label: "MAINTENANCE",
          icon: Wrench,
          className:
            "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
        };

  const Icon = config.icon;
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
        config.className,
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function AreaTag({ area }: { area: Asset["area"] }) {
  return (
    <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[10px] font-semibold">
      {area.toUpperCase()}
    </Badge>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-muted-foreground">{title}</div>
          <div className="mt-1 text-2xl font-semibold leading-none">{value}</div>
          <div className="mt-2 text-xs text-muted-foreground">{subtitle}</div>
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
    </Card>
  );
}

function AssetCard({
  asset,
  onView,
  onEdit,
}: {
  asset: Asset;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const isTemp = asset.id.startsWith("temp-");
  return (
    <Card
      className={cn(
        "overflow-hidden pt-0 transition-all",
        isTemp && "opacity-70 blur-[0.6px] saturate-75",
      )}
    >
      <div className="relative aspect-[16/8] w-full bg-muted">
        {asset.imageUrl ? (
          <Image
            src={asset.imageUrl}
            alt={asset.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <AreaTag area={asset.area} />
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{asset.name}</div>
            {asset.description ? (
              <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {asset.description}
              </div>
            ) : null}
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{asset.type}</span>
              {isTemp ? <span className="animate-pulse text-[10px]">Syncing...</span> : null}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(asset.id)}>View</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(asset.id)}>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <StatusPill status={asset.status} />
          <div className="text-xs text-muted-foreground">
            <span className="italic">Next:</span>{" "}
            <span className="font-medium text-foreground">{asset.next ?? "—"}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function AddAssetTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-3",
        "rounded-lg border border-dashed bg-background",
        "text-muted-foreground hover:text-foreground hover:border-muted-foreground/40",
        "transition-colors",
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-muted/30">
        <Plus className="h-5 w-5" />
      </div>
      <div className="text-sm font-medium">Add New Asset</div>
      <div className="text-xs text-muted-foreground">Create a field/court/pool asset</div>
    </button>
  );
}

export default function FieldsAssetManagementPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [editingFieldId, setEditingFieldId] = React.useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { data, isLoading } = useCenterFields();
  const [isPending, startTransition] = React.useTransition();
  const createField = useCreateCenterField();
  const updateField = useUpdateCenterField();
  const assets: Asset[] =
    data?.fields?.map((field) => ({
      id: field.id,
      name: field.name,
      type: field.sport?.name ?? "Unknown",
      sportId: field.sport?.id ?? "",
      description: field.location_note ?? undefined,
      area: field.area ?? "Outdoor",
      status: field.status ?? "active",
      imageUrl: field.image_url,
    })) ?? [];
  const [optimisticAssets, applyOptimistic] = React.useOptimistic<Asset[], Asset[]>(
    assets,
    (_state, nextState) => nextState,
  );

  const [view, setView] = React.useState<"card" | "table">("card");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return optimisticAssets;
    return optimisticAssets.filter((a) => {
      return (
        a.name.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.area.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q)
      );
    });
  }, [optimisticAssets, query]);
  const selectedAsset = selectedId
    ? (optimisticAssets.find((asset) => asset.id === selectedId) ?? null)
    : null;
  const editingAsset = editingFieldId
    ? (optimisticAssets.find((asset) => asset.id === editingFieldId) ?? null)
    : null;

  React.useEffect(() => {
    if (!selectedId) return;
    if (!optimisticAssets.some((asset) => asset.id === selectedId)) {
      setSelectedId(null);
      setDetailOpen(false);
    }
  }, [optimisticAssets, selectedId]);

  const totalAssets = assets.length;
  const activeCount = assets.filter((a) => a.status === "active").length;
  const maintCount = assets.filter((a) => a.status === "maintenance").length;

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-lg font-semibold md:text-xl">Fields & Asset Management</h1>
            <p className="text-sm text-muted-foreground">
              Monitor availability, maintenance cycles, and court assignments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroup
                  type="single"
                  value={view}
                  onValueChange={(v) => v && setView(v as any)}
                  className="rounded-lg border bg-background p-1"
                >
                  <ToggleGroupItem value="card" className="h-8 px-3">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Card
                  </ToggleGroupItem>
                  <ToggleGroupItem value="table" className="h-8 px-3">
                    <Table2 className="mr-2 h-4 w-4" />
                    Table
                  </ToggleGroupItem>
                </ToggleGroup>
              </TooltipTrigger>
              <TooltipContent>Switch view</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  Actions <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Grid2X2 className="mr-2 h-4 w-4" />
                  Bulk update
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              className="gap-2"
              onClick={() => {
                setEditingFieldId(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden md:block">Add Asset</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <StatCard
            title="Total Assets"
            value={String(totalAssets).padStart(2, "0")}
            subtitle={
              <>
                <span className="text-emerald-600 dark:text-emerald-400">
                  +{Math.max(1, Math.floor(totalAssets / 5))}
                </span>{" "}
                from last month
              </>
            }
            icon={<Grid2X2 className="h-4 w-4" />}
          />
          <StatCard
            title="Active Fields"
            value={String(activeCount).padStart(2, "0")}
            subtitle="Ready for booking"
            icon={<BadgeCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          />
          <StatCard
            title="In Maintenance"
            value={String(maintCount).padStart(2, "0")}
            subtitle="Estimated 4h remaining"
            icon={<CalendarClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          />
        </div>

        {/* Search + quick filters */}
        <Card className="p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search assets..."
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                All
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-emerald-700 dark:text-emerald-300"
              >
                Active
              </Button>
              <Button variant="outline" size="sm" className="text-amber-700 dark:text-amber-300">
                Maintenance
              </Button>
            </div>
          </div>
        </Card>

        {/* Content */}
        <div
          className={[
            "grid gap-3",
            "md:transition-[grid-template-columns] md:duration-300 md:ease-in-out",
            selectedAsset ? "md:grid-cols-[1fr_360px]" : "md:grid-cols-1",
          ].join(" ")}
        >
          {view === "card" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              <AddAssetTile
                onClick={() => {
                  setEditingFieldId(null);
                  setDialogOpen(true);
                }}
              />
              {filtered.map((a) => (
                <AssetCard
                  key={a.id}
                  asset={a}
                  onView={(id) => {
                    setSelectedId(id);
                    setDetailOpen(true);
                  }}
                  onEdit={(id) => {
                    setEditingFieldId(id);
                    setDialogOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div className="p-3">
                <div className="text-sm font-medium">Assets</div>
                <div className="text-xs text-muted-foreground">{filtered.length} shown</div>
              </div>
              <Separator />
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((a) => (
                      <TableRow key={a.id} className="hover:bg-muted/40">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>{a.name}</span>
                            {a.id.startsWith("temp-") ? (
                              <span className="animate-pulse text-[10px] font-normal text-muted-foreground">
                                Syncing...
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>{a.type}</TableCell>
                        <TableCell>
                          <AreaTag area={a.area} />
                        </TableCell>
                        <TableCell>
                          <StatusPill status={a.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">{a.next ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedId(a.id);
                                    setDetailOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingFieldId(a.id);
                                    setDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Remove</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                          {isLoading ? "Loading assets..." : "No assets found."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          <div
            className={cn(
              "hidden md:block",
              "md:sticky md:top-4",
              "transition-all duration-300 ease-in-out",
              selectedAsset
                ? "opacity-100 translate-x-0"
                : "pointer-events-none translate-x-2 opacity-0",
            )}
          >
            {selectedAsset ? (
              <FieldDetailsPanel asset={selectedAsset} onClose={() => setSelectedId(null)} />
            ) : null}
          </div>
        </div>
      </div>

      {!isDesktop ? (
        <Sheet open={detailOpen && !!selectedAsset} onOpenChange={setDetailOpen}>
          <SheetContent side="right" className="w-full sm:w-[420px]">
            <SheetHeader>
              <SheetTitle>Field Details</SheetTitle>
            </SheetHeader>
            {selectedAsset ? (
              <div className="pt-4">
                <FieldDetailsPanel
                  asset={selectedAsset}
                  onClose={() => {
                    setDetailOpen(false);
                    setSelectedId(null);
                  }}
                />
              </div>
            ) : null}
          </SheetContent>
        </Sheet>
      ) : null}

      <FieldFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingFieldId(null);
        }}
        mode={editingAsset ? "edit" : "create"}
        initialValue={
          editingAsset
            ? {
                id: editingAsset.id,
                name: editingAsset.name,
                sportId: editingAsset.sportId,
                status: editingAsset.status,
                area: editingAsset.area,
                locationNote: editingAsset.description,
              }
            : null
        }
        isSubmitting={isPending || createField.isPending || updateField.isPending}
        onSubmit={async (payload) => {
          if (editingAsset) {
            try {
              await updateField.mutateAsync({
                id: editingAsset.id,
                name: payload.name,
                sportId: payload.sportId,
                area: payload.area,
                status: payload.status,
                locationNote: payload.locationNote,
              });
              toast.success("Field updated.");
              setDialogOpen(false);
              setEditingFieldId(null);
            } catch (err: any) {
              toast.error(err?.message ?? "Failed to update field.");
            }
            return;
          }

          const tempAsset: Asset = {
            id: `temp-${Date.now()}`,
            name: payload.name,
            type: "Unknown",
            sportId: payload.sportId,
            description: payload.locationNote ?? undefined,
            area: payload.area,
            status: payload.status,
            imageUrl: null,
          };
          setDialogOpen(false);

          startTransition(async () => {
            applyOptimistic([tempAsset, ...assets]);
            try {
              await createField.mutateAsync({
                name: payload.name,
                sportId: payload.sportId,
                area: payload.area,
                status: payload.status,
                locationNote: payload.locationNote,
              });
              toast.success("Field created.");
            } catch (err: any) {
              toast.error(err?.message ?? "Failed to create field.");
            }
          });
        }}
      />
    </TooltipProvider>
  );
}
