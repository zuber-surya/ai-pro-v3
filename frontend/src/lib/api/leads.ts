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
  propertyId: string;
};

export function createLead(payload: LeadCreatePayload, idempotencyKey: string) {
  return apiRequest<Lead>("/leads", {
    method: "POST",
    body: payload,
    headers: { "Idempotency-Key": idempotencyKey },
  });
}
