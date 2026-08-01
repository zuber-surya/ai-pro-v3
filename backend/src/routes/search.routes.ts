import { Router } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { searchService } from "../services/search.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  aiSearchRequestSchema,
  searchSuggestQuerySchema,
} from "../validators/search.validators.js";

export const searchRouter = Router();

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

searchRouter.get(
  "/suggest",
  asyncHandler(async (req, res) => {
    const parsed = searchSuggestQuerySchema.safeParse(req.query);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await searchService.suggest(parsed.data.q));
  }),
);

export const aiSearchRouter = Router();

aiSearchRouter.post(
  "/search",
  rateLimit({
    max: env.AI_SEARCH_RATE_LIMIT_MAX,
    windowMs: env.AI_SEARCH_RATE_LIMIT_WINDOW_MS,
  }),
  asyncHandler(async (req, res) => {
    const parsed = aiSearchRequestSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await searchService.aiSearch(parsed.data));
  }),
);
