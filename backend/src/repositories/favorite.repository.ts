import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { toPublicProperty, type PropertyWithRelations } from "./property.repository.js";

const favoriteInclude = {
  property: {
    include: {
      amenities: { orderBy: { name: "asc" as const } },
      images: {
        where: { kind: "photo" as const },
        orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
        take: 1,
      },
    },
  },
} satisfies Prisma.FavoriteInclude;

export type FavoriteWithProperty = Prisma.FavoriteGetPayload<{ include: typeof favoriteInclude }>;

export function toFavoriteItem(row: FavoriteWithProperty) {
  return {
    propertyId: row.propertyId,
    property: toPublicProperty(row.property as PropertyWithRelations),
    createdAt: row.createdAt.toISOString(),
  };
}

export const favoriteRepository = {
  async list(userId: string, page: number, pageSize: number) {
    const where = { userId };
    const [total, rows] = await Promise.all([
      prisma.favorite.count({ where }),
      prisma.favorite.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: favoriteInclude,
      }),
    ]);
    return { total, rows };
  },

  findByUserAndProperty(userId: string, propertyId: string) {
    return prisma.favorite.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
      include: favoriteInclude,
    });
  },

  listPropertyIds(userId: string) {
    return prisma.favorite.findMany({
      where: { userId },
      select: { propertyId: true },
    });
  },

  async create(userId: string, propertyId: string) {
    return prisma.$transaction(async (tx) => {
      const row = await tx.favorite.create({
        data: { userId, propertyId },
        include: favoriteInclude,
      });
      await tx.property.update({
        where: { id: propertyId },
        data: { savesCount: { increment: 1 } },
      });
      return row;
    });
  },

  async remove(userId: string, propertyId: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.favorite.findUnique({
        where: { userId_propertyId: { userId, propertyId } },
      });
      if (!existing) return false;
      await tx.favorite.delete({
        where: { userId_propertyId: { userId, propertyId } },
      });
      await tx.property.update({
        where: { id: propertyId },
        data: { savesCount: { decrement: 1 } },
      });
      return true;
    });
  },
};
