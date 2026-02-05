import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/server/geocoding";
import { upsertCenterCoordinates } from "@/lib/server/center-coordinates";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only
);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const userId = body?.userId as string | undefined;
  const centerName = body?.centerName as string | undefined;
  const email = body?.email as string | undefined;
  const address = body?.address as string | undefined;
  const postalCode = body?.postalCode as string | undefined;
  const city = body?.city as string | undefined;
  const country = body?.country as string | undefined;
  const countryCode = body?.countryCode as string | undefined;
  const businessId = body?.businessId as string | undefined;
  const contactPerson = body?.contactPerson as string | undefined;
  const contactPersonPhone = body?.contactPersonPhone as string | undefined;

  const nominatimUserAgent =
    process.env.NOMINATIM_USER_AGENT ?? "arenago-center/1.0 (support@arenago.app)";

  if (!userId || !centerName || !email) {
    return NextResponse.json({ error: "Missing userId/centerName/email" }, { status: 400 });
  }

  // 1) Create center row (pending)
  const { data: center, error: centerErr } = await admin
    .from("centers")
    .insert({
      name: centerName,
      email,
      address,
      postal_code: postalCode,
      city,
      country,
      country_code: countryCode,
      business_id: businessId,
      contact_person: contactPerson,
      contact_person_phone: contactPersonPhone,
      status: "pending",
      created_by: userId,
    })
    .select("id")
    .single();

  if (centerErr) {
    return NextResponse.json({ error: centerErr.message }, { status: 400 });
  }

  // 1.1) Geocode address with Nominatim (best-effort)
  try {
    const query = [address, city, postalCode, country].filter(Boolean).join(", ");
    if (query) {
      const geo = await geocodeAddress(query, nominatimUserAgent);
      if (geo) {
        const coordRow = await upsertCenterCoordinates({
          centerId: center.id,
          latitude: geo.latitude,
          longitude: geo.longitude,
          serviceAreaWkt: geo.serviceAreaWkt,
          admin,
        });
        if (coordRow?.id) {
          console.log(
            "[center/register] Coordinates saved",
            coordRow.id,
            geo.latitude,
            geo.longitude,
          );
        }
      }
    }
  } catch {
    // best-effort only
  }

  // 2) Update profile (optional but useful for DB joins / UI)
  const { error: profErr } = await admin
    .from("profiles")
    .upsert(
      { id: userId, role: "center", center_id: center.id, is_active: true },
      { onConflict: "id" },
    );

  if (profErr) {
    return NextResponse.json({ error: profErr.message }, { status: 400 });
  }

  // 3) ✅ Set JWT app_metadata role
  const { error: metaErr } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role: "center" },
  });

  if (metaErr) {
    return NextResponse.json({ error: metaErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, centerId: center.id });
}
