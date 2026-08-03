import { Router } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { chatService } from "../services/chat.service.js";
import { loanService } from "../services/loan.service.js";
import { searchService } from "../services/search.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { aiChatRequestSchema } from "../validators/chat.validators.js";
import { aiLoanAnalysisRequestSchema } from "../validators/loan.validators.js";
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

/** Public homepage assistant — guest OK; Gemini key stays server-only. */
aiSearchRouter.get(
  "/chat/greeting",
  asyncHandler(async (_req, res) => {
    res.status(200).json(await chatService.greeting());
  }),
);

aiSearchRouter.post(
  "/chat",
  rateLimit({
    max: env.AI_CHAT_RATE_LIMIT_MAX,
    windowMs: env.AI_CHAT_RATE_LIMIT_WINDOW_MS,
  }),
  asyncHandler(async (req, res) => {
    const parsed = aiChatRequestSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await chatService.chat(parsed.data));
  }),
);

/** Guest OK on property detail; Gemini key server-only; formula fallback on AI fail. */
aiSearchRouter.post(
  "/loan-analysis",
  rateLimit({
    max: env.AI_CHAT_RATE_LIMIT_MAX,
    windowMs: env.AI_CHAT_RATE_LIMIT_WINDOW_MS,
  }),
  asyncHandler(async (req, res) => {
    const parsed = aiLoanAnalysisRequestSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await loanService.analyze(parsed.data));
  }),
);
