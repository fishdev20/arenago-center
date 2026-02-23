import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type CenterField,
  type CenterFieldsResponse,
  createCenterField,
  fetchCenterFields,
  updateCenterField,
} from "@/lib/api/center-fields";
import { type SportsResponse } from "@/lib/api/sports";
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
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.centerFields() });

      const previousFields = queryClient.getQueryData<CenterFieldsResponse>(queryKeys.centerFields());
      const sports = queryClient.getQueryData<SportsResponse>(queryKeys.sports())?.sports ?? [];
      const matchedSport = sports.find((sport) => sport.id === payload.sportId) ?? null;
      const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const optimisticField: CenterField = {
        id: optimisticId,
        name: payload.name,
        area: payload.area,
        status: payload.status,
        location_note: payload.locationNote ?? null,
        image_url: payload.imageUrl ?? null,
        created_at: new Date().toISOString(),
        sport: matchedSport
          ? {
              id: matchedSport.id,
              name: matchedSport.name,
              slug: matchedSport.slug,
            }
          : null,
      };

      queryClient.setQueryData<CenterFieldsResponse>(queryKeys.centerFields(), (current) => ({
        fields: [optimisticField, ...(current?.fields ?? [])],
      }));

      return { previousFields, optimisticId };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousFields) {
        queryClient.setQueryData(queryKeys.centerFields(), context.previousFields);
      }
    },
    onSuccess: (response, _payload, context) => {
      queryClient.setQueryData<CenterFieldsResponse>(queryKeys.centerFields(), (current) => {
        if (!current?.fields) return { fields: [response.field] };
        return {
          fields: current.fields.map((field) => (field.id === context?.optimisticId ? response.field : field)),
        };
      });
    },
    onSettled: () => {
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
