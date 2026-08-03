import type { CmsPage, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import type {
  CmsPageCreateInput,
  CmsPageUpdateInput,
  ListCmsPagesQuery,
} from "../validators/cms.validators.js";

export type CmsPageDto = {
  id: string;
  slug: string;
  title: string;
  body: string;
  sections: Record<string, unknown>;
  status: "draft" | "published";
  publishedAt: string | null;
  updatedAt: string;
};

function asSections(value: Prisma.JsonValue): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function parseBodyInput(body?: string, sections?: Record<string, unknown>): Record<string, unknown> {
  if (sections && typeof sections === "object") return sections;
  if (body == null || body.trim() === "") return {};
  try {
    const parsed = JSON.parse(body) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return { html: body };
  } catch {
    return { html: body };
  }
}

function toDto(row: CmsPage): CmsPageDto {
  const sections = asSections(row.bodyJson);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    body: JSON.stringify(sections),
    sections,
    status: row.isPublished ? "published" : "draft",
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const cmsService = {
  async list(query: ListCmsPagesQuery) {
    const where = {};
    const [total, rows] = await Promise.all([
      prisma.cmsPage.count({ where }),
      prisma.cmsPage.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);
    return {
      data: rows.map(toDto),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
    };
  },

  async getById(id: string) {
    const row = await prisma.cmsPage.findUnique({ where: { id } });
    if (!row) throw new AppError("RESOURCE_NOT_FOUND", "CMS page not found", 404);
    return toDto(row);
  },

  async getPublishedBySlug(slug: string) {
    const row = await prisma.cmsPage.findFirst({
      where: { slug, isPublished: true },
    });
    if (!row) throw new AppError("RESOURCE_NOT_FOUND", "Page not found", 404);
    return toDto(row);
  },

  async getHomepage() {
    return this.getPublishedBySlug("homepage");
  },

  async create(input: CmsPageCreateInput, actorUserId: string) {
    const existing = await prisma.cmsPage.findUnique({ where: { slug: input.slug } });
    if (existing) {
      throw new AppError("CONFLICT_DUPLICATE", "Slug already exists", 409);
    }
    const bodyJson = parseBodyInput(input.body, input.sections);
    const published = input.status === "published";
    const row = await prisma.cmsPage.create({
      data: {
        slug: input.slug,
        title: input.title,
        bodyJson,
        isPublished: published,
        publishedAt: published ? new Date() : null,
        createdBy: actorUserId,
        updatedBy: actorUserId,
      },
    });
    return toDto(row);
  },

  async update(id: string, input: CmsPageUpdateInput, actorUserId: string) {
    const existing = await prisma.cmsPage.findUnique({ where: { id } });
    if (!existing) throw new AppError("RESOURCE_NOT_FOUND", "CMS page not found", 404);

    const data: Prisma.CmsPageUpdateInput = {
      updatedBy: actorUserId,
    };
    if (input.title !== undefined) data.title = input.title;
    if (input.body !== undefined || input.sections !== undefined) {
      data.bodyJson = parseBodyInput(input.body, input.sections);
    }
    if (input.status !== undefined) {
      const published = input.status === "published";
      data.isPublished = published;
      if (published) {
        data.publishedAt = existing.publishedAt ?? new Date();
      } else {
        data.publishedAt = null;
      }
    }

    const row = await prisma.cmsPage.update({ where: { id }, data });
    return toDto(row);
  },

  async remove(id: string) {
    const existing = await prisma.cmsPage.findUnique({ where: { id } });
    if (!existing) throw new AppError("RESOURCE_NOT_FOUND", "CMS page not found", 404);
    if (existing.slug === "homepage") {
      throw new AppError("VALIDATION_ERROR", "Homepage page cannot be deleted", 422);
    }
    await prisma.cmsPage.delete({ where: { id } });
  },
};
