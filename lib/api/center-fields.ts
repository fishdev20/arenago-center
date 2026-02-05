import { api } from "@/lib/api/api-client";

export type CenterField = {
  id: string;
  name: string;
  area: "Outdoor" | "Indoor";
  status: "active" | "maintenance";
  location_note?: string | null;
  image_url?: string | null;
  created_at: string;
  sport: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export type CenterFieldsResponse = {
  fields: CenterField[];
};

export type CreateCenterFieldPayload = {
  name: string;
  sportId: string;
  area: "Outdoor" | "Indoor";
  status: "active" | "maintenance";
  locationNote?: string;
  imageUrl?: string;
};

export type UpdateCenterFieldPayload = {
  id: string;
  name: string;
  sportId: string;
  area: "Outdoor" | "Indoor";
  status: "active" | "maintenance";
  locationNote?: string;
  imageUrl?: string;
};

export async function fetchCenterFields() {
  return api.get<CenterFieldsResponse>("/api/center/fields", { withAuth: true });
}

export async function createCenterField(payload: CreateCenterFieldPayload) {
  return api.post<{ field: CenterField }>("/api/center/fields", payload, { withAuth: true });
}

export async function updateCenterField(payload: UpdateCenterFieldPayload) {
  const { id, ...body } = payload;
  return api.patch<{ field: CenterField }>(`/api/center/fields/${id}`, body, { withAuth: true });
}
