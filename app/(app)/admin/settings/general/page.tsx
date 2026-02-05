"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SlidersHorizontal } from "lucide-react";
import React from "react";

export default function GeneralSettingsPage() {
  const [address, setAddress] = React.useState("");
  const [font, setFont] = React.useState<string>("inter");
  const [taxId, setTaxId] = React.useState("");
  return (
    <main className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">General</h2>
        <p className="text-sm text-muted-foreground">Settings and options for your application.</p>
      </div>

      <Separator />

      {/* Plan banner */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="text-sm font-semibold">
              Your application is currently on the free plan
            </div>
            <div className="text-sm text-muted-foreground">
              Paid plans offer higher usage limits, additional branches, and much more.{" "}
              <span className="underline">Learn more here</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Chat to us
            </Button>
            <Button variant="outline">Upgrade</Button>
          </div>
        </CardContent>
      </Card>

      {/* Row: Company logo */}
      <SettingsRow
        title="Company Logo"
        description="Update your company logo."
        right={
          <div className="w-full md:max-w-[280px]">
            <Input type="file" />
          </div>
        }
      />

      <Separator />

      {/* Row: System font */}
      <SettingsRow
        title="System Font"
        description="Set the font you want to use in the dashboard."
        right={
          <div className="w-full md:max-w-[220px]">
            <Select value={font} onValueChange={setFont}>
              <SelectTrigger>
                <SelectValue placeholder="Select Font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inter">Inter</SelectItem>
                <SelectItem value="geist">Geist</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <Separator />

      {/* Row: Tax ID */}
      <SettingsRow
        title="Business Tax ID"
        description="Tax ID of the company."
        right={
          <div className="flex w-full gap-2 md:max-w-[360px]">
            <Input
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="Business Tax ID"
            />
            <Button variant="outline" size="icon" aria-label="Tax ID">
              <span className="text-sm font-semibold">ID</span>
            </Button>
          </div>
        }
      />

      <Separator />

      {/* Row: Address */}
      <SettingsRow
        title="Business Address"
        description="Address of the company."
        right={
          <div className="flex w-full gap-2 md:max-w-[360px]">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Business Address"
            />
            <Button variant="outline" size="icon" aria-label="Address">
              <span className="text-sm">🏠</span>
            </Button>
          </div>
        }
      />

      <div className="pt-2">
        <Button>Save Changes</Button>
      </div>

      {/* Danger zone */}
      <Card className="mt-8">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">Remove Account</div>
            <div className="text-sm text-muted-foreground">
              You can do &apos;Disable account&apos; to take a break from panel.
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="text-destructive">
              Deactivate Account
            </Button>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function SettingsRow({
  title,
  description,
  right,
}: {
  title: string;
  description: string;
  right: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_420px] md:items-center">
      <div className="space-y-1">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>

      <div className="md:justify-self-end">{right}</div>
    </div>
  );
}
