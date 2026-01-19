"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PriceAvailabilityHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        Import
      </Button>
      <Button size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        New rule
      </Button>
    </div>
  );
}
