"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CalendarActions() {
  return (
    <div className="flex items-center gap-2">
      <Input placeholder="Search booking..." className="h-9 w-55" />
      <Button size="sm">Create booking</Button>
    </div>
  );
}
