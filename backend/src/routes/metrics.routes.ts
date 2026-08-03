import { Router } from "express";
import { ZodError } from "zod";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/requireAuth.middleware.js";
import { requireRole } from "../middleware/requireRole.middleware.js";
import { metricsService } from "../services/metrics.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  metricsDashboardQuerySchema,
  metricsReportsQuerySchema,
} from "../validators/metrics.validators.js";

export const metricsRouter = Router();

function zodToAppError(err: ZodError): AppError {
  return new AppError(
    "VALIDATION_ERROR",
    "Validation failed",
    422,
    err.issues.map((i) => ({
      field: i.path.join(".") || undefined,
      issue: i.message,
    })),
  );
}

metricsRouter.get(
  "/dashboard",
  requireAuth,
  requireRole("agent", "admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = metricsDashboardQuerySchema.safeParse(req.query);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await metricsService.getDashboard(parsed.data, req.authUser!));
  }),
);

metricsRouter.get(
  "/reports",
  requireAuth,
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = metricsReportsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await metricsService.getReports(parsed.data, req.authUser!));
  }),
);
