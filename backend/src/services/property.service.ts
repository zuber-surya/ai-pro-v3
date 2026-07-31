import { AppError } from "../middleware/errorHandler.js";
import type { AuthUser } from "../middleware/requireAuth.middleware.js";
import { agentRepository } from "../repositories/agent.repository.js";
import {
  propertyRepository,
  toPublicProperty,
} from "../repositories/property.repository.js";
import type {
  BulkPropertyStatusInput,
  ExportPropertiesQuery,
  ListPropertiesQuery,
  PropertyCreateInput,
} from "../validators/property.validators.js";

async function resolveAgentScope(actor: AuthUser): Promise<string | null | undefined> {
  if (actor.role === "admin" || actor.role === "super_admin") {
    return undefined; // no agent filter
  }
  if (actor.role === "agent") {
    const agent = await agentRepository.findByUserId(actor.id);
    if (!agent) {
      throw new AppError("AUTH_FORBIDDEN", "No agent profile linked to this user", 403);
    }
    return agent.id;
  }
  throw new AppError("AUTH_FORBIDDEN", "Insufficient permissions", 403);
}

async function assertCanAccessProperty(
  actor: AuthUser,
  propertyAgentId: string | null,
): Promise<void> {
  if (actor.role === "admin" || actor.role === "super_admin") return;
  if (actor.role !== "agent") {
    throw new AppError("AUTH_FORBIDDEN", "Insufficient permissions", 403);
  }
  const agent = await agentRepository.findByUserId(actor.id);
  if (!agent || agent.id !== propertyAgentId) {
    throw new AppError("AUTH_FORBIDDEN", "Not your listing", 403);
  }
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export const propertyService = {
  async list(query: ListPropertiesQuery, actor: AuthUser) {
    const agentId = await resolveAgentScope(actor);
    const { total, rows } = await propertyRepository.list({
      ...query,
      agentId: agentId ?? undefined,
    });
    return {
      data: rows.map(toPublicProperty),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
    };
  },

  async getById(id: string, actor?: AuthUser) {
    const property = await propertyRepository.findById(id);
    if (!property) throw new AppError("RESOURCE_NOT_FOUND", "Property not found", 404);

    if (!actor) {
      if (property.status !== "published") {
        throw new AppError("RESOURCE_NOT_FOUND", "Property not found", 404);
      }
      return toPublicProperty(property);
    }

    if (actor.role === "customer") {
      if (property.status !== "published") {
        throw new AppError("RESOURCE_NOT_FOUND", "Property not found", 404);
      }
      return toPublicProperty(property);
    }

    await assertCanAccessProperty(actor, property.agentId);
    return toPublicProperty(property);
  },

  async create(input: PropertyCreateInput, actor: AuthUser) {
    let agentId = input.agentId ?? null;
    if (actor.role === "agent") {
      const agent = await agentRepository.findByUserId(actor.id);
      if (!agent) {
        throw new AppError("AUTH_FORBIDDEN", "No agent profile linked to this user", 403);
      }
      agentId = agent.id;
    }

    const status = input.status ?? "draft";
    const property = await propertyRepository.create({
      title: input.title,
      description: input.description,
      status,
      price: input.price,
      propertyType: input.propertyType,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      areaSqFt: input.areaSqFt,
      addressLine: input.addressLine,
      city: input.city,
      region: input.region,
      postalCode: input.postalCode,
      country: input.country,
      featured: input.featured ?? false,
      publishedAt: status === "published" ? new Date() : null,
      agent: agentId ? { connect: { id: agentId } } : undefined,
    });
    return toPublicProperty(property);
  },

  async updateStatus(
    id: string,
    status: "draft" | "published" | "archived" | "sold" | "rented",
    actor: AuthUser,
  ) {
    const existing = await propertyRepository.findById(id);
    if (!existing) throw new AppError("RESOURCE_NOT_FOUND", "Property not found", 404);
    await assertCanAccessProperty(actor, existing.agentId);

    const property = await propertyRepository.update(id, {
      status,
      publishedAt:
        status === "published"
          ? existing.publishedAt ?? new Date()
          : status === "draft" || status === "archived"
            ? existing.publishedAt
            : existing.publishedAt,
    });
    return toPublicProperty(property);
  },

  async archive(id: string, actor: AuthUser) {
    return this.updateStatus(id, "archived", actor);
  },

  async remove(id: string, actor: AuthUser) {
    const existing = await propertyRepository.findById(id);
    if (!existing) throw new AppError("RESOURCE_NOT_FOUND", "Property not found", 404);
    await assertCanAccessProperty(actor, existing.agentId);
    await propertyRepository.delete(id);
  },

  async duplicate(id: string, actor: AuthUser) {
    const existing = await propertyRepository.findById(id);
    if (!existing) throw new AppError("RESOURCE_NOT_FOUND", "Property not found", 404);
    await assertCanAccessProperty(actor, existing.agentId);

    let agentId = existing.agentId;
    if (actor.role === "agent") {
      const agent = await agentRepository.findByUserId(actor.id);
      agentId = agent?.id ?? null;
    }

    const copy = await propertyRepository.create({
      title: `${existing.title} (Copy)`,
      description: existing.description,
      status: "draft",
      price: existing.price,
      currency: existing.currency,
      propertyType: existing.propertyType,
      bedrooms: existing.bedrooms,
      bathrooms: existing.bathrooms,
      areaSqFt: existing.areaSqFt,
      addressLine: existing.addressLine,
      city: existing.city,
      region: existing.region,
      postalCode: existing.postalCode,
      country: existing.country,
      yearBuilt: existing.yearBuilt,
      featured: false,
      publishedAt: null,
      agent: agentId ? { connect: { id: agentId } } : undefined,
    });
    return toPublicProperty(copy);
  },

  async bulkStatus(input: BulkPropertyStatusInput, actor: AuthUser) {
    if (actor.role !== "admin" && actor.role !== "super_admin") {
      throw new AppError("AUTH_FORBIDDEN", "Insufficient permissions", 403);
    }
    const result = await propertyRepository.updateManyStatus(input.propertyIds, input.status);
    return { message: `Updated ${result.count} properties`, count: result.count };
  },

  async exportCsv(query: ExportPropertiesQuery, actor: AuthUser) {
    const agentId = await resolveAgentScope(actor);
    const rows = await propertyRepository.listForExport({
      status: query.status,
      q: query.q,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      agentId: agentId ?? undefined,
      limit: query.limit,
    });

    const header = [
      "id",
      "title",
      "status",
      "price",
      "currency",
      "propertyType",
      "bedrooms",
      "bathrooms",
      "areaSqFt",
      "addressLine",
      "city",
      "agentId",
      "createdAt",
    ];
    const lines = [header.join(",")];
    for (const p of rows) {
      lines.push(
        [
          p.id,
          csvEscape(p.title),
          p.status,
          p.price.toFixed(2),
          p.currency,
          csvEscape(p.propertyType),
          String(p.bedrooms),
          String(p.bathrooms),
          String(p.areaSqFt),
          csvEscape(p.addressLine),
          csvEscape(p.city ?? ""),
          p.agentId ?? "",
          p.createdAt.toISOString(),
        ].join(","),
      );
    }
    return lines.join("\n");
  },
};
