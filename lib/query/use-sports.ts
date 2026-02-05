import { useQuery } from "@tanstack/react-query";

import { fetchSports } from "@/lib/api/sports";
import { queryKeys } from "@/lib/query/query-keys";

export function useSports() {
  return useQuery({
    queryKey: queryKeys.sports(),
    queryFn: fetchSports,
    staleTime: 5 * 60_000,
  });
}
