import type { Prisma, Property, PropertyStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export type PublicProperty = {
  id: string;
  title: string;
  description: string | null;
  status: PropertyStatus;
  price: string;
  currency: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  address: {
    line: string;
    city: string | null;
    region: string | null;
    postalCode: string | null;
    country: string | null;
  };
  featured: boolean;
  agentId: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export function toPublicProperty(p: Property): PublicProperty {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    status: p.status,
    price: p.price.toFixed(2),
    currency: p.currency,
    propertyType: p.propertyType,
    bedrooms: p.bedrooms,
    bathrooms: Number(p.bathrooms),
    areaSqFt: Number(p.areaSqFt),
    address: {
      line: p.addressLine,
      city: p.city,
      region: p.region,
      postalCode: p.postalCode,
      country: p.country,
    },
    featured: p.featured,
    agentId: p.agentId,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    publishedAt: p.publishedAt?.toISOString() ?? null,
  };
}

export type PropertyListFilter = {
  page: number;
  pageSize: number;
  status?: PropertyStatus;
  q?: string;
  sortBy: "createdAt" | "price" | "title" | "status" | "updatedAt";
  sortOrder: "asc" | "desc";
  agentId?: string | null;
};

function buildWhere(filter: Omit<PropertyListFilter, "page" | "pageSize" | "sortBy" | "sortOrder">): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {};
  if (filter.status) where.status = filter.status;
  if (filter.agentId) where.agentId = filter.agentId;
  if (filter.q?.trim()) {
    const q = filter.q.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { addressLine: { contains: q, mode: "insensitive" } },
      { propertyType: { contains: q, mode: "insensitive" } },
    ];
  }
  return where;
}

export const propertyRepository = {
  findById(id: string) {
    return prisma.property.findUnique({ where: { id } });
  },

  async list(filter: PropertyListFilter) {
    const where = buildWhere(filter);
    const orderBy = { [filter.sortBy]: filter.sortOrder } as Prisma.PropertyOrderByWithRelationInput;
    const [total, rows] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        orderBy,
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize,
      }),
    ]);
    return { total, rows };
  },

  async listForExport(
    filter: Omit<PropertyListFilter, "page" | "pageSize"> & { limit: number },
  ) {
    const where = buildWhere(filter);
    const orderBy = { [filter.sortBy]: filter.sortOrder } as Prisma.PropertyOrderByWithRelationInput;
    return prisma.property.findMany({
      where,
      orderBy,
      take: filter.limit,
    });
  },

  create(data: Prisma.PropertyCreateInput) {
    return prisma.property.create({ data });
  },

  update(id: string, data: Prisma.PropertyUpdateInput) {
    return prisma.property.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.property.delete({ where: { id } });
  },

  updateManyStatus(ids: string[], status: PropertyStatus, agentId?: string | null) {
    return prisma.property.updateMany({
      where: {
        id: { in: ids },
        ...(agentId ? { agentId } : {}),
      },
      data: {
        status,
        publishedAt: status === "published" ? new Date() : undefined,
      },
    });
  },
};
