import { publicEnv } from "@/lib/config/env";
import { AppError, type ApiErrorEnvelope } from "@/types/api";

export type { ApiErrorEnvelope };
export { AppError };

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string;
  /** Skip 401 → refresh stub (e.g. refresh call itself) */
  skipAuthRefresh?: boolean;
};

type TokenGetter = () => string | null | undefined;
type RefreshHandler = () => Promise<string | null>;

let getAccessToken: TokenGetter = () => null;
let refreshAccessToken: RefreshHandler | null = null;

/** Auth shell hooks — wire real store in FEAT-01 */
export function configureApiAuth(options: {
  getAccessToken?: TokenGetter;
  refreshAccessToken?: RefreshHandler;
}): void {
  if (options.getAccessToken) getAccessToken = options.getAccessToken;
  if (options.refreshAccessToken) refreshAccessToken = options.refreshAccessToken;
}

async function parseError(res: Response): Promise<AppError> {
  let code = "INTERNAL_ERROR";
  let message = res.statusText || "Request failed";
  let details: AppError["details"] = [];
  try {
    const data = (await res.json()) as ApiErrorEnvelope;
    code = data.error?.code ?? code;
    message = data.error?.message ?? message;
    details = data.error?.details ?? [];
  } catch {
    /* non-JSON */
  }
  return new AppError(code, message, res.status, details);
}

/**
 * Centralized API client — components/hooks must not call fetch() directly.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, headers, skipAuthRefresh, ...rest } = options;
  const bearer = token ?? getAccessToken() ?? undefined;

  const doFetch = (access?: string) =>
    fetch(`${publicEnv.apiBaseUrl}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  let res = await doFetch(bearer);

  if (res.status === 401 && !skipAuthRefresh && refreshAccessToken) {
    const next = await refreshAccessToken();
    if (next) {
      res = await doFetch(next);
    }
  }

  if (!res.ok) {
    throw await parseError(res);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

/** @deprecated prefer AppError */
export const ApiError = AppError;
