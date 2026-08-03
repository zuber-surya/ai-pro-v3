import { AppError } from "../middleware/errorHandler.js";
import type { AuthUser } from "../middleware/requireAuth.middleware.js";
import { leadRepository, toPublicLead } from "../repositories/lead.repository.js";
import { propertyRepository } from "../repositories/property.repository.js";
import type { LeadCreateInput, ListLeadsQuery } from "../validators/lead.validators.js";
import { notificationService } from "./notification.service.js";

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

    const customerUserId =
      actor?.role === "customer" ? actor.id : undefined;

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

  async list(query: ListLeadsQuery, _actor: AuthUser) {
    const { total, rows } = await leadRepository.list(query);
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

  async getById(id: string, _actor: AuthUser) {
    const lead = await leadRepository.findById(id);
    if (!lead) throw new AppError("RESOURCE_NOT_FOUND", "Lead not found", 404);
    return toPublicLead(lead);
  },
};
