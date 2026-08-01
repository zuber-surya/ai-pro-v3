import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errorHandler.js";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  max: number;
  windowMs: number;
  key?: (req: Request) => string;
};

/**
 * Simple in-memory sliding fixed-window rate limiter.
 * Suitable for single-process local/MVP; not distributed.
 */
export function rateLimit(options: RateLimitOptions) {
  const keyFn =
    options.key ??
    ((req: Request) => {
      const forwarded = req.headers["x-forwarded-for"];
      const ip =
        typeof forwarded === "string"
          ? forwarded.split(",")[0]?.trim()
          : Array.isArray(forwarded)
            ? forwarded[0]
            : req.ip;
      return ip || "unknown";
    });

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${req.path}:${keyFn(req)}`;
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + options.windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    const remaining = Math.max(0, options.max - bucket.count);
    const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    res.setHeader("X-RateLimit-Limit", String(options.max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > options.max) {
      res.setHeader("Retry-After", String(retryAfterSec));
      next(new AppError("RATE_LIMITED", "Too many requests. Try again later.", 429));
      return;
    }
    next();
  };
}

/** Test helper */
export function resetRateLimitBucketsForTests(): void {
  buckets.clear();
}
