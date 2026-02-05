"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import * as React from "react";

function Row({
  title,
  desc,
  defaultChecked,
}: {
  title: string;
  desc: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

export default function NotificationsForm() {
  const [loading, setLoading] = React.useState(false);

  async function onSave() {
    setLoading(true);
    // TODO: save to profiles.notification_prefs (jsonb) or a dedicated table
    setTimeout(() => setLoading(false), 500);
  }

  return (
    <Card className="p-4 space-y-4">
      <div>
        <div className="text-base font-semibold">Notifications</div>
        <div className="text-sm text-muted-foreground">
          Control how you receive operational alerts.
        </div>
      </div>

      <Row
        title="New center registration"
        desc="Get notified when a center submits a registration request."
        defaultChecked
      />
      <Separator />
      <Row
        title="Center status changes"
        desc="Alerts when a center is approved, rejected, or suspended."
        defaultChecked
      />
      <Separator />
      <Row
        title="Daily summary email"
        desc="Receive a daily digest of pending requests and actions."
      />
      <Separator />
      <Row
        title="Security alerts"
        desc="Get notified of suspicious logins and password changes."
        defaultChecked
      />

      <div className="pt-2 flex justify-end">
        <Button onClick={onSave} disabled={loading}>
          {loading ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </Card>
  );
}
