"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addFavorite, removeFavorite } from "@/lib/api";
import { getAccessToken, getCurrentUser } from "@/lib/auth";
import {
  loadFavoriteIds,
  markFavoriteLocal,
} from "./favoritesCache";

export function useFavoriteToggle(propertyId: string, loginNextPath?: string) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadFavoriteIds().then((set) => {
      if (!cancelled) setFavorited(set.has(propertyId));
    });
    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  const toggle = useCallback(async () => {
    const user = getCurrentUser();
    if (!getAccessToken() || !user) {
      const next = loginNextPath ?? `/properties/${propertyId}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return { ok: false as const, reason: "auth" as const };
    }
    if (user.role !== "customer") {
      return { ok: false as const, reason: "role" as const };
    }
    if (busy) return { ok: false as const, reason: "busy" as const };

    const next = !favorited;
    setBusy(true);
    setFavorited(next);
    markFavoriteLocal(propertyId, next);
    try {
      if (next) await addFavorite(propertyId);
      else await removeFavorite(propertyId);
      return { ok: true as const, favorited: next };
    } catch {
      setFavorited(!next);
      markFavoriteLocal(propertyId, !next);
      return { ok: false as const, reason: "api" as const };
    } finally {
      setBusy(false);
    }
  }, [busy, favorited, loginNextPath, propertyId, router]);

  return { favorited, busy, toggle };
}
