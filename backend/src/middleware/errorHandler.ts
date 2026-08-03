import type { NextFunction, Request, Response } from "express";
import { getRequestId } from "./requestId.middleware.js";

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details: Array<{ field?: string; issue: string }> = [],
  ) {
    super(message);
    this.name = "AppError";
  }
}

const SECRET_PATTERNS = [
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
  /(api[_-]?key|secret|password|token|authorization)\s*[:=]\s*["']?[^\s"',}]+/gi,
  /postgresql:\/\/[^\s"']+/gi,
  /postgres:\/\/[^\s"']+/gi,
];

/** Strip credential-like substrings before structured logging. */
export function redactSecrets(text: string): string {
  let out = text;
  for (const pattern of SECRET_PATTERNS) {
    out = out.replace(pattern, "[REDACTED]");
  }
  return out;
}

function logError(req: Request, err: unknown, code: string): void {
  const requestId = getRequestId(req) ?? "unknown";
  const message = redactSecrets(err instanceof Error ? err.message : String(err));
  const stack =
    err instanceof Error && err.stack ? redactSecrets(err.stack) : undefined;
  console.error(
    JSON.stringify({
      level: "error",
      requestId,
      code,
      message,
      stack,
    }),
  );
}

/**
 * Central error envelope: `{ error: { code, message, details[] } }`
 */
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  void next;

  if (err instanceof AppError) {
    logError(req, err, err.code);
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  logError(req, err, "INTERNAL_ERROR");
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Unexpected server fault",
      details: [],
    },
  });
}
