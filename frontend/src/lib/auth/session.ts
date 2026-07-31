/**
 * Auth shell placeholders — real JWT session in FEAT-01.
 * Refresh contract stub for api client 401 interceptor.
 */

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setAuthTokens(tokens: { access: string | null; refresh?: string | null }): void {
  accessToken = tokens.access;
  if (tokens.refresh !== undefined) refreshToken = tokens.refresh;
}

export function clearAuthTokens(): void {
  accessToken = null;
  refreshToken = null;
}

export function getAccessToken(): string | null {
  return accessToken;
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
