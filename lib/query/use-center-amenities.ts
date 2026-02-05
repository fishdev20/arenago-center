import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCenterAmenity,
  deleteCenterAmenity,
  fetchCenterAmenities,
  updateCenterAmenity,
} from "@/lib/api/center-amenities";
import { queryKeys } from "@/lib/query/query-keys";

export function useCenterAmenities() {
  return useQuery({
    queryKey: queryKeys.centerAmenities(),
    queryFn: fetchCenterAmenities,
  });
}

export function useCreateCenterAmenity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCenterAmenity,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.centerAmenities() }),
  });
}

export function useUpdateCenterAmenity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateCenterAmenity(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.centerAmenities() }),
  });
}

export function useDeleteCenterAmenity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCenterAmenity(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.centerAmenities() }),
  });
}
