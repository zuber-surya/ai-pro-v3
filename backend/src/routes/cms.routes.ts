import { Router } from "express";
import { ZodError } from "zod";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/requireAuth.middleware.js";
import { requireRole } from "../middleware/requireRole.middleware.js";
import { cmsService } from "../services/cms.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  cmsPageCreateSchema,
  cmsPageUpdateSchema,
  listCmsPagesQuerySchema,
} from "../validators/cms.validators.js";

export const cmsRouter = Router();
export const publicPagesRouter = Router();

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

/** Guest: published homepage CMS */
cmsRouter.get(
  "/homepage",
  asyncHandler(async (_req, res) => {
    res.status(200).json(await cmsService.getHomepage());
  }),
);

cmsRouter.get(
  "/pages",
  requireAuth,
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = listCmsPagesQuerySchema.safeParse(req.query);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await cmsService.list(parsed.data));
  }),
);

cmsRouter.post(
  "/pages",
  requireAuth,
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = cmsPageCreateSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(201).json(await cmsService.create(parsed.data, req.authUser!.id));
  }),
);

cmsRouter.get(
  "/pages/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) throw new AppError("VALIDATION_ERROR", "Page id required", 422);
    res.status(200).json(await cmsService.getById(id));
  }),
);

cmsRouter.patch(
  "/pages/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) throw new AppError("VALIDATION_ERROR", "Page id required", 422);
    const parsed = cmsPageUpdateSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await cmsService.update(id, parsed.data, req.authUser!.id));
  }),
);

cmsRouter.delete(
  "/pages/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) throw new AppError("VALIDATION_ERROR", "Page id required", 422);
    await cmsService.remove(id);
    res.status(204).send();
  }),
);

/** Guest: published page by slug */
publicPagesRouter.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const slug = req.params.slug;
    if (!slug) throw new AppError("VALIDATION_ERROR", "Slug required", 422);
    res.status(200).json(await cmsService.getPublishedBySlug(slug));
  }),
);
