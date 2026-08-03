import { Router } from "express";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AppError } from "../middleware/errorHandler.js";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const healthRouter = Router();

const startedAt = Date.now();

function appVersion(): string {
  if (process.env.APP_VERSION?.trim()) return process.env.APP_VERSION.trim();
  try {
    const pkgPath = join(dirname(fileURLToPath(import.meta.url)), "../../package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

healthRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    let database: "up" | "down" = "down";
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = "up";
    } catch {
      database = "down";
    }

    const healthy = database === "up";
    const body = {
      status: healthy ? ("ok" as const) : ("degraded" as const),
      version: appVersion(),
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
      generatedAt: new Date().toISOString(),
      checks: { database },
    };

    res.status(healthy ? 200 : 503).json(body);
  }),
);

/** Dev/test probe for error envelope + requestId logging — disabled in production */
healthRouter.get("/error-sample", (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Not found",
        details: [],
      },
    });
    return;
  }
  void req;
  next(
    new AppError("VALIDATION_ERROR", "Sample validation failure", 400, [
      { field: "probe", issue: "intentional" },
    ]),
  );
});
