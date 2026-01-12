"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TEST_EMAIL = "test.test@gmail.com";
const TEST_PASSWORD = "Password123!";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (email === TEST_EMAIL && password === TEST_PASSWORD) {
      router.push("/center/dashboard");
      return;
    }

    setError("Invalid email or password");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center">
      {/* Background image */}
      <Image
        src="/images/home-bg.jpg"
        alt="Sports center background"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Login card */}
      <Card className="relative z-10 w-full max-w-sm">
        <CardHeader className="space-y-3 text-center">
          {/* Logo */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl">
            SC
          </div>

          {/* Title + intro */}
          <div className="space-y-1">
            <CardTitle className="text-2xl">Sports Center</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your fields, bookings, and pricing in one place
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="test.test@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>

          {/* Test credentials hint */}
          <div className="mt-6 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            <p className="font-medium">Test credentials</p>
            <p>Email: {TEST_EMAIL}</p>
            <p>Password: {TEST_PASSWORD}</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
