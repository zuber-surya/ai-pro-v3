import type {
  Agent,
  NearbyLandmark,
  Prisma,
  Property,
  PropertyAmenity,
  PropertyImage,
  PropertyStatus,
} from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { toPublicAgent, type PublicAgent } from "./agent.repository.js";
import { toPublicPropertyImage, type PublicPropertyImage } from "./propertyImage.repository.js";

export type PublicLandmark = {
  id: string;
  name: string;
  category: string | null;
  distanceM: number | null;
  lat: number | null;
  lng: number | null;
};

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
  amenities: string[];
  featured: boolean;
  agentId: string | null;
  coverImageUrl: string | null;
  lat: number | null;
  lng: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type PropertyDetail = PublicProperty & {
  images: PublicPropertyImage[];
  agent: PublicAgent | null;
  landmarks: PublicLandmark[];
};

type PropertyWithRelations = Property & {
  amenities?: PropertyAmenity[];
  images?: PropertyImage[];
  agent?: Agent | null;
  landmarks?: NearbyLandmark[];
};

export function toPublicLandmark(l: NearbyLandmark): PublicLandmark {
  return {
    id: l.id,
    name: l.name,
    category: l.category,
    distanceM: l.distanceM,
    lat: l.lat,
    lng: l.lng,
  };
}

export function toPublicProperty(p: PropertyWithRelations): PublicProperty {
  const cover =
    (p.images ?? []).find((img) => img.kind === "photo")?.url ??
    (p.images ?? [])[0]?.url ??
    null;
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
    amenities: (p.amenities ?? []).map((a) => a.name),
    featured: p.featured,
    agentId: p.agentId,
    coverImageUrl: cover,
    lat: p.lat,
    lng: p.lng,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    publishedAt: p.publishedAt?.toISOString() ?? null,
  };
}

export function toPropertyDetail(p: PropertyWithRelations): PropertyDetail {
  return {
    ...toPublicProperty(p),
    images: (p.images ?? []).map(toPublicPropertyImage),
    agent: p.agent ? toPublicAgent(p.agent) : null,
    landmarks: (p.landmarks ?? []).map(toPublicLandmark),
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

function buildWhere(
  filter: Omit<PropertyListFilter, "page" | "pageSize" | "sortBy" | "sortOrder">,
): Prisma.PropertyWhereInput {
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
    return prisma.property.findUnique({
      where: { id },
      include: {
        amenities: { orderBy: { name: "asc" } },
        agent: true,
        images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        landmarks: { orderBy: [{ category: "asc" }, { name: "asc" }] },
      },
    });
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
        include: {
          amenities: { orderBy: { name: "asc" } },
          images: {
            where: { kind: "photo" },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            take: 1,
          },
        },
      }),
    ]);
    return { total, rows };
  },

  async listFeatured(page: number, pageSize: number) {
    const where: Prisma.PropertyWhereInput = {
      status: "published",
      featured: true,
    };
    const [total, rows] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          amenities: { orderBy: { name: "asc" } },
          images: {
            where: { kind: "photo" },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            take: 1,
          },
        },
      }),
    ]);
    return { total, rows };
  },

  async listSimilar(
    property: Property,
    page: number,
    pageSize: number,
  ) {
    const or: Prisma.PropertyWhereInput[] = [];
    if (property.city?.trim()) {
      or.push({ city: { equals: property.city.trim(), mode: "insensitive" } });
    }
    if (property.propertyType?.trim()) {
      or.push({
        propertyType: { equals: property.propertyType.trim(), mode: "insensitive" },
      });
    }
    const where: Prisma.PropertyWhereInput = {
      id: { not: property.id },
      status: "published",
      ...(or.length ? { OR: or } : {}),
    };
    const [total, rows] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          amenities: { orderBy: { name: "asc" } },
          images: {
            where: { kind: "photo" },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            take: 1,
          },
        },
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
    return prisma.property.create({
      data,
      include: {
        amenities: true,
        agent: true,
        images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        landmarks: { orderBy: [{ category: "asc" }, { name: "asc" }] },
      },
    });
  },

  update(id: string, data: Prisma.PropertyUpdateInput) {
    return prisma.property.update({
      where: { id },
      data,
      include: {
        amenities: { orderBy: { name: "asc" } },
        agent: true,
        images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        landmarks: { orderBy: [{ category: "asc" }, { name: "asc" }] },
      },
    });
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

  async replaceAmenities(
    propertyId: string,
    amenities: Array<{ name: string; isCustom: boolean }>,
  ) {
    await prisma.$transaction([
      prisma.propertyAmenity.deleteMany({ where: { propertyId } }),
      prisma.propertyAmenity.createMany({
        data: amenities.map((a) => ({
          propertyId,
          name: a.name,
          isCustom: a.isCustom,
        })),
      }),
    ]);
    return this.findById(propertyId);
  },

  async replaceLandmarks(
    propertyId: string,
    landmarks: Array<{
      name: string;
      category?: string | null;
      distanceM?: number | null;
      lat?: number | null;
      lng?: number | null;
    }>,
  ) {
    await prisma.$transaction([
      prisma.nearbyLandmark.deleteMany({ where: { propertyId } }),
      prisma.nearbyLandmark.createMany({
        data: landmarks.map((l) => ({
          propertyId,
          name: l.name,
          category: l.category ?? null,
          distanceM: l.distanceM ?? null,
          lat: l.lat ?? null,
          lng: l.lng ?? null,
        })),
      }),
    ]);
    return this.findById(propertyId);
  },
};
