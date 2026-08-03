import type { Lead, LeadNote, LeadStage, Prisma } from "@prisma/client";
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

export type PublicLeadNote = {
  id: string;
  body: string;
  authorId: string | null;
  authorName: string | null;
  createdAt: string;
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

export function toPublicLeadNote(
  note: LeadNote & { author?: { fullName: string | null } | null },
): PublicLeadNote {
  return {
    id: note.id,
    body: note.body,
    authorId: note.authorId,
    authorName: note.author?.fullName ?? null,
    createdAt: note.createdAt.toISOString(),
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
    assigneeAgentId?: string;
  }) {
    const where: Prisma.LeadWhereInput = {};
    if (params.stage) where.stage = params.stage;
    if (params.propertyId) where.propertyId = params.propertyId;
    if (params.assigneeAgentId) where.assigneeAgentId = params.assigneeAgentId;
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
    propertyId?: string | null;
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
        propertyId: data.propertyId ?? null,
        assigneeAgentId: data.assigneeAgentId ?? null,
        customerUserId: data.customerUserId ?? null,
        idempotencyKey: data.idempotencyKey ?? null,
      },
    });
  },

  update(
    id: string,
    data: {
      assigneeAgentId?: string | null;
      source?: string;
      name?: string;
      email?: string;
      phone?: string | null;
      preferredContactTime?: string | null;
      message?: string | null;
      stage?: LeadStage;
    },
  ) {
    return prisma.lead.update({
      where: { id },
      data: {
        ...(data.assigneeAgentId !== undefined
          ? { assigneeAgentId: data.assigneeAgentId }
          : {}),
        ...(data.source !== undefined ? { source: data.source } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.email !== undefined ? { email: data.email.toLowerCase() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.preferredContactTime !== undefined
          ? { preferredContactTime: data.preferredContactTime }
          : {}),
        ...(data.message !== undefined ? { message: data.message } : {}),
        ...(data.stage !== undefined ? { stage: data.stage } : {}),
      },
    });
  },

  listNotes(leadId: string) {
    return prisma.leadNote.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { fullName: true } } },
    });
  },

  createNote(data: { leadId: string; authorId: string | null; body: string }) {
    return prisma.leadNote.create({
      data: {
        leadId: data.leadId,
        authorId: data.authorId,
        body: data.body,
      },
      include: { author: { select: { fullName: true } } },
    });
  },
};
