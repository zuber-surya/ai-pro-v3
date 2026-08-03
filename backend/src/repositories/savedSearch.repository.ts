import type { Prisma, SavedSearch } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export type PublicSavedSearch = {
  id: string;
  name: string;
  criteria: Record<string, unknown>;
  notifyVia: "email" | "in_app" | null;
  createdAt: string;
};

export function toPublicSavedSearch(row: SavedSearch): PublicSavedSearch {
  const filters =
    row.filtersJson && typeof row.filtersJson === "object" && !Array.isArray(row.filtersJson)
      ? (row.filtersJson as Record<string, unknown>)
      : {};
  const criteria: Record<string, unknown> = { ...filters };
  if (row.queryText != null && criteria.query == null) {
    criteria.query = row.queryText;
  }
  return {
    id: row.id,
    name: row.name,
    criteria,
    notifyVia:
      row.notifyVia === "email" || row.notifyVia === "in_app" ? row.notifyVia : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export const savedSearchRepository = {
  async list(userId: string, page: number, pageSize: number) {
    const where = { userId };
    const [total, rows] = await Promise.all([
      prisma.savedSearch.count({ where }),
      prisma.savedSearch.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { total, rows };
  },

  create(data: {
    userId: string;
    name: string;
    queryText: string | null;
    filtersJson: Prisma.InputJsonValue | null;
    notifyVia: string | null;
  }) {
    return prisma.savedSearch.create({ data });
  },

  findByIdForUser(id: string, userId: string) {
    return prisma.savedSearch.findFirst({ where: { id, userId } });
  },

  async remove(id: string, userId: string) {
    const existing = await prisma.savedSearch.findFirst({ where: { id, userId } });
    if (!existing) return false;
    await prisma.savedSearch.delete({ where: { id } });
    return true;
  },
};
