import { apiRequest } from "./client";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  preferredContactTime: string | null;
  message: string | null;
  source: string;
  stage: string;
  propertyId: string | null;
  agentId: string | null;
  customerId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LeadCreatePayload = {
  name: string;
  email: string;
  phone?: string;
  preferredContactTime?: string;
  message?: string;
  source: string;
  propertyId?: string;
};

export type LeadStage =
  | "new"
  | "contacted"
  | "qualified"
  | "visit_scheduled"
  | "negotiation"
  | "won"
  | "lost";

export type LeadUpdatePayload = {
  agentId?: string | null;
  source?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  preferredContactTime?: string | null;
  message?: string | null;
};

export type LeadNote = {
  id: string;
  body: string;
  authorId: string | null;
  authorName: string | null;
  createdAt: string;
};

export type PaginatedLeads = {
  data: Lead[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
};

export function listLeads(params?: {
  page?: number;
  pageSize?: number;
  stage?: LeadStage;
  propertyId?: string;
}) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("pageSize", String(params.pageSize));
  if (params?.stage) q.set("stage", params.stage);
  if (params?.propertyId) q.set("propertyId", params.propertyId);
  const qs = q.toString();
  return apiRequest<PaginatedLeads>(`/leads${qs ? `?${qs}` : ""}`);
}

export function getLead(id: string) {
  return apiRequest<Lead>(`/leads/${id}`);
}

export function updateLead(id: string, payload: LeadUpdatePayload) {
  return apiRequest<Lead>(`/leads/${id}`, { method: "PATCH", body: payload });
}

export function updateLeadStage(id: string, stage: LeadStage) {
  return apiRequest<Lead>(`/leads/${id}/stage`, {
    method: "PATCH",
    body: { stage },
  });
}

export function listLeadNotes(id: string) {
  return apiRequest<LeadNote[]>(`/leads/${id}/notes`);
}

export function createLeadNote(id: string, body: string) {
  return apiRequest<LeadNote>(`/leads/${id}/notes`, {
    method: "POST",
    body: { body },
  });
}

export function createLead(payload: LeadCreatePayload, idempotencyKey: string) {
  return apiRequest<Lead>("/leads", {
    method: "POST",
    body: payload,
    headers: { "Idempotency-Key": idempotencyKey },
  });
}
