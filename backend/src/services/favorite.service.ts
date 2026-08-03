import { AppError } from "../middleware/errorHandler.js";
import type { AuthUser } from "../middleware/requireAuth.middleware.js";
import { favoriteRepository, toFavoriteItem } from "../repositories/favorite.repository.js";
import { propertyRepository } from "../repositories/property.repository.js";
import type {
  FavoriteCreateInput,
  ListFavoritesQuery,
} from "../validators/favorite.validators.js";

export const favoriteService = {
  async list(query: ListFavoritesQuery, actor: AuthUser) {
    const { total, rows } = await favoriteRepository.list(
      actor.id,
      query.page,
      query.pageSize,
    );
    return {
      data: rows.map(toFavoriteItem),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
    };
  },

  async listPropertyIds(actor: AuthUser) {
    const rows = await favoriteRepository.listPropertyIds(actor.id);
    return { propertyIds: rows.map((r) => r.propertyId) };
  },

  async add(input: FavoriteCreateInput, actor: AuthUser) {
    const property = await propertyRepository.findById(input.propertyId);
    if (!property || property.status !== "published") {
      throw new AppError("RESOURCE_NOT_FOUND", "Property not found", 404);
    }

    const existing = await favoriteRepository.findByUserAndProperty(
      actor.id,
      input.propertyId,
    );
    if (existing) {
      return { item: toFavoriteItem(existing), created: false };
    }

    const created = await favoriteRepository.create(actor.id, input.propertyId);
    return { item: toFavoriteItem(created), created: true };
  },

  async remove(propertyId: string, actor: AuthUser) {
    await favoriteRepository.remove(actor.id, propertyId);
  },
};
