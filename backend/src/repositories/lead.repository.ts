import type { Lead, LeadStage, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export type PublicLead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  preferredContactTime: string | null;
  message: string | null;
  source: string;
  stage: LeadStage;
  propertyId: string | null;
  agentId: string | null;
  customerId: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toPublicLead(lead: Lead): PublicLead {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    preferredContactTime: lead.preferredContactTime,
    message: lead.message,
    source: lead.source,
    stage: lead.stage,
    propertyId: lead.propertyId,
    agentId: lead.assigneeAgentId,
    customerId: lead.customerUserId,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}

export const leadRepository = {
  findById(id: string) {
    return prisma.lead.findUnique({ where: { id } });
  },

  findByIdempotencyKey(key: string) {
    return prisma.lead.findUnique({ where: { idempotencyKey: key } });
  },

  async list(params: {
    page: number;
    pageSize: number;
    stage?: LeadStage;
    propertyId?: string;
  }) {
    const where: Prisma.LeadWhereInput = {};
    if (params.stage) where.stage = params.stage;
    if (params.propertyId) where.propertyId = params.propertyId;
    const [total, rows] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
    ]);
    return { total, rows };
  },

  create(data: {
    name: string;
    email: string;
    phone?: string | null;
    preferredContactTime?: string | null;
    message?: string | null;
    source: string;
    propertyId: string;
    assigneeAgentId?: string | null;
    customerUserId?: string | null;
    idempotencyKey?: string | null;
  }) {
    return prisma.lead.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone ?? null,
        preferredContactTime: data.preferredContactTime ?? null,
        message: data.message ?? null,
        source: data.source,
        propertyId: data.propertyId,
        assigneeAgentId: data.assigneeAgentId ?? null,
        customerUserId: data.customerUserId ?? null,
        idempotencyKey: data.idempotencyKey ?? null,
      },
    });
  },
};
