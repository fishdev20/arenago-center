// app/center/pending/pending-client.tsx
"use client";

import { format } from "date-fns";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  HelpCircle,
  Hourglass,
  IdCard,
  PencilLine,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type CenterStatus = "pending" | "active" | "rejected" | null;

export default function PendingClient(props: {
  userDisplayName: string;
  centerName: string;
  createdAt: string | null;
  centerStatus: CenterStatus;
  canEdit?: boolean;
}) {
  const submittedLabel = React.useMemo(() => {
    if (!props.createdAt) return "Submitted recently";
    try {
      return `Completed on ${format(new Date(props.createdAt), "MMM d, yyyy")}`;
    } catch {
      return "Submitted recently";
    }
  }, [props.createdAt]);

  const isRejected = props.centerStatus === "rejected";
  const isPending = props.centerStatus === "pending" || !props.centerStatus;

  const headline = isRejected
    ? "Your application needs changes"
    : "Your application is under review";

  const subline = isRejected
    ? "Please update your details. Our team will re-check after you resubmit."
    : "We're currently verifying your sports center details. This process typically takes between 24 and 48 hours.";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <Building2 className="h-6 w-6 text-primary" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{headline}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{subline}</p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">
            Center: <span className="font-medium text-foreground">{props.centerName}</span>
          </span>

          {isPending ? (
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
              <Hourglass className="h-3.5 w-3.5 text-muted-foreground" />
              Pending verification
            </span>
          ) : isRejected ? (
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
              <HelpCircle className="h-3.5 w-3.5 text-destructive" />
              Action required
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
              Approved
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main grid */}
      <div className="mt-8 flex gap-4 flex-col">
        {/* Timeline */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Verification progress</div>
              <div className="text-xs text-muted-foreground">
                We’ll notify you once your application is approved.
              </div>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs">
              <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />
              Est. 24–48h
            </span>
          </div>

          <Separator className="my-4" />

          <Stepper
            rejected={isRejected}
            submittedLabel={submittedLabel}
            inProgressLabel={
              isRejected
                ? "We found some missing or incorrect information."
                : "Our admin team is reviewing your documents."
            }
          />
        </Card>

        {/* Checklist */}
        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr]">
            <div className="relative min-h-[140px] sm:min-h-full">
              {/* Put a real image at /public/images/pending-venue.jpg */}
              <Image
                src="/images/pending-venue.jpg"
                alt="Sports center"
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="p-5">
              <div className="text-sm font-semibold">Reviewing checklist</div>
              <p className="mt-1 text-xs text-muted-foreground">
                These items help us verify your center and ensure booking quality.
              </p>

              <div className="mt-4 space-y-2">
                <CheckRow
                  icon={<FileText className="h-4 w-4" />}
                  text="Business registration documents"
                />
                <CheckRow
                  icon={<ShieldCheck className="h-4 w-4" />}
                  text="Field & facility specifications"
                />
                <CheckRow
                  icon={<IdCard className="h-4 w-4" />}
                  text="Owner identity verification"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Contact support
                </Button>

                {props.canEdit ? (
                  <Button variant="outline" className="gap-2" asChild>
                    <Link href="/center/application/edit">
                      <PencilLine className="h-4 w-4" />
                      Edit application
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer links */}
      <div className="mt-6 flex flex-col items-center gap-2 text-sm">
        <Link
          href="/center/settings/profile"
          className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline"
        >
          Preview my profile <ExternalLink className="h-4 w-4" />
        </Link>

        <div className="text-xs text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{props.userDisplayName}</span>
        </div>
      </div>
    </div>
  );
}

function CheckRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm">
      <span className="text-primary">{icon}</span>
      <span className="text-foreground">{text}</span>
      <CheckCircle2 className="ml-auto h-4 w-4 text-muted-foreground" />
    </div>
  );
}

function Stepper({
  rejected,
  submittedLabel,
  inProgressLabel,
}: {
  rejected: boolean;
  submittedLabel: string;
  inProgressLabel: string;
}) {
  return (
    <div className="space-y-4">
      <Step
        active
        done
        title="Registration submitted"
        subtitle={submittedLabel}
        icon={<CheckCircle2 className="h-5 w-5" />}
      />

      <Step
        active
        done={!rejected}
        title={rejected ? "Changes requested" : "Verification in progress"}
        subtitle={inProgressLabel}
        icon={<Hourglass className="h-5 w-5" />}
      />

      <Step
        active={false}
        done={false}
        title="Final approval"
        subtitle={
          rejected
            ? "Waiting for you to update and resubmit"
            : "Waiting for verification to complete"
        }
        icon={<BadgeCheck className="h-5 w-5" />}
        muted
      />
    </div>
  );
}

function Step({
  active,
  done,
  title,
  subtitle,
  icon,
  muted,
}: {
  active: boolean;
  done: boolean;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={[
            "flex h-9 w-9 items-center justify-center rounded-xl border",
            done ? "bg-primary text-primary-foreground border-primary/40" : "",
            !done && active ? "bg-primary/10 text-primary border-primary/20" : "",
            muted ? "bg-muted text-muted-foreground border-border" : "",
          ].join(" ")}
        >
          {icon}
        </div>

        <div className="mt-2 h-10 w-px bg-border" />
      </div>

      <div className="pt-1">
        <div className={["text-sm font-semibold", muted ? "text-muted-foreground" : ""].join(" ")}>
          {title}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </div>
  );
}
