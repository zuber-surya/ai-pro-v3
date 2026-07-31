import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

export type RequestWithId = Request & { requestId: string };

export function getRequestId(req: Request): string | undefined {
  return (req as RequestWithId).requestId;
}

/**
 * Attach correlation id to request + response (`x-request-id`).
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const id = (req.headers["x-request-id"] as string | undefined) ?? randomUUID();
  res.setHeader("x-request-id", id);
  (req as RequestWithId).requestId = id;
  next();
}

/** @deprecated use requestIdMiddleware */
export const requestId = requestIdMiddleware;
