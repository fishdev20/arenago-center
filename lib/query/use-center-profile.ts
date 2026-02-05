import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchCenterProfile, updateCenterAddress } from "@/lib/api/center-profile";
import { queryKeys } from "@/lib/query/query-keys";

export function useCenterProfile() {
  return useQuery({
    queryKey: queryKeys.centerProfile(),
    queryFn: fetchCenterProfile,
  });
}

export function useUpdateCenterAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCenterAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.centerProfile() });
    },
  });
}
