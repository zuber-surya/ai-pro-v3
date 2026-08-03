import { AppError } from "../middleware/errorHandler.js";
import type { AuthUser } from "../middleware/requireAuth.middleware.js";
import { prisma } from "../lib/prisma.js";
import {
  leadRepository,
  toPublicLead,
  toPublicLeadNote,
} from "../repositories/lead.repository.js";
import { propertyRepository } from "../repositories/property.repository.js";
import type {
  LeadCreateInput,
  LeadNoteCreateInput,
  LeadStagePatchInput,
  LeadUpdateInput,
  ListLeadsQuery,
} from "../validators/lead.validators.js";
import { notificationService } from "./notification.service.js";

async function resolveAgentId(actor: AuthUser): Promise<string | null> {
  if (actor.role !== "agent") return null;
  const agent = await prisma.agent.findUnique({ where: { userId: actor.id } });
  return agent?.id ?? null;
}

async function assertCanAccessLead(leadId: string, actor: AuthUser) {
  const lead = await leadRepository.findById(leadId);
  if (!lead) throw new AppError("RESOURCE_NOT_FOUND", "Lead not found", 404);

  if (actor.role === "admin" || actor.role === "super_admin") {
    return lead;
  }

  if (actor.role === "agent") {
    const agentId = await resolveAgentId(actor);
    if (!agentId || lead.assigneeAgentId !== agentId) {
      throw new AppError("AUTH_FORBIDDEN", "Insufficient permissions", 403);
    }
    return lead;
  }

  if (actor.role === "customer" && lead.customerUserId === actor.id) {
    return lead;
  }

  throw new AppError("AUTH_FORBIDDEN", "Insufficient permissions", 403);
}

export const leadService = {
  async create(input: LeadCreateInput, actor?: AuthUser, idempotencyKey?: string) {
    let assigneeAgentId: string | null = null;
    let propertyId: string | null = null;

    if (input.propertyId) {
      const property = await propertyRepository.findById(input.propertyId);
      if (!property || property.status !== "published") {
        throw new AppError("RESOURCE_NOT_FOUND", "Property not found", 404);
      }
      propertyId = property.id;
      assigneeAgentId = property.agentId;
    }

    if (idempotencyKey) {
      const existing = await leadRepository.findByIdempotencyKey(idempotencyKey);
      if (existing) {
        return { lead: toPublicLead(existing), replayed: true };
      }
    }

    const customerUserId = actor?.role === "customer" ? actor.id : undefined;

    const lead = await leadRepository.create({
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone?.trim() || null,
      preferredContactTime: input.preferredContactTime?.trim() || null,
      message: input.message?.trim() || null,
      source: input.source.trim(),
      propertyId,
      assigneeAgentId,
      customerUserId: customerUserId ?? null,
      idempotencyKey: idempotencyKey ?? null,
    });

    try {
      await notificationService.notifyNewLead({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        source: lead.source,
        propertyId: lead.propertyId,
        assigneeAgentId: lead.assigneeAgentId,
      });
    } catch {
      /* lead create must succeed even if notify fails */
    }

    return { lead: toPublicLead(lead), replayed: false };
  },

  async list(query: ListLeadsQuery, actor: AuthUser) {
    let assigneeAgentId: string | undefined;
    if (actor.role === "agent") {
      const agentId = await resolveAgentId(actor);
      if (!agentId) {
        return {
          data: [],
          meta: {
            page: query.page,
            pageSize: query.pageSize,
            total: 0,
            totalPages: 1,
          },
        };
      }
      assigneeAgentId = agentId;
    }

    const { total, rows } = await leadRepository.list({
      ...query,
      assigneeAgentId,
    });
    return {
      data: rows.map(toPublicLead),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
    };
  },

  async getById(id: string, actor: AuthUser) {
    const lead = await assertCanAccessLead(id, actor);
    return toPublicLead(lead);
  },

  async update(id: string, input: LeadUpdateInput, actor: AuthUser) {
    await assertCanAccessLead(id, actor);

    if (input.agentId) {
      const agent = await prisma.agent.findUnique({ where: { id: input.agentId } });
      if (!agent) throw new AppError("RESOURCE_NOT_FOUND", "Agent not found", 404);
    }

    const updated = await leadRepository.update(id, {
      assigneeAgentId: input.agentId === undefined ? undefined : input.agentId,
      source: input.source?.trim(),
      name: input.name?.trim(),
      email: input.email?.trim(),
      phone: input.phone === undefined ? undefined : input.phone?.trim() || null,
      preferredContactTime:
        input.preferredContactTime === undefined
          ? undefined
          : input.preferredContactTime?.trim() || null,
      message: input.message === undefined ? undefined : input.message?.trim() || null,
    });
    return toPublicLead(updated);
  },

  async updateStage(id: string, input: LeadStagePatchInput, actor: AuthUser) {
    await assertCanAccessLead(id, actor);
    const updated = await leadRepository.update(id, { stage: input.stage });
    return toPublicLead(updated);
  },

  async listNotes(id: string, actor: AuthUser) {
    await assertCanAccessLead(id, actor);
    const notes = await leadRepository.listNotes(id);
    return notes.map(toPublicLeadNote);
  },

  async createNote(id: string, input: LeadNoteCreateInput, actor: AuthUser) {
    await assertCanAccessLead(id, actor);
    const note = await leadRepository.createNote({
      leadId: id,
      authorId: actor.id,
      body: input.body.trim(),
    });
    return toPublicLeadNote(note);
  },
};
