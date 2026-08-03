import { Router } from "express";
import { ZodError } from "zod";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/requireAuth.middleware.js";
import { requireRole } from "../middleware/requireRole.middleware.js";
import { bulkService } from "../services/bulk.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { bulkValidateRequestSchema } from "../validators/bulk.validators.js";

export const bulkRouter = Router();

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

bulkRouter.post(
  "/properties/validate",
  requireAuth,
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = bulkValidateRequestSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await bulkService.validate(parsed.data, req.authUser!));
  }),
);

bulkRouter.get(
  "/properties/sessions/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) throw new AppError("VALIDATION_ERROR", "Session id required", 422);
    res.status(200).json(await bulkService.getSession(id));
  }),
);

bulkRouter.get(
  "/properties/sessions/:id/errors.csv",
  requireAuth,
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) throw new AppError("VALIDATION_ERROR", "Session id required", 422);
    const csv = await bulkService.errorsCsv(id);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="bulk-errors-${id}.csv"`);
    res.status(200).send(csv);
  }),
);

bulkRouter.post(
  "/properties/sessions/:id/import",
  requireAuth,
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) throw new AppError("VALIDATION_ERROR", "Session id required", 422);
    res.status(202).json(await bulkService.importSession(id, req.authUser!));
  }),
);
