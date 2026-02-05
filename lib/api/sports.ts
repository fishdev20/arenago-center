import { api } from "@/lib/api/api-client";

export type Sport = {
  id: string;
  name: string;
  slug: string;
};

export type SportsResponse = {
  sports: Sport[];
};

export async function fetchSports() {
  return api.get<SportsResponse>("/api/sports");
}
