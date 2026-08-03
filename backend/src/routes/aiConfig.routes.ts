import { Router } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { requireAuth } from "../middleware/requireAuth.middleware.js";
import { requireRole } from "../middleware/requireRole.middleware.js";
import { aiConfigService } from "../services/aiConfig.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  aiConfigPreviewSchema,
  aiConfigUpdateSchema,
} from "../validators/aiConfig.validators.js";

export const aiConfigRouter = Router();

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

aiConfigRouter.get(
  "/config",
  requireAuth,
  requireRole("admin", "super_admin"),
  asyncHandler(async (_req, res) => {
    res.status(200).json(await aiConfigService.get());
  }),
);

aiConfigRouter.put(
  "/config",
  requireAuth,
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = aiConfigUpdateSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await aiConfigService.update(parsed.data, req.authUser!.id));
  }),
);

aiConfigRouter.post(
  "/config/preview",
  requireAuth,
  requireRole("admin", "super_admin"),
  rateLimit({
    max: env.AI_CHAT_RATE_LIMIT_MAX,
    windowMs: env.AI_CHAT_RATE_LIMIT_WINDOW_MS,
  }),
  asyncHandler(async (req, res) => {
    const parsed = aiConfigPreviewSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await aiConfigService.preview(parsed.data));
  }),
);
