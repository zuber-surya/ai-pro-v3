import { publicEnv } from "@/lib/config/env";

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details: Array<{ field?: string; issue: string }>;
  };
};

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details: ApiErrorBody["error"]["details"] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string;
};

/**
 * Centralized API client — components must not call fetch() ad hoc.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options;
  const res = await fetch(`${publicEnv.apiBaseUrl}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    let code = "INTERNAL_ERROR";
    let message = res.statusText;
    let details: ApiErrorBody["error"]["details"] = [];
    try {
      const data = (await res.json()) as ApiErrorBody;
      code = data.error?.code ?? code;
      message = data.error?.message ?? message;
      details = data.error?.details ?? [];
    } catch {
      /* ignore non-JSON */
    }
    throw new ApiError(code, message, res.status, details);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
