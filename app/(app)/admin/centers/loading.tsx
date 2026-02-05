import { Card } from "@/components/ui/card";

export default function LoadingCenters() {
  return (
    <div className="space-y-4 p-2">
      <div>
        <div className="h-6 w-32 rounded bg-muted" />
        <div className="mt-2 h-4 w-80 rounded bg-muted" />
      </div>

      <Card className="p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 w-48 bg-muted rounded" />
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        ))}
      </Card>
    </div>
  );
}
