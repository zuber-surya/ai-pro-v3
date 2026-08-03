import { Router } from "express";
import { ZodError } from "zod";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/requireAuth.middleware.js";
import { requireRole } from "../middleware/requireRole.middleware.js";
import { visitService } from "../services/visit.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { visitCreateSchema } from "../validators/visit.validators.js";

export const visitsRouter = Router();

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

visitsRouter.post(
  "/",
  requireAuth,
  requireRole("customer", "agent", "admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = visitCreateSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(201).json(await visitService.create(parsed.data, req.authUser!));
  }),
);
