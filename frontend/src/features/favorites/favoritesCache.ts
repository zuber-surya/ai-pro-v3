import { listFavoriteIds } from "@/lib/api";
import { getAccessToken, getCurrentUser } from "@/lib/auth";

let ids: Set<string> | null = null;
let inflight: Promise<Set<string>> | null = null;

function canUseFavorites() {
  const user = getCurrentUser();
  return Boolean(getAccessToken() && user?.role === "customer");
}

export function invalidateFavoriteIds() {
  ids = null;
  inflight = null;
}

export async function loadFavoriteIds(force = false): Promise<Set<string>> {
  if (!canUseFavorites()) {
    ids = new Set();
    return ids;
  }
  if (!force && ids) return ids;
  if (!force && inflight) return inflight;

  inflight = listFavoriteIds()
    .then((res) => {
      ids = new Set(res.propertyIds);
      return ids;
    })
    .catch(() => {
      ids = new Set();
      return ids;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function markFavoriteLocal(propertyId: string, favorited: boolean) {
  if (!ids) ids = new Set();
  if (favorited) ids.add(propertyId);
  else ids.delete(propertyId);
}
