import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type PriceRule,
  createCenterAvailabilityOverride,
  createCenterPricingRule,
  deleteCenterAvailabilityOverride,
  deleteCenterPricingRule,
  fetchCenterAvailabilityOverrides,
  fetchCenterPricingRules,
  fetchCenterWeeklyAvailability,
  quoteCenterPricing,
  seedCenterPricingDemoData,
  updateCenterPricingRule,
  updateCenterAvailabilityOverride,
  upsertCenterWeeklyAvailability,
} from "@/lib/api/center-pricing";
import { queryKeys } from "@/lib/query/query-keys";

export function useCenterPricingRules() {
  return useQuery({
    queryKey: queryKeys.centerPricingRules(),
    queryFn: fetchCenterPricingRules,
  });
}

export function useCreateCenterPricingRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCenterPricingRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.centerPricingRules() });
    },
  });
}

export function useUpdateCenterPricingRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCenterPricingRule,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.centerPricingRules() });
      const previous = queryClient.getQueryData<{ rules: PriceRule[] }>(queryKeys.centerPricingRules());

      queryClient.setQueryData<{ rules: PriceRule[] }>(queryKeys.centerPricingRules(), (current) => {
        if (!current?.rules) return current;
        return {
          ...current,
          rules: current.rules.map((rule) => {
            if (rule.id !== payload.id) return rule;
            return {
              ...rule,
              ...(payload.name !== undefined ? { name: payload.name } : {}),
              ...(payload.enabled !== undefined ? { enabled: payload.enabled } : {}),
              ...(payload.appliesTo !== undefined
                ? {
                    applies_to_all: payload.appliesTo === "all",
                    applies_field_ids: payload.appliesTo === "all" ? [] : payload.appliesTo,
                  }
                : {}),
              ...(payload.days !== undefined ? { day_scope: payload.days } : {}),
              ...(payload.timeStart !== undefined ? { time_start: payload.timeStart } : {}),
              ...(payload.timeEnd !== undefined ? { time_end: payload.timeEnd } : {}),
              ...(payload.pricePerHour !== undefined ? { price_per_hour: payload.pricePerHour } : {}),
              ...(payload.priority !== undefined ? { priority: payload.priority } : {}),
            };
          }),
        };
      });

      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.centerPricingRules(), context.previous);
      }
    },
    onSuccess: (response) => {
      queryClient.setQueryData<{ rules: PriceRule[] }>(queryKeys.centerPricingRules(), (current) => {
        if (!current?.rules) return current;
        return {
          ...current,
          rules: current.rules.map((rule) => (rule.id === response.rule.id ? response.rule : rule)),
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.centerPricingRules() });
    },
  });
}

export function useDeleteCenterPricingRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCenterPricingRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.centerPricingRules() });
    },
  });
}

export function useCenterWeeklyAvailability() {
  return useQuery({
    queryKey: queryKeys.centerPricingSchedule(),
    queryFn: fetchCenterWeeklyAvailability,
  });
}

export function useUpsertCenterWeeklyAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertCenterWeeklyAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.centerPricingSchedule() });
    },
  });
}

export function useCenterAvailabilityOverrides() {
  return useQuery({
    queryKey: queryKeys.centerPricingOverrides(),
    queryFn: fetchCenterAvailabilityOverrides,
  });
}

export function useCreateCenterAvailabilityOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCenterAvailabilityOverride,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.centerPricingOverrides() });
    },
  });
}

export function useDeleteCenterAvailabilityOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCenterAvailabilityOverride,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.centerPricingOverrides() });
    },
  });
}

export function useUpdateCenterAvailabilityOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCenterAvailabilityOverride,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.centerPricingOverrides() });
    },
  });
}

export function useCenterPricingQuote() {
  return useMutation({
    mutationFn: quoteCenterPricing,
  });
}

export function useSeedCenterPricingDemoData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seedCenterPricingDemoData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.centerFields() });
      queryClient.invalidateQueries({ queryKey: queryKeys.centerPricingRules() });
      queryClient.invalidateQueries({ queryKey: queryKeys.centerPricingSchedule() });
      queryClient.invalidateQueries({ queryKey: queryKeys.centerPricingOverrides() });
    },
  });
}
