import { apiRequest } from "./client";
import type { TokenResponse } from "@/types/api";

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
