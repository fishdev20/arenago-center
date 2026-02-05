"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import * as React from "react";

type CenterRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string;
};

function StatusBadge({ status }: { status: string }) {
  if (status === "active") return <Badge className="bg-emerald-600 text-white">Active</Badge>;
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}

export default function CentersTable({ centers }: { centers: CenterRow[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  async function approve(centerId: string) {
    setLoadingId(centerId);
    try {
      const res = await fetch("/api/admin/approve-center", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ centerId }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Approve failed");

      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "Approve failed");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[260px]">Center</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[180px] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {centers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                No centers found.
              </TableCell>
            </TableRow>
          ) : (
            centers.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleString()}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.email ?? "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.phone ?? "—"}</TableCell>
                <TableCell>
                  <StatusBadge status={c.status} />
                </TableCell>
                <TableCell className="text-right">
                  {c.status === "pending" ? (
                    <Button
                      onClick={() => approve(c.id)}
                      disabled={loadingId === c.id}
                      className="min-w-[120px]"
                    >
                      {loadingId === c.id ? "Approving..." : "Approve"}
                    </Button>
                  ) : (
                    <Button variant="outline" disabled className="min-w-[120px]">
                      No action
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
