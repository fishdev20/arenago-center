"use client";

import { format } from "date-fns";
import { Calendar, Download, RefreshCw, X } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMediaQuery } from "@/hooks/use-media-query";
import { StatusBadge } from "./status-badge";
import { api } from "@/lib/api/api-client";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

type Center = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string; // pending | approved | rejected (string from db)
  created_at: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  country_code: string | null;
  postal_code: string | null;
  business_id: string | null;
  contact_person: string | null;
  contact_person_phone: string | null;
  created_by: string | null;
};

const PAGE_SIZE = 5;

function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cls =
    s === "pending"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
      : s === "active"
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
        : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300";

  return <Badge className={cls}>{status}</Badge>;
}

function CenterDetail({
  center,
  onClose,
  onApprove,
  onReject,
  loading,
}: {
  center: Center;
  onClose?: () => void;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
}) {
  const status = center.status.toLowerCase();
  const canApprove = status === "pending" || status === "rejected";
  const canReject = status === "pending" || status === "active";

  return (
    <Card className="relative p-4">
      {onClose && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <div className="flex items-start gap-3 pr-10">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-semibold">{center.name}</h2>
            <StatusPill status={center.status} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            ID: {center.id} • Submitted {format(new Date(center.created_at), "MMM d, h:mm a")}
          </p>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-4">
        <div>
          <div className="text-xs font-semibold tracking-wide text-muted-foreground">
            REGISTRATION DETAILS
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">Contact Email</div>
              <div className="font-medium break-all">{center.email}</div>
            </div>

            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">Phone</div>
              <div className="font-medium">{center.phone}</div>
            </div>

            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">Address</div>
              <div className="font-medium">
                {center.address || "—"}
                {center.city ? `, ${center.city}` : ""}
                {center.postal_code ? ` ${center.postal_code}` : ""}
              </div>
              <div className="text-xs text-muted-foreground">
                {center.state || "—"} {center.country ? `• ${center.country}` : ""}
              </div>
            </div>

            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">Country Code</div>
              <div className="font-medium">{center.country_code || "—"}</div>
            </div>

            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">Business ID</div>
              <div className="font-medium">{center.business_id || "—"}</div>
            </div>

            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">Contact Person</div>
              <div className="font-medium">{center.contact_person || "—"}</div>
            </div>

            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">Contact Phone</div>
              <div className="font-medium">{center.contact_person_phone || "—"}</div>
            </div>

            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">Created By</div>
              <div className="font-medium">{center.created_by || "—"}</div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="w-[50%] text-destructive"
            onClick={onReject}
            disabled={loading || !canReject}
          >
            Reject
          </Button>
          <Button className="w-[50%]" onClick={onApprove} disabled={loading || !canApprove}>
            Approve
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function CentersReview({ centers }: { centers: Center[] }) {
  const [items, setItems] = React.useState<Center[]>(centers);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<string>("pending");
  const [range, setRange] = React.useState("last_30");
  const [page, setPage] = React.useState(1);
  const [actionLoading, setActionLoading] = React.useState(false);

  const [selectedId, setSelectedId] = React.useState<string | null>(centers[0]?.id ?? null);

  // Mobile dialog state
  const [detailOpen, setDetailOpen] = React.useState(false);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  React.useEffect(() => {
    const channel = supabase
      .channel("admin-centers-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "centers" }, (payload) => {
        const row = payload.new as Center;
        setItems((prev) => [row, ...prev.filter((c) => c.id !== row.id)]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "centers" }, (payload) => {
        const row = payload.new as Center;
        setItems((prev) => prev.map((c) => (c.id === row.id ? { ...c, ...row } : c)));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "centers" }, (payload) => {
        const oldRow = payload.old as { id?: string };
        if (!oldRow?.id) return;
        setItems((prev) => prev.filter((c) => c.id !== oldRow.id));
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);

      const matchesStatus = status === "all" ? true : c.status.toLowerCase() === status;

      // range is mock for now
      return matchesQuery && matchesStatus;
    });
  }, [items, query, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const selected = selectedId ? (filtered.find((c) => c.id === selectedId) ?? null) : null;

  React.useEffect(() => {
    // keep page valid when filters change
    if (page !== safePage) setPage(safePage);

    // if selected filtered out, clear selection + close dialog
    if (selectedId && !filtered.some((c) => c.id === selectedId)) {
      setSelectedId(null);
      setDetailOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.length, query, status]);

  const openDetail = (id: string) => {
    setSelectedId(id);

    // On small screens: open dialog (CSS handles visibility)
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    // optional: keep selectedId so row remains highlighted after closing dialog
    // If you want to clear selection on close, uncomment next line:
    // setSelectedId(null);
  };

  const isDesktopSplit = selectedId !== null;

  const updateStatus = async (id: string, action: "approve" | "reject") => {
    try {
      setActionLoading(true);
      const res = await api.post<{ ok: boolean; center: { id: string; status: string } }>(
        "/api/admin/approve-center",
        { centerId: id, action },
        { withAuth: true },
      );
      if (!res?.ok) throw new Error("Failed to update center");

      setItems((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: res.center.status } : c)),
      );
      toast.success(`Center ${action === "approve" ? "approved" : "rejected"}.`);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update center.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Center Registrations</h1>
          <p className="text-sm text-muted-foreground">
            Review and verify operational licenses for pending centers.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <Card className="p-3 flex flex-col gap-2 md:flex-row md:items-center">
        <Input
          placeholder="Filter by ID or property..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="md:flex-1"
        />

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-[160px]">
            <span className="text-xs text-muted-foreground mr-2">Status:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-full md:w-[160px]">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_7">Last 7 Days</SelectItem>
            <SelectItem value="last_30">Last 30 Days</SelectItem>
            <SelectItem value="last_90">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {/* Main: responsive split on desktop, dialog on mobile */}
      <div
        className={[
          "relative grid gap-4",
          "min-h-[620px]",
          "grid-cols-1",
          // animate columns on desktop only
          "lg:transition-[grid-template-columns] lg:duration-300 lg:ease-in-out",
          isDesktopSplit ? "lg:grid-cols-[2fr_1fr]" : "lg:grid-cols-1",
        ].join(" ")}
      >
        {/* Table */}
        <Card className="overflow-hidden">
          {/* fixed height + internal scroll (table scrollable) */}
          <ScrollArea className="h-full">
            <div className="w-full overflow-x-auto lg:overflow-x-visible">
              <Table className="min-w-[900px] lg:min-w-0">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Center Name</TableHead>
                    <TableHead>Contact Email</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paged.map((c) => {
                    const isSelected = selectedId === c.id;

                    return (
                      <TableRow
                        key={c.id}
                        onClick={() => openDetail(c.id)}
                        className={[
                          "cursor-pointer",
                          "transition-colors",
                          isSelected ? "bg-muted" : "",
                        ].join(" ")}
                      >
                        <TableCell className="relative">
                          {/* left accent bar on selected row */}
                          {isSelected && (
                            <span className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r" />
                          )}
                          <Checkbox checked={isSelected} />
                        </TableCell>

                        <TableCell>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.phone}</div>
                        </TableCell>

                        <TableCell className="text-blue-600">{c.email}</TableCell>

                        <TableCell className="text-muted-foreground">
                          {format(new Date(c.created_at), "MMM d, yyyy")}
                        </TableCell>

                        <TableCell>
                          <StatusBadge status={c.status as "pending" | "active" | "rejected"} />
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {paged.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        No registrations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>

          {/* pagination footer */}
          <div className="flex flex-col gap-2 border-t p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">
              Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} registrations
            </span>

            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={safePage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                return (
                  <Button
                    key={p}
                    size="sm"
                    variant={safePage === p ? "default" : "outline"}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                );
              })}

              <Button
                size="sm"
                variant="outline"
                disabled={safePage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>

        {/* Desktop detail panel (hidden on mobile) */}
        <div
          className={[
            "hidden md:block",
            "md:sticky md:top-4 h-fit",
            "transition-all duration-300 ease-in-out",
            selected ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none",
          ].join(" ")}
        >
          {selected ? (
            <CenterDetail
              center={selected}
              onClose={() => {
                // close panel and expand table
                setSelectedId(null);
              }}
              onApprove={() => updateStatus(selected.id, "approve")}
              onReject={() => updateStatus(selected.id, "reject")}
              loading={actionLoading}
            />
          ) : null}
        </div>

        {/* Mobile detail dialog */}
        {!isDesktop && (
          <Dialog
            open={detailOpen && !!selected}
            onOpenChange={(open) => (open ? null : closeDetail())}
          >
            <DialogContent className="max-w-[92vw] sm:max-w-lg p-0 overflow-hidden">
              {selected && (
                <>
                  <DialogHeader className="p-4 pb-2">
                    <DialogTitle className="text-base">Center Details</DialogTitle>
                  </DialogHeader>
                  <div className="p-4 pt-2">
                    <CenterDetail
                      center={selected}
                      onApprove={() => updateStatus(selected.id, "approve")}
                      onReject={() => updateStatus(selected.id, "reject")}
                      loading={actionLoading}
                    />
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
