import type { PropertyImage, PropertyImageKind } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export type PublicPropertyImage = {
  id: string;
  url: string;
  kind: PropertyImageKind;
  caption: string | null;
  sortOrder: number;
};

export function toPublicPropertyImage(img: PropertyImage): PublicPropertyImage {
  return {
    id: img.id,
    url: img.url,
    kind: img.kind,
    caption: img.caption,
    sortOrder: img.sortOrder,
  };
}

export const propertyImageRepository = {
  listByProperty(propertyId: string) {
    return prisma.propertyImage.findMany({
      where: { propertyId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  },

  findById(id: string) {
    return prisma.propertyImage.findUnique({ where: { id } });
  },

  create(data: {
    propertyId: string;
    url: string;
    kind: PropertyImageKind;
    caption?: string;
    sortOrder: number;
  }) {
    return prisma.propertyImage.create({ data });
  },

  delete(id: string) {
    return prisma.propertyImage.delete({ where: { id } });
  },

  async nextSortOrder(propertyId: string) {
    const last = await prisma.propertyImage.findFirst({
      where: { propertyId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    return (last?.sortOrder ?? -1) + 1;
  },
};
