"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import * as React from "react";

export default function SecurityActions() {
  const [loading, setLoading] = React.useState(false);

  async function sendResetEmail() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const email = user?.email;
      if (!email) throw new Error("Missing email in session.");

      // Supabase sends a reset link to the user email.
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;

      alert("Password reset email sent.");
    } catch (e: any) {
      alert(e?.message ?? "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  async function signOutAll() {
    setLoading(true);
    try {
      // Supabase client can only sign out current session.
      // For "sign out all sessions", you’d implement a server route with service role
      // to revoke refresh tokens. For now, sign out current:
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = "/login";
    } catch (e: any) {
      alert(e?.message ?? "Failed to sign out.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <div>
        <div className="text-base font-semibold">Security</div>
        <div className="text-sm text-muted-foreground">Manage password and session security.</div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold">Reset password</div>
          <div className="text-sm text-muted-foreground">
            Send a password reset link to your email.
          </div>
        </div>
        <Button onClick={sendResetEmail} disabled={loading} variant="outline">
          Send reset email
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold">Sign out</div>
          <div className="text-sm text-muted-foreground">Sign out from this device.</div>
        </div>
        <Button onClick={signOutAll} disabled={loading} variant="destructive">
          Sign out
        </Button>
      </div>
    </Card>
  );
}
