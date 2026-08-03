import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-safe lowercase kebab-case");

const statusSchema = z.enum(["draft", "published"]);

export const listCmsPagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const cmsPageCreateSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(300),
  body: z.string().optional(),
  sections: z.record(z.unknown()).optional(),
  status: statusSchema.optional().default("draft"),
});

export const cmsPageUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(300).optional(),
    body: z.string().optional(),
    sections: z.record(z.unknown()).optional(),
    status: statusSchema.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field required" });

export type ListCmsPagesQuery = z.infer<typeof listCmsPagesQuerySchema>;
export type CmsPageCreateInput = z.infer<typeof cmsPageCreateSchema>;
export type CmsPageUpdateInput = z.infer<typeof cmsPageUpdateSchema>;
