import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createCenterField, fetchCenterFields, updateCenterField } from "@/lib/api/center-fields";
import { queryKeys } from "@/lib/query/query-keys";

export function useCenterFields() {
  return useQuery({
    queryKey: queryKeys.centerFields(),
    queryFn: fetchCenterFields,
  });
}

export function useCreateCenterField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCenterField,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.centerFields() });
    },
  });
}

export function useUpdateCenterField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCenterField,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.centerFields() });
    },
  });
}
