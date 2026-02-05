import type { SupabaseClient } from "@supabase/supabase-js";

type UpsertCoordinatesArgs = {
  centerId: string;
  latitude: number;
  longitude: number;
  serviceAreaWkt: string | null;
  admin: SupabaseClient;
};

export async function upsertCenterCoordinates({
  centerId,
  latitude,
  longitude,
  serviceAreaWkt,
  admin,
}: UpsertCoordinatesArgs) {
  const { data: center, error: centerErr } = await admin
    .from("centers")
    .select("coordinates_id")
    .eq("id", centerId)
    .single();

  if (centerErr) throw centerErr;

  if (center?.coordinates_id) {
    const { data, error } = await admin
      .from("center_coordinates")
      .update({
        latitude,
        longitude,
        geom: `SRID=4326;POINT(${longitude} ${latitude})`,
        service_area: serviceAreaWkt ? `SRID=4326;${serviceAreaWkt}` : null,
        source: "nominatim",
      })
      .eq("id", center.coordinates_id)
      .select("id")
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await admin
    .from("center_coordinates")
    .insert({
      latitude,
      longitude,
      geom: `SRID=4326;POINT(${longitude} ${latitude})`,
      service_area: serviceAreaWkt ? `SRID=4326;${serviceAreaWkt}` : null,
      source: "nominatim",
    })
    .select("id")
    .single();

  if (error) throw error;

  if (data?.id) {
    await admin
      .from("centers")
      .update({ coordinates_id: data.id })
      .eq("id", centerId);
  }

  return data;
}
