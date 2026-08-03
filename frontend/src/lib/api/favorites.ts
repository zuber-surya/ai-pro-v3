import { apiRequest } from "./client";
import type { Property } from "./properties";

export type FavoriteItem = {
  propertyId: string;
  property?: Property;
  createdAt: string;
};

export type PaginatedFavorites = {
  data: FavoriteItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export function listFavorites(params?: { page?: number; pageSize?: number }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("pageSize", String(params.pageSize));
  const s = q.toString();
  return apiRequest<PaginatedFavorites>(`/favorites${s ? `?${s}` : ""}`);
}

export function listFavoriteIds() {
  return apiRequest<{ propertyIds: string[] }>("/favorites/ids");
}

export function addFavorite(propertyId: string) {
  return apiRequest<FavoriteItem>("/favorites", {
    method: "POST",
    body: { propertyId },
  });
}

export function removeFavorite(propertyId: string) {
  return apiRequest<void>(`/favorites/${propertyId}`, { method: "DELETE" });
}
