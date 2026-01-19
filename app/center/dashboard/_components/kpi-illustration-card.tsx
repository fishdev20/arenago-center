"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export function KpiIllustrationCard({
  title,
  pill,
  value,
  deltaText,
  imageSrc,
}: {
  title: string;
  pill: string;
  value: string;
  deltaText: string;
  imageSrc: string; // e.g. /images/illustrations/profile.svg
}) {
  return (
    <Card className="overflow-hidden rounded-xl bg-card">
      <div className="flex h-[110px] items-stretch justify-between gap-4 p-5">
        {/* Left */}
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground">{title}</div>

          <Badge className="mt-2 rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {pill}
          </Badge>

          <div className="mt-3 flex items-end gap-2">
            <div className="text-2xl font-semibold tracking-tight">{value}</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400">{deltaText}</div>
          </div>
        </div>

        {/* Right illustration */}
        <div className="relative w-[120px] shrink-0">
          <Image
            src={imageSrc}
            alt="Illustration"
            fill
            className="object-contain object-right"
            priority={false}
          />
        </div>
      </div>
    </Card>
  );
}
