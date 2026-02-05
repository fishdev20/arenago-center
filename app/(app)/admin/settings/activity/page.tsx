import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MOCK = [
  { at: "2026-01-21 10:12", action: "Approved center", target: "Elite Sports Center" },
  { at: "2026-01-21 09:45", action: "Rejected center", target: "Random Gym" },
  { at: "2026-01-20 16:10", action: "Updated center info", target: "Helsinki Padel Hub" },
];

export default function ActivityTable() {
  return (
    <Card className="p-4 space-y-4">
      <div>
        <div className="text-base font-semibold">Activity</div>
        <div className="text-sm text-muted-foreground">Your recent admin actions (audit log).</div>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Time</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK.map((r, idx) => (
              <TableRow key={idx}>
                <TableCell className="text-sm text-muted-foreground">{r.at}</TableCell>
                <TableCell className="font-medium">{r.action}</TableCell>
                <TableCell className="text-sm">{r.target}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
