import { apiRequest } from "./client";

export type NotificationItem = {
  id: string;
  channel: "in_app" | "email";
  type?: string;
  title: string;
  body?: string | null;
  read: boolean;
  createdAt: string;
  payload?: unknown;
};

export type NotificationsListResponse = {
  data: NotificationItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
};

export function listNotifications(params?: { page?: number; pageSize?: number }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
  const q = qs.toString();
  return apiRequest<NotificationsListResponse>(`/notifications${q ? `?${q}` : ""}`);
}

export function markNotificationRead(id: string) {
  return apiRequest<NotificationItem>(`/notifications/${id}/read`, { method: "POST" });
}

export function markAllNotificationsRead() {
  return apiRequest<{ message: string }>("/notifications/read-all", { method: "POST" });
}
