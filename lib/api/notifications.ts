import { api } from "@/lib/api/api-client";

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  payload: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
};

export type NotificationsResponse = {
  notifications: AppNotification[];
};

export async function fetchNotifications() {
  return api.get<NotificationsResponse>("/api/notifications", { withAuth: true });
}

export async function markNotificationRead(id: string) {
  return api.patch<{ ok: true }>(
    "/api/notifications",
    { mode: "one", id },
    { withAuth: true },
  );
}

export async function markAllNotificationsRead() {
  return api.patch<{ ok: true }>("/api/notifications", { mode: "all" }, { withAuth: true });
}
