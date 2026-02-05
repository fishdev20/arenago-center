import { api } from "@/lib/api/api-client";

export type CenterAmenity = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  is_active: boolean;
  created_at: string;
};

export async function fetchCenterAmenities() {
  return api.get<{ amenities: CenterAmenity[] }>("/api/center/amenities", { withAuth: true });
}

export async function createCenterAmenity(payload: { name: string; icon?: string | null }) {
  return api.post<{ amenity: CenterAmenity }>("/api/center/amenities", payload, { withAuth: true });
}

export async function updateCenterAmenity(id: string, payload: { isActive: boolean }) {
  return api.patch<{ amenity: CenterAmenity }>(`/api/center/amenities/${id}`, payload, {
    withAuth: true,
  });
}

export async function deleteCenterAmenity(id: string) {
  return api.delete<{ ok: true }>(`/api/center/amenities/${id}`, { withAuth: true });
}
