import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/server/geocoding";
import { upsertCenterCoordinates } from "@/lib/server/center-coordinates";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select(
      `
      id,
      display_name,
      email,
      phone,
      role,
      center_id,
      centers:centers (
        id,
        name,
        email,
        phone,
        address,
        city,
        state,
        country,
        country_code,
        postal_code,
        business_id,
        contact_person,
        contact_person_phone,
        coordinates_id,
        status,
        created_at,
        coordinates:center_coordinates_geo (
          id,
          latitude,
          longitude,
          source,
          created_at,
          geom_geojson,
          service_area_geojson
        )
      )
    `,
    )
    .eq("id", authData.user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ profile });
}

export async function PATCH(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const address = body?.address ?? null;
  const city = body?.city ?? null;
  const state = body?.state ?? null;
  const postalCode = body?.postalCode ?? null;
  const country = body?.country ?? null;
  const countryCode = body?.countryCode ?? null;

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("center_id, role")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile?.center_id || profile.role !== "center") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error: updateError } = await admin
    .from("centers")
    .update({
      address,
      city,
      state,
      postal_code: postalCode,
      country,
      country_code: countryCode,
    })
    .eq("id", profile.center_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  // Re-geocode after address update (best-effort)
  try {
    const query = [address, city, postalCode, country].filter(Boolean).join(", ");
    if (query) {
      const nominatimUserAgent =
        process.env.NOMINATIM_USER_AGENT ?? "arenago-center/1.0 (support@arenago.app)";
      const geo = await geocodeAddress(query, nominatimUserAgent);
      if (geo) {
        await upsertCenterCoordinates({
          centerId: profile.center_id,
          latitude: geo.latitude,
          longitude: geo.longitude,
          serviceAreaWkt: geo.serviceAreaWkt,
          admin,
        });
      }
    }
  } catch {
    // best-effort only
  }

  return NextResponse.json({ ok: true });
}
