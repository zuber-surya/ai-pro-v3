import { z } from "zod";

export const listSavedSearchesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const savedSearchCreateSchema = z.object({
  name: z.string().min(1).max(200),
  criteria: z.record(z.unknown()),
  notifyVia: z.enum(["email", "in_app"]).optional(),
});

export type ListSavedSearchesQuery = z.infer<typeof listSavedSearchesQuerySchema>;
export type SavedSearchCreateInput = z.infer<typeof savedSearchCreateSchema>;
