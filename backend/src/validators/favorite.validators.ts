import { z } from "zod";

export const listFavoritesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const favoriteCreateSchema = z.object({
  propertyId: z.string().uuid(),
});

export type ListFavoritesQuery = z.infer<typeof listFavoritesQuerySchema>;
export type FavoriteCreateInput = z.infer<typeof favoriteCreateSchema>;
