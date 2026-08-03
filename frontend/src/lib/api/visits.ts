import { apiRequest } from "./client";

export type Visit = {
  id: string;
  propertyId: string;
  scheduledAt: string;
  status: string;
  notes: string | null;
  leadId?: string | null;
};

export type VisitCreatePayload = {
  propertyId: string;
  scheduledAt: string;
  notes?: string;
  leadId?: string;
};

export function createVisit(payload: VisitCreatePayload) {
  return apiRequest<Visit>("/visits", {
    method: "POST",
    body: payload,
  });
}
