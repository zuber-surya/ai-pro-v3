import { apiRequest } from "./client";

export type NotificationChannel = "email" | "in_app";

export type NotificationRule = {
  id: string;
  event: string;
  channels: NotificationChannel[];
  enabled: boolean;
  template?: string | null;
};

export type NotificationRulesListResponse = {
  data: NotificationRule[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type NotificationRuleCreate = {
  event: string;
  channels: NotificationChannel[];
  enabled?: boolean;
  template?: string;
};

export type NotificationRuleUpdate = {
  channels?: NotificationChannel[];
  enabled?: boolean;
  template?: string | null;
};

export function listNotificationRules(params?: { page?: number; pageSize?: number }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
  const q = qs.toString();
  return apiRequest<NotificationRulesListResponse>(`/notification-rules${q ? `?${q}` : ""}`);
}

export function createNotificationRule(payload: NotificationRuleCreate) {
  return apiRequest<NotificationRule>("/notification-rules", {
    method: "POST",
    body: payload,
  });
}

export function updateNotificationRule(id: string, payload: NotificationRuleUpdate) {
  return apiRequest<NotificationRule>(`/notification-rules/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteNotificationRule(id: string) {
  return apiRequest<void>(`/notification-rules/${id}`, { method: "DELETE" });
}
