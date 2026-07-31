import type { Property } from "@prisma/client";
import { AppError } from "../middleware/errorHandler.js";
import type { AuthUser } from "../middleware/requireAuth.middleware.js";
import { agentRepository } from "../repositories/agent.repository.js";
import {
  propertyRepository,
  toPublicProperty,
} from "../repositories/property.repository.js";
import type {
  AmenitiesUpdateInput,
  BulkPropertyStatusInput,
  ExportPropertiesQuery,
  ListPropertiesQuery,
  PropertyCreateInput,
  PropertyUpdateInput,
} from "../validators/property.validators.js";
import { STANDARD_AMENITIES } from "../validators/property.validators.js";

async function resolveAgentScope(actor: AuthUser): Promise<string | null | undefined> {
  if (actor.role === "admin" || actor.role === "super_admin") {
    return undefined;
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

type PublishFields = {
  title: string;
  price: { toString(): string } | string | number;
  propertyType: string;
  bedrooms: number;
  bathrooms: { toString(): string } | number;
  areaSqFt: { toString(): string } | number;
  addressLine: string;
};

/** Publish requires core listing fields (SRS). */
function assertPublishable(p: PublishFields): void {
  const details: Array<{ field?: string; issue: string }> = [];
  if (!p.title?.trim()) details.push({ field: "title", issue: "required for publish" });
  if (!p.propertyType?.trim()) details.push({ field: "propertyType", issue: "required for publish" });
  if (!p.addressLine?.trim()) details.push({ field: "addressLine", issue: "required for publish" });
  const price = Number(p.price);
  if (!(price > 0)) details.push({ field: "price", issue: "must be greater than 0" });
  if (Number(p.bedrooms) < 0) details.push({ field: "bedrooms", issue: "invalid" });
  if (Number(p.bathrooms) < 0) details.push({ field: "bathrooms", issue: "invalid" });
  if (!(Number(p.areaSqFt) > 0)) details.push({ field: "areaSqFt", issue: "must be greater than 0" });
  if (details.length) {
    throw new AppError("VALIDATION_ERROR", "Cannot publish incomplete listing", 422, details);
  }
}

function mergeForPublish(existing: Property, input: PropertyUpdateInput): PublishFields {
  return {
    title: input.title ?? existing.title,
    price: input.price ?? existing.price,
    propertyType: input.propertyType ?? existing.propertyType,
    bedrooms: input.bedrooms ?? existing.bedrooms,
    bathrooms: input.bathrooms ?? existing.bathrooms,
    areaSqFt: input.areaSqFt ?? existing.areaSqFt,
    addressLine: input.addressLine ?? existing.addressLine,
  };
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

    if (!actor || actor.role === "customer") {
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
    if (status === "published") {
      assertPublishable({
        title: input.title,
        price: input.price,
        propertyType: input.propertyType,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        areaSqFt: input.areaSqFt,
        addressLine: input.addressLine,
      });
    }

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

  async update(id: string, input: PropertyUpdateInput, actor: AuthUser) {
    const existing = await propertyRepository.findById(id);
    if (!existing) throw new AppError("RESOURCE_NOT_FOUND", "Property not found", 404);
    await assertCanAccessProperty(actor, existing.agentId);

    const nextStatus = input.status ?? existing.status;
    if (nextStatus === "published") {
      assertPublishable(mergeForPublish(existing, input));
    }

    const property = await propertyRepository.update(id, {
      title: input.title,
      description: input.description === null ? null : input.description,
      status: input.status,
      price: input.price,
      propertyType: input.propertyType,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      areaSqFt: input.areaSqFt,
      addressLine: input.addressLine,
      city: input.city === null ? null : input.city,
      region: input.region === null ? null : input.region,
      postalCode: input.postalCode === null ? null : input.postalCode,
      country: input.country === null ? null : input.country,
      featured: input.featured,
      publishedAt:
        nextStatus === "published"
          ? existing.publishedAt ?? new Date()
          : existing.publishedAt,
      agent:
        input.agentId === undefined
          ? undefined
          : input.agentId === null
            ? { disconnect: true }
            : { connect: { id: input.agentId } },
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

    if (status === "published") {
      assertPublishable(existing);
    }

    const property = await propertyRepository.update(id, {
      status,
      publishedAt:
        status === "published" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
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

    if (existing.amenities?.length) {
      await propertyRepository.replaceAmenities(
        copy.id,
        existing.amenities.map((a) => ({ name: a.name, isCustom: a.isCustom })),
      );
      const reloaded = await propertyRepository.findById(copy.id);
      return toPublicProperty(reloaded!);
    }

    return toPublicProperty(copy);
  },

  async replaceAmenities(id: string, input: AmenitiesUpdateInput, actor: AuthUser) {
    const existing = await propertyRepository.findById(id);
    if (!existing) throw new AppError("RESOURCE_NOT_FOUND", "Property not found", 404);
    await assertCanAccessProperty(actor, existing.agentId);

    const standard = new Set(STANDARD_AMENITIES.map((s) => s.toLowerCase()));
    const seen = new Set<string>();
    const amenities = input.amenities
      .map((n) => n.trim())
      .filter(Boolean)
      .filter((n) => {
        const key = n.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((name) => ({
        name,
        isCustom: !standard.has(name.toLowerCase()),
      }));

    const property = await propertyRepository.replaceAmenities(id, amenities);
    if (!property) throw new AppError("RESOURCE_NOT_FOUND", "Property not found", 404);
    return toPublicProperty(property);
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
