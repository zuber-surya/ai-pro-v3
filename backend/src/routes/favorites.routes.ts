import { Router } from "express";
import { ZodError } from "zod";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/requireAuth.middleware.js";
import { requireRole } from "../middleware/requireRole.middleware.js";
import { favoriteService } from "../services/favorite.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  favoriteCreateSchema,
  listFavoritesQuerySchema,
} from "../validators/favorite.validators.js";

export const favoritesRouter = Router();

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

favoritesRouter.use(requireAuth, requireRole("customer"));

favoritesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = listFavoritesQuerySchema.safeParse(req.query);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await favoriteService.list(parsed.data, req.authUser!));
  }),
);

/** Compact id set for UI toggle state */
favoritesRouter.get(
  "/ids",
  asyncHandler(async (req, res) => {
    res.status(200).json(await favoriteService.listPropertyIds(req.authUser!));
  }),
);

favoritesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = favoriteCreateSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    const { item, created } = await favoriteService.add(parsed.data, req.authUser!);
    res.status(created ? 201 : 200).json(item);
  }),
);

favoritesRouter.delete(
  "/:propertyId",
  asyncHandler(async (req, res) => {
    const propertyId = req.params.propertyId!;
    if (!/^[0-9a-f-]{36}$/i.test(propertyId)) {
      throw new AppError("VALIDATION_ERROR", "Invalid property id", 422, [
        { field: "propertyId", issue: "must be uuid" },
      ]);
    }
    await favoriteService.remove(propertyId, req.authUser!);
    res.status(204).send();
  }),
);
