import { z } from "zod";

export const aiSearchRequestSchema = z.object({
  query: z.string().min(1).max(500),
  mode: z.enum(["ai", "fallback"]).optional().default("ai"),
  filters: z
    .object({
      city: z.string().max(120).optional(),
      propertyType: z.string().max(80).optional(),
      bedrooms: z.coerce.number().int().min(0).optional(),
      bathrooms: z.coerce.number().min(0).optional(),
      minPrice: z.union([z.string(), z.number()]).optional(),
      maxPrice: z.union([z.string(), z.number()]).optional(),
      amenities: z.array(z.string()).optional(),
    })
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export const searchSuggestQuerySchema = z.object({
  q: z.string().min(1).max(120),
});

export type AiSearchRequestInput = z.infer<typeof aiSearchRequestSchema>;
export type SearchSuggestQuery = z.infer<typeof searchSuggestQuerySchema>;
