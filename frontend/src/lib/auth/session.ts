/**
 * Client auth session — tokens in sessionStorage; user via /auth/me.
 */

import { refresh as refreshApi } from "@/lib/api/auth";
import type { UserPublic, UserRole } from "@/types/api";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let currentUser: UserPublic | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export function setAuthTokens(tokens: { access: string | null; refresh?: string | null }): void {
  accessToken = tokens.access;
  if (tokens.refresh !== undefined) refreshToken = tokens.refresh;
  if (typeof window !== "undefined") {
    if (tokens.access) sessionStorage.setItem("pv_access", tokens.access);
    else sessionStorage.removeItem("pv_access");
    if (tokens.refresh) sessionStorage.setItem("pv_refresh", tokens.refresh);
    else if (tokens.refresh === null) sessionStorage.removeItem("pv_refresh");
  }
}

export function clearAuthTokens(): void {
  accessToken = null;
  refreshToken = null;
  currentUser = null;
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("pv_access");
    sessionStorage.removeItem("pv_refresh");
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    accessToken = sessionStorage.getItem("pv_access");
  }
  return accessToken;
}

export function getRefreshToken(): string | null {
  if (refreshToken) return refreshToken;
  if (typeof window !== "undefined") {
    refreshToken = sessionStorage.getItem("pv_refresh");
  }
  return refreshToken;
}

export function getCurrentUser(): UserPublic | null {
  return currentUser;
}

export function setCurrentUser(user: UserPublic | null): void {
  currentUser = user;
}

export function hydrateAuthTokensFromStorage(): void {
  if (typeof window === "undefined") return;
  accessToken = sessionStorage.getItem("pv_access");
  refreshToken = sessionStorage.getItem("pv_refresh");
}

/** Decode JWT payload (no verify — server enforces). */
export function peekAccessRole(): UserRole | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/"))) as {
      role?: UserRole;
    };
    return json.role ?? null;
  } catch {
    return null;
  }
}

/** Post-login / Account home by role. */
export function homePathForRole(role: UserRole | null | undefined): string {
  if (role === "admin" || role === "super_admin" || role === "agent") return "/admin";
  return "/customer";
}

/**
 * Refresh once (deduped). Returns new access token or null.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const currentRefresh = getRefreshToken();
    if (!currentRefresh) return null;
    try {
      const tokens = await refreshApi(currentRefresh);
      setAuthTokens({ access: tokens.accessToken, refresh: tokens.refreshToken });
      return tokens.accessToken;
    } catch {
      clearAuthTokens();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/** @deprecated use refreshAccessToken */
export const refreshAccessTokenStub = refreshAccessToken;
