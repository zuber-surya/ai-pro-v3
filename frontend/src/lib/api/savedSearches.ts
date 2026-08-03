import { apiRequest } from "./client";

export type SavedSearchCriteria = {
  query?: string;
  q?: string;
  mode?: "ai" | "fallback";
  filters?: Record<string, unknown>;
  [key: string]: unknown;
};

export type SavedSearch = {
  id: string;
  name: string;
  criteria: SavedSearchCriteria;
  notifyVia: "email" | "in_app" | null;
  createdAt: string;
};

export type PaginatedSavedSearches = {
  data: SavedSearch[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type SavedSearchCreatePayload = {
  name: string;
  criteria: SavedSearchCriteria;
  notifyVia?: "email" | "in_app";
};

export function listSavedSearches(params?: { page?: number; pageSize?: number }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("pageSize", String(params.pageSize));
  const s = q.toString();
  return apiRequest<PaginatedSavedSearches>(
    `/customer/saved-searches${s ? `?${s}` : ""}`,
  );
}

export function createSavedSearch(payload: SavedSearchCreatePayload) {
  return apiRequest<SavedSearch>("/customer/saved-searches", {
    method: "POST",
    body: payload,
  });
}

export function deleteSavedSearch(id: string) {
  return apiRequest<void>(`/customer/saved-searches/${id}`, { method: "DELETE" });
}

/** Build /search URL from saved criteria */
export function savedSearchHref(criteria: SavedSearchCriteria): string {
  const params = new URLSearchParams();
  const query =
    (typeof criteria.query === "string" && criteria.query) ||
    (typeof criteria.q === "string" && criteria.q) ||
    "";
  if (query.trim()) params.set("q", query.trim());
  if (criteria.mode === "fallback") params.set("mode", "fallback");
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}
