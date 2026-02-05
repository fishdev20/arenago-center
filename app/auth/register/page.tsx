"use client";

import * as React from "react";

import UploadDocument from "@/components/app/common/upload-document";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CountryDropdown, type Country } from "@/components/ui/country-dropdown";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api/api-client";
import { supabase } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterCenterPage() {
  const [centerName, setCenterName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");
  const [city, setCity] = React.useState("");
  const [country, setCountry] = React.useState<Country | null>(null);
  const [businessId, setBusinessId] = React.useState("");
  const [contactPerson, setContactPerson] = React.useState("");
  const [contactPersonPhone, setContactPersonPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const passwordTouched = password.length > 0;
  const confirmTouched = confirmPassword.length > 0;
  const passwordsMatch = password === confirmPassword && passwordTouched && confirmTouched;

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const router = useRouter();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateForm() {
    const errors: Record<string, string> = {};

    if (!centerName.trim()) errors.centerName = "Center name is required.";
    if (!address.trim()) errors.address = "Address is required.";
    if (!postalCode.trim()) errors.postalCode = "Postal code is required.";
    if (!city.trim()) errors.city = "City is required.";
    if (!country) errors.country = "Country is required.";
    if (!businessId.trim()) errors.businessId = "Business ID is required.";
    if (!contactPerson.trim()) errors.contactPerson = "Contact person is required.";
    if (!contactPersonPhone.trim()) errors.contactPersonPhone = "Contact phone number is required.";
    if (!email.trim()) errors.email = "Email is required.";
    else if (!emailRegex.test(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 8) errors.password = "Password must be at least 8 characters.";
    if (!confirmPassword) errors.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      const userId = signUpData.user?.id;
      if (!userId) throw new Error("Signup succeeded but user id is missing.");

      const { data: sessionData } = await supabase.auth.getSession();

      // If email confirm ON => no session now, so we can’t proceed on client anyway.
      if (!sessionData.session) {
        setInfo(
          "Registration created. Please check your email to confirm. After confirming, log in and complete registration.",
        );
        toast.info("Check your email to confirm your registration.");
        setLoading(false);
        return;
      }

      // ✅ create center + set app_metadata.role on server
      const json = await api.post<{ ok: boolean; centerId: string }>("/api/center/register", {
        userId,
        centerName,
        email,
        address,
        postalCode,
        city,
        country: country?.name ?? null,
        countryCode: country?.alpha3 ?? null,
        businessId,
        contactPerson,
        contactPersonPhone,
      });
      if (!json?.ok) throw new Error("Failed to create center");

      /**
       * IMPORTANT: JWT role is embedded in access token.
       * After updating app_metadata, the current token may still be old.
       * Force refresh:
       */
      const { data: refreshed, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      console.log("role after refresh:", refreshed.session?.user.app_metadata?.role);

      // Also verify with getUser (hits Supabase, not cache)
      const { data: u } = await supabase.auth.getUser();
      console.log("role from getUser:", u.user?.app_metadata?.role);

      toast.success("Registration submitted. Your center is pending approval.");
      router.push("/center/pending");
    } catch (err: any) {
      setError(typeof err?.message === "string" ? err.message : "Something went wrong.");
      toast.error(typeof err?.message === "string" ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
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
    <div className="flex w-full flex-col gap-6 sm:max-w-xl">
      <div>
        <h2 className="mb-1.5 text-2xl font-semibold">Register your center</h2>
        <p className="text-muted-foreground">
          Submit your center details. Admin will review and activate your account.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-3">
            <div className="text-sm font-semibold">Center info</div>
            <div className="space-y-1">
              <label className="text-sm font-medium leading-5" htmlFor="centerName">
                Center name*
              </label>
              <Input
                id="centerName"
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                placeholder="Enter your center name"
                required
              />
              {fieldErrors.centerName ? (
                <p className="text-xs text-destructive">{fieldErrors.centerName}</p>
              ) : null}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium leading-5" htmlFor="businessId">
                Business ID*
              </label>
              <Input
                id="businessId"
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                placeholder="Enter your business registration ID"
                required
              />
              {fieldErrors.businessId ? (
                <p className="text-xs text-destructive">{fieldErrors.businessId}</p>
              ) : null}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-sm font-semibold">Address</div>
            <div className="space-y-1">
              <label className="text-sm font-medium leading-5" htmlFor="address">
                Address*
              </label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address"
                required
              />
              {fieldErrors.address ? (
                <p className="text-xs text-destructive">{fieldErrors.address}</p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium leading-5" htmlFor="postalCode">
                  Postal code*
                </label>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 10001"
                  required
                />
                {fieldErrors.postalCode ? (
                  <p className="text-xs text-destructive">{fieldErrors.postalCode}</p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium leading-5" htmlFor="city">
                  City*
                </label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  required
                />
                {fieldErrors.city ? (
                  <p className="text-xs text-destructive">{fieldErrors.city}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium leading-5" htmlFor="country">
                Country*
              </label>
              <CountryDropdown
                defaultValue={country?.alpha3}
                onChange={(selected) => setCountry(selected)}
              />
              {fieldErrors.country ? (
                <p className="text-xs text-destructive">{fieldErrors.country}</p>
              ) : null}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-sm font-semibold">Contact</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium leading-5" htmlFor="contactPerson">
                  Contact person*
                </label>
                <Input
                  id="contactPerson"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Full name of contact person"
                  required
                />
                {fieldErrors.contactPerson ? (
                  <p className="text-xs text-destructive">{fieldErrors.contactPerson}</p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium leading-5" htmlFor="contactPersonPhone">
                  Contact phone number*
                </label>
                <div className="flex items-center gap-2">
                  <div className="min-w-16 rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                    {country?.countryCallingCodes?.[0] ?? "+--"}
                  </div>
                  <Input
                    id="contactPersonPhone"
                    value={contactPersonPhone}
                    onChange={(e) => setContactPersonPhone(e.target.value)}
                    placeholder="Phone number"
                    required
                  />
                </div>
                {fieldErrors.contactPersonPhone ? (
                  <p className="text-xs text-destructive">{fieldErrors.contactPersonPhone}</p>
                ) : null}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-sm font-semibold">Account</div>
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
                <p className="text-xs text-destructive">{fieldErrors.email}</p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                    className="pr-10"
                    required
                  />
                  {fieldErrors.password ? (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.password}</p>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium leading-5" htmlFor="confirmPassword">
                  Confirm password*
                </label>

                <div className="relative">
                  <Input
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    type={showConfirmPassword ? "text" : "password"}
                    className="pr-10"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    <span className="sr-only">
                      {showConfirmPassword ? "Hide password" : "Show password"}
                    </span>
                  </button>
                </div>
                {confirmTouched ? (
                  <p
                    className={`text-xs ${passwordsMatch ? "text-emerald-600" : "text-destructive"}`}
                  >
                    {passwordsMatch ? "Passwords match." : "Passwords do not match."}
                  </p>
                ) : null}
                {fieldErrors.confirmPassword ? (
                  <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>
                ) : null}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-sm font-semibold">Documents (optional)</div>
            <UploadDocument />
          </div>

          {info ? <p className="text-sm text-muted-foreground">{info}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button className="w-full" disabled={loading} type="submit">
            {loading ? "Submitting..." : "Submit registration"}
          </Button>
        </form>
      </Card>

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="font-semibold text-foreground underline underline-offset-4" href="/auth/login">
          Log in
        </Link>
      </p>
    </div>
  );
}
