"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { CountryDropdown, type Country } from "@/components/ui/country-dropdown";
import { Input } from "@/components/ui/input";
import { Map, MapClusterLayer, MapControls } from "@/components/ui/map";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCenterProfile, useUpdateCenterAddress } from "@/lib/query/use-center-profile";
import { Building2, MapPin, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

export default function CenterProfile() {
  const { data, isLoading, isError, refetch, isFetching } = useCenterProfile();
  const updateAddress = useUpdateCenterAddress();

  const center = data?.profile?.centers ?? null;
  const coordinates = center?.coordinates ?? null;
  const pointGeoJSON = React.useMemo(() => {
    if (!coordinates?.geom_geojson || coordinates.geom_geojson.type !== "Point") return null;
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: coordinates.geom_geojson,
          properties: {},
        },
      ],
    } as GeoJSON.FeatureCollection;
  }, [coordinates]);

  const areaGeoJSON = React.useMemo(() => {
    if (!coordinates?.service_area_geojson) return null;
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: coordinates.service_area_geojson,
          properties: {},
        },
      ],
    } as GeoJSON.FeatureCollection;
  }, [coordinates]);

  const [formAddress, setFormAddress] = React.useState("");
  const [formCity, setFormCity] = React.useState("");
  const [formState, setFormState] = React.useState("");
  const [formPostalCode, setFormPostalCode] = React.useState("");
  const [formCountry, setFormCountry] = React.useState<Country | null>(null);
  const [mapReady, setMapReady] = React.useState(true);

  React.useEffect(() => {
    if (!center) return;
    setFormAddress(center.address ?? "");
    setFormCity(center.city ?? "");
    setFormState(center.state ?? "");
    setFormPostalCode(center.postal_code ?? "");
    setFormCountry(
      center.country_code
        ? ({
            alpha3: center.country_code,
            name: center.country ?? "",
            alpha2: "",
            countryCallingCodes: [],
            currencies: [],
            ioc: "",
            languages: [],
            status: "",
          } as Country)
        : null,
    );
  }, [center]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      setMapReady(false);
      await updateAddress.mutateAsync({
        address: formAddress,
        city: formCity,
        state: formState,
        postalCode: formPostalCode,
        country: formCountry?.name ?? center?.country ?? null,
        countryCode: formCountry?.alpha3 ?? center?.country_code ?? null,
      });
      toast.success("Address updated.");
      await refetch();
      setMapReady(true);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update address.");
      setMapReady(true);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        {[1, 2, 3].map((key) => (
          <div className="space-y-4" key={key}>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div className="space-y-2" key={`${key}-${idx}`}>
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data?.profile) {
    return <p className="text-sm text-destructive">Failed to load center profile.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Center profile</h2>
        <p className="text-sm text-muted-foreground">Review and update your center details.</p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Center details
          </div>
          <div className="text-sm text-muted-foreground">Read-only center information.</div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <InfoRow label="Center name" value={center?.name} />
          <InfoRow label="Status" value={center?.status} />
          <InfoRow label="Business ID" value={center?.business_id} />
          <InfoRow label="Contact person" value={center?.contact_person} />
          <InfoRow label="Contact phone" value={center?.contact_person_phone} />
          <InfoRow label="Center email" value={center?.email} />
          <InfoRow label="Center phone" value={center?.phone} />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Address
          </div>
          <div className="text-sm text-muted-foreground">Update address details only.</div>
        </div>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSave}>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="address">
              Address
            </label>
            <Input
              id="address"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="Street address"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="city">
              City
            </label>
            <Input
              id="city"
              value={formCity}
              onChange={(e) => setFormCity(e.target.value)}
              placeholder="City"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="state">
              State
            </label>
            <Input
              id="state"
              value={formState}
              onChange={(e) => setFormState(e.target.value)}
              placeholder="State"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="postalCode">
              Postal code
            </label>
            <Input
              id="postalCode"
              value={formPostalCode}
              onChange={(e) => setFormPostalCode(e.target.value)}
              placeholder="Postal code"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="country">
              Country
            </label>
            <CountryDropdown
              defaultValue={formCountry?.alpha3 ?? center?.country_code ?? undefined}
              onChange={(selected) => setFormCountry(selected)}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={updateAddress.isPending}>
              {updateAddress.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Map location
          </div>
          <div className="text-sm text-muted-foreground">
            Based on the address submitted during registration.
          </div>
        </div>
        <div className="h-72 w-full overflow-hidden rounded-md border">
          {mapReady && !isFetching && coordinates?.latitude && coordinates?.longitude ? (
            <Map
              key={`${coordinates.latitude}-${coordinates.longitude}-${coordinates.service_area_geojson ? "area" : "point"}`}
              center={[coordinates.longitude, coordinates.latitude]}
              zoom={16}
              projection={{ type: "mercator" }}
              className="h-full w-full"
            >
              <MapControls position="bottom-right" />
              {pointGeoJSON ? <MapClusterLayer data={pointGeoJSON} /> : null}
              {/* {areaGeoJSON ? <MapGeoJSONLayer data={areaGeoJSON} /> : null} */}
            </Map>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Location coordinates are not available yet.
            </div>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <User className="h-4 w-4 text-muted-foreground" />
            Account
          </div>
          <div className="text-sm text-muted-foreground">Profile linked to your login.</div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <InfoRow label="Display name" value={data.profile.display_name} />
          <InfoRow label="Account email" value={data.profile.email} />
          <InfoRow label="Account phone" value={data.profile.phone} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value || "—"}</div>
    </div>
  );
}
