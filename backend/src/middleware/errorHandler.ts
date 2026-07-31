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

function logError(req: Request, err: unknown, code: string): void {
  const requestId = getRequestId(req) ?? "unknown";
  const message = err instanceof Error ? err.message : String(err);
  console.error(
    JSON.stringify({
      level: "error",
      requestId,
      code,
      message,
      stack: err instanceof Error ? err.stack : undefined,
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
