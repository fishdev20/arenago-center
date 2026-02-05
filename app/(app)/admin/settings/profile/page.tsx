"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as React from "react";

export default function ProfileForm() {
  const [loading, setLoading] = React.useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO: call your API to update profiles (display_name, phone, photo_url...)
    setTimeout(() => setLoading(false), 500);
  }

  return (
    <Card className="p-4">
      <div className="mb-4">
        <div className="text-base font-semibold">Profile</div>
        <div className="text-sm text-muted-foreground">Update your personal information.</div>
      </div>

      <form onSubmit={onSave} className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Display name" defaultValue="Admin User" />
          <Input placeholder="Phone" defaultValue="+358 40 123 4567" />
        </div>

        <Input placeholder="Email (read-only)" defaultValue="admin@example.com" disabled />
        <Input placeholder="Photo URL" defaultValue="" />

        <div className="pt-2 flex justify-end">
          <Button disabled={loading}>{loading ? "Saving..." : "Save changes"}</Button>
        </div>
      </form>
    </Card>
  );
}
