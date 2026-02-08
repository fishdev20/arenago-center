import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

type CenterRow = {
  id: string;
  name: string;
  status: string | null;
  created_at: string | null;
};

type ProfileRow = {
  id: string;
  role: string | null;
};

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: centers }, { data: profiles }] = await Promise.all([
    supabase
      .from("centers")
      .select("id,name,status,created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("profiles").select("id,role"),
  ]);

  const centerRows = (centers ?? []) as CenterRow[];
  const profileRows = (profiles ?? []) as ProfileRow[];

  const pendingCenters = centerRows.filter((c) => c.status === "pending").length;
  const activeCenters = centerRows.filter((c) => c.status === "active").length;
  const totalCenters = centerRows.length;

  const adminCount = profileRows.filter((p) => p.role === "admin" || p.role === "superadmin").length;
  const centerUserCount = profileRows.filter((p) => p.role === "center").length;
  const endUserCount = profileRows.filter((p) => p.role === "user").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of centers and platform users.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total centers" value={String(totalCenters)} />
        <MetricCard title="Pending approvals" value={String(pendingCenters)} />
        <MetricCard title="Active centers" value={String(activeCenters)} />
        <MetricCard title="Admin users" value={String(adminCount)} />
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent center registrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {centerRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No centers yet.</p>
            ) : (
              centerRows.map((center) => (
                <div key={center.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{center.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {center.created_at
                          ? format(new Date(center.created_at), "MMM d, yyyy • h:mm a")
                          : "Unknown date"}
                      </div>
                    </div>
                    <Badge variant="outline">{center.status ?? "unknown"}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">User distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RoleRow label="Center accounts" value={centerUserCount} />
            <Separator />
            <RoleRow label="End users" value={endUserCount} />
            <Separator />
            <RoleRow label="Admin & superadmin" value={adminCount} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function RoleRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
