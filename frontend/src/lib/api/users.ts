import { apiRequest } from "./client";
import type { UserPublic, UserRole } from "@/types/api";

export type PaginatedUsers = {
  data: UserPublic[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type UserCreatePayload = {
  email: string;
  password: string;
  role: UserRole;
  fullName?: string;
  phone?: string;
};

export type UserUpdatePayload = {
  fullName?: string;
  phone?: string | null;
  role?: UserRole;
  isActive?: boolean;
};

export function listUsers(params?: { page?: number; pageSize?: number }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("pageSize", String(params.pageSize));
  const qs = q.toString();
  return apiRequest<PaginatedUsers>(`/users${qs ? `?${qs}` : ""}`);
}

export function createUser(payload: UserCreatePayload) {
  return apiRequest<UserPublic>("/users", { method: "POST", body: payload });
}

export function updateUser(id: string, payload: UserUpdatePayload) {
  return apiRequest<UserPublic>(`/users/${id}`, { method: "PATCH", body: payload });
}

export function getUser(id: string) {
  return apiRequest<UserPublic>(`/users/${id}`);
}
