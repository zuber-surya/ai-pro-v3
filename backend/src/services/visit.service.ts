import { AppError } from "../middleware/errorHandler.js";
import type { AuthUser } from "../middleware/requireAuth.middleware.js";
import { prisma } from "../lib/prisma.js";
import { propertyRepository } from "../repositories/property.repository.js";
import { toPublicVisit, visitRepository } from "../repositories/visit.repository.js";
import type { VisitCreateInput } from "../validators/visit.validators.js";

export const visitService = {
  async create(input: VisitCreateInput, actor: AuthUser) {
    const property = await propertyRepository.findById(input.propertyId);
    if (!property || property.status !== "published") {
      throw new AppError("RESOURCE_NOT_FOUND", "Property not found", 404);
    }

    const scheduledAt = new Date(input.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new AppError("VALIDATION_ERROR", "Invalid scheduledAt", 422, [
        { field: "scheduledAt", issue: "must be a valid date-time" },
      ]);
    }
    if (scheduledAt.getTime() < Date.now() - 60_000) {
      throw new AppError("VALIDATION_ERROR", "scheduledAt must be in the future", 422, [
        { field: "scheduledAt", issue: "must be in the future" },
      ]);
    }

    let leadId: string | null = input.leadId ?? null;
    if (leadId) {
      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (!lead) throw new AppError("RESOURCE_NOT_FOUND", "Lead not found", 404);
      if (lead.propertyId && lead.propertyId !== input.propertyId) {
        throw new AppError("VALIDATION_ERROR", "Lead property mismatch", 422, [
          { field: "propertyId", issue: "does not match lead.propertyId" },
        ]);
      }
    }

    const customerUserId = actor.role === "customer" ? actor.id : null;

    const visit = await visitRepository.create({
      propertyId: property.id,
      scheduledAt,
      notes: input.notes?.trim() || null,
      customerUserId,
      createdByUserId: actor.id,
      leadId,
    });

    if (leadId) {
      await prisma.lead.update({
        where: { id: leadId },
        data: { stage: "visit_scheduled" },
      });
    }

    return toPublicVisit(visit);
  },
};
