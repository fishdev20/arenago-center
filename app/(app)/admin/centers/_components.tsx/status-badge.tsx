import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

type Status = "pending" | "active" | "rejected";

export function StatusBadge({ status }: { status: Status }) {
  const s = status.toLowerCase() as Status;

  const config = {
    pending: {
      label: "Pending",
      icon: Clock,
      className:
        "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
    },
    active: {
      label: "Active",
      icon: CheckCircle2,
      className:
        "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
    },
    rejected: {
      label: "Rejected",
      icon: XCircle,
      className:
        "bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
    },
  }[s];

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}
