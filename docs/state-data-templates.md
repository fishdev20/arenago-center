# State & Data Templates

This project uses:
- React Query for server data (API fetching, caching, syncing).
- Zustand for UI state (local, ephemeral, non-server data).

Use the patterns below as a baseline for new features.

## React Query

### 1) Fetching data from APIs (Axios)

```ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query/query-keys";

type Center = { id: string; name: string };

export function useCenters() {
  return useQuery({
    queryKey: queryKeys.centers(),
    queryFn: () => api.get<Center[]>("/api/centers", { withAuth: true }),
  });
}
```

### 2) Mutations (create/update/delete)

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query/query-keys";

type NewCenter = { name: string };

export function useCreateCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NewCenter) => api.post("/api/centers", payload, { withAuth: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.centers() });
    },
  });
}
```

### 3) Query key conventions

- Use `queryKeys` helpers for consistent cache keys.
- Scope keys by entity and id (e.g. `["center", centerId]`).

## API Client (Axios)

### 1) Basic usage

```ts
import { api } from "@/lib/api/api-client";

type DashboardStats = { bookings: number; revenue: number };

export async function fetchStats() {
  return api.get<DashboardStats>("/api/center/stats", { withAuth: true });
}
```

### 2) Auth token handling

`apiFetch` supports:
- `withAuth: true` (fetches token via Supabase session)
- `token: "..."` (explicit token override)

```ts
api.get("/api/secure", { withAuth: true });
api.get("/api/secure", { token: accessToken, withAuth: true });
```

## Zustand (UI State)

### 1) UI-only state (dialogs, drawers, toggles)

```ts
import { create } from "zustand";

type UIState = {
  isFilterOpen: boolean;
  openFilter: () => void;
  closeFilter: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  isFilterOpen: false,
  openFilter: () => set({ isFilterOpen: true }),
  closeFilter: () => set({ isFilterOpen: false }),
}));
```

## Best Practices

- React Query handles **server state** only (APIs, caching, pagination, background refresh).
- Zustand handles **UI state** only (modals, selected ids, temporary filters).
- Keep query keys centralized in `lib/query/query-keys.ts`.
- Keep API calls centralized in `lib/api/api-client.ts`.
- Prefer small feature-level hooks like `useCenters()` to keep components clean.
