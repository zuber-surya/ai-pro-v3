import { publicEnv } from "@/lib/config/env";
import { getAccessToken } from "@/lib/auth";
import { AppError, type ApiErrorEnvelope } from "@/types/api";
import { apiRequest } from "./client";

export type Agent = {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string | null;
  profileImageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedAgents = {
  data: Agent[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type AgentCreatePayload = {
  name: string;
  email: string;
  phone?: string;
  userId?: string;
};

export type AgentUpdatePayload = {
  name?: string;
  email?: string;
  phone?: string | null;
  isActive?: boolean;
};

export function listAgents(params?: { page?: number; pageSize?: number }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("pageSize", String(params.pageSize));
  const qs = q.toString();
  return apiRequest<PaginatedAgents>(`/agents${qs ? `?${qs}` : ""}`);
}

export function createAgent(payload: AgentCreatePayload) {
  return apiRequest<Agent>("/agents", { method: "POST", body: payload });
}

export function updateAgent(id: string, payload: AgentUpdatePayload) {
  return apiRequest<Agent>(`/agents/${id}`, { method: "PATCH", body: payload });
}

export function deleteAgent(id: string) {
  return apiRequest<void>(`/agents/${id}`, { method: "DELETE" });
}

/** Multipart upload — bypasses JSON apiRequest body encoding. */
export async function uploadAgentImage(id: string, file: File): Promise<Agent> {
  const form = new FormData();
  form.append("file", file);
  const token = getAccessToken();
  const res = await fetch(`${publicEnv.apiBaseUrl}/agents/${id}/image`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    let code = "INTERNAL_ERROR";
    let message = res.statusText;
    let details: AppError["details"] = [];
    try {
      const data = (await res.json()) as ApiErrorEnvelope;
      code = data.error?.code ?? code;
      message = data.error?.message ?? message;
      details = data.error?.details ?? [];
    } catch {
      /* ignore */
    }
    throw new AppError(code, message, res.status, details);
  }
  return (await res.json()) as Agent;
}

export function agentImageSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const base = publicEnv.apiBaseUrl.replace(/\/api\/v1\/?$/, "");
  return `${base}${url}`;
}
