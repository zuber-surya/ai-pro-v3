import { apiRequest } from "./client";
import type { TokenResponse, UserPublic } from "@/types/api";

export type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export function register(payload: RegisterPayload) {
  return apiRequest<TokenResponse>("/auth/register", {
    method: "POST",
    body: payload,
    skipAuthRefresh: true,
  });
}

export function login(payload: LoginPayload) {
  return apiRequest<TokenResponse>("/auth/token", {
    method: "POST",
    body: payload,
    skipAuthRefresh: true,
  });
}

export function refresh(refreshToken: string) {
  return apiRequest<TokenResponse>("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
    skipAuthRefresh: true,
  });
}

export function logout() {
  return apiRequest<void>("/auth/logout", {
    method: "POST",
  });
}

export function getMe() {
  return apiRequest<UserPublic>("/auth/me", {
    method: "GET",
  });
}
