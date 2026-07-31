/**
 * Auth shell placeholders — real JWT session in FEAT-01.
 * Refresh contract stub for api client 401 interceptor.
 */

let accessToken: string | null = null;
let refreshToken: string | null = null;

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

export function hydrateAuthTokensFromStorage(): void {
  if (typeof window === "undefined") return;
  accessToken = sessionStorage.getItem("pv_access");
  refreshToken = sessionStorage.getItem("pv_refresh");
}

/**
 * Stub refresh — returns null until FEAT-01 implements POST /auth/refresh.
 * Client will surface original 401 AppError when refresh fails.
 */
export async function refreshAccessTokenStub(): Promise<string | null> {
  if (!refreshToken) return null;
  // Future: apiRequest('/auth/refresh', { method: 'POST', body: { refreshToken }, skipAuthRefresh: true })
  return null;
}
