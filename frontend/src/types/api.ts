/** Shared API transport types — keep FE DTO names aligned with OpenAPI */

export type ApiErrorDetail = {
  field?: string;
  issue: string;
};

export type ApiErrorEnvelope = {
  error: {
    code: string;
    message: string;
    details: ApiErrorDetail[];
  };
};

export type HealthResponse = {
  status: "ok";
  version?: string;
};

/** Thrown by lib/api client when HTTP or envelope indicates failure */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = "AppError";
  }
}
