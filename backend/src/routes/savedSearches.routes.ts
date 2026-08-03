import { Router } from "express";
import { ZodError } from "zod";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/requireAuth.middleware.js";
import { requireRole } from "../middleware/requireRole.middleware.js";
import { savedSearchService } from "../services/savedSearch.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  listSavedSearchesQuerySchema,
  savedSearchCreateSchema,
} from "../validators/savedSearch.validators.js";

export const savedSearchesRouter = Router();

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

savedSearchesRouter.use(requireAuth, requireRole("customer"));

savedSearchesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = listSavedSearchesQuerySchema.safeParse(req.query);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await savedSearchService.list(parsed.data, req.authUser!));
  }),
);

savedSearchesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = savedSearchCreateSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    const item = await savedSearchService.create(parsed.data, req.authUser!);
    res.status(201).json(item);
  }),
);

savedSearchesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id!;
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      throw new AppError("VALIDATION_ERROR", "Invalid id", 422, [
        { field: "id", issue: "must be uuid" },
      ]);
    }
    await savedSearchService.remove(id, req.authUser!);
    res.status(204).send();
  }),
);
