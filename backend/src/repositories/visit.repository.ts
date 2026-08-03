import type { Visit } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export type PublicVisit = {
  id: string;
  propertyId: string;
  scheduledAt: string;
  status: string;
  notes: string | null;
  leadId: string | null;
};

export function toPublicVisit(visit: Visit): PublicVisit {
  return {
    id: visit.id,
    propertyId: visit.propertyId,
    scheduledAt: visit.scheduledAt.toISOString(),
    status: visit.status,
    notes: visit.notes,
    leadId: visit.leadId,
  };
}

export const visitRepository = {
  create(data: {
    propertyId: string;
    scheduledAt: Date;
    notes?: string | null;
    customerUserId?: string | null;
    createdByUserId?: string | null;
    leadId?: string | null;
  }) {
    return prisma.visit.create({
      data: {
        propertyId: data.propertyId,
        scheduledAt: data.scheduledAt,
        notes: data.notes ?? null,
        customerUserId: data.customerUserId ?? null,
        createdByUserId: data.createdByUserId ?? null,
        leadId: data.leadId ?? null,
        status: "requested",
      },
    });
  },
};
