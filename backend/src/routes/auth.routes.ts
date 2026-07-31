import { Router } from "express";
import { ZodError } from "zod";
import { AppError } from "../middleware/errorHandler.js";
import { authService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { loginSchema, registerSchema } from "../validators/auth.validators.js";

export const authRouter = Router();

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

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    const tokens = await authService.register(parsed.data);
    res.status(201).json(tokens);
  }),
);

authRouter.post(
  "/token",
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    const tokens = await authService.login(parsed.data);
    res.status(200).json(tokens);
  }),
);
