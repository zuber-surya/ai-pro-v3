import type { Prisma } from "@prisma/client";
import { AppError } from "../middleware/errorHandler.js";
import type { AuthUser } from "../middleware/requireAuth.middleware.js";
import {
  savedSearchRepository,
  toPublicSavedSearch,
} from "../repositories/savedSearch.repository.js";
import type {
  ListSavedSearchesQuery,
  SavedSearchCreateInput,
} from "../validators/savedSearch.validators.js";

function splitCriteria(criteria: Record<string, unknown>) {
  const query =
    typeof criteria.query === "string"
      ? criteria.query.trim()
      : typeof criteria.q === "string"
        ? criteria.q.trim()
        : "";
  return {
    queryText: query || null,
    filtersJson: criteria as Prisma.InputJsonValue,
  };
}

export const savedSearchService = {
  async list(query: ListSavedSearchesQuery, actor: AuthUser) {
    const { total, rows } = await savedSearchRepository.list(
      actor.id,
      query.page,
      query.pageSize,
    );
    return {
      data: rows.map(toPublicSavedSearch),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
    };
  },

  async create(input: SavedSearchCreateInput, actor: AuthUser) {
    const { queryText, filtersJson } = splitCriteria(input.criteria);
    const row = await savedSearchRepository.create({
      userId: actor.id,
      name: input.name.trim(),
      queryText,
      filtersJson,
      notifyVia: input.notifyVia ?? null,
    });
    return toPublicSavedSearch(row);
  },

  async remove(id: string, actor: AuthUser) {
    const ok = await savedSearchRepository.remove(id, actor.id);
    if (!ok) throw new AppError("RESOURCE_NOT_FOUND", "Saved search not found", 404);
  },
};
