import { api } from "@/lib/api/api-client";

export type CenterProfile = {
  id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  center_id: string | null;
  centers: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    country_code: string | null;
    postal_code: string | null;
    business_id: string | null;
    contact_person: string | null;
    contact_person_phone: string | null;
    coordinates_id?: string | null;
    status: string | null;
    created_at: string | null;
    coordinates?: {
      id: string;
      latitude: number;
      longitude: number;
      source: string | null;
      created_at: string | null;
      geom_geojson?: GeoJSON.Geometry | null;
      service_area_geojson?: GeoJSON.Geometry | null;
    } | null;
  } | null;
};

export type CenterProfileResponse = {
  profile: CenterProfile;
};

export type UpdateCenterAddressPayload = {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  countryCode?: string | null;
};

export async function fetchCenterProfile() {
  return api.get<CenterProfileResponse>("/api/center/profile", { withAuth: true });
}

export async function updateCenterAddress(payload: UpdateCenterAddressPayload) {
  return api.patch<{ ok: boolean }>("/api/center/profile", payload, { withAuth: true });
}
