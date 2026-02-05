"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { AlertCircle, Eye, EyeOff, LockKeyhole, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateForm() {
    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = "Email is required.";
    else if (!emailRegex.test(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) return setError(error.message);

    router.push("/");
    router.refresh();
  }

  function handleEmailBlur() {
    if (!email.trim()) {
      setFieldErrors((prev) => ({ ...prev, email: "Email is required." }));
    } else if (!emailRegex.test(email)) {
      setFieldErrors((prev) => ({ ...prev, email: "Enter a valid email address." }));
    } else {
      setFieldErrors((prev) => {
        const { email: _email, ...rest } = prev;
        return rest;
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-4 px-4 py-12">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <p className="text-sm text-muted-foreground">
        Sign in to access your center dashboard or admin tools.
      </p>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium leading-5" htmlFor="email">
            Email address*
          </label>
          <Input
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => {
                  const { email: _email, ...rest } = prev;
                  return rest;
                });
              }
            }}
            onBlur={handleEmailBlur}
            placeholder="Enter your email address"
            type="email"
            required
          />
          {fieldErrors.email ? (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              {fieldErrors.email}
            </p>
          ) : null}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium leading-5" htmlFor="password">
            Password*
          </label>
          <div className="relative">
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••••••"
              type={showPassword ? "text" : "password"}
              className="pl-9 pr-10"
              required
            />
            <span className="absolute inset-y-0 left-0 inline-flex w-9 items-center justify-center text-muted-foreground">
              <LockKeyhole className="h-4 w-4" />
            </span>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.password ? (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              {fieldErrors.password}
            </p>
          ) : null}
        </div>
        {error ? (
          <p className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        ) : null}
        <Button className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="text-sm text-muted-foreground">
        Center don&apos;t have an account?{" "}
        <Link
          className="font-semibold text-foreground underline underline-offset-4"
          href="/auth/register"
        >
          Register your center
        </Link>
      </div>

      <div className="bg-card rounded-lg border border-border/60 p-3 text-sm">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground/10">
            <Sparkles className="h-4 w-4 text-foreground" />
          </span>
          Are you a player?
        </div>
        <p className="mt-1 text-muted-foreground">
          Discover nearby venues and book instantly.{" "}
          <Link className="underline underline-offset-4" href="https://example.com/player">
            Open the player app
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
