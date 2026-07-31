import { Router } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/requireAuth.middleware.js";
import { requireRole } from "../middleware/requireRole.middleware.js";
import { localStorageLimits } from "../integrations/storage/local.storage.js";
import { propertyService } from "../services/property.service.js";
import { propertyImageService } from "../services/propertyImage.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  amenitiesUpdateSchema,
  bulkPropertyStatusSchema,
  exportPropertiesQuerySchema,
  listPropertiesQuerySchema,
  propertyCreateSchema,
  propertyStatusPatchSchema,
  propertyUpdateSchema,
} from "../validators/property.validators.js";
import { propertyImageUploadMetaSchema } from "../validators/propertyImage.validators.js";

export const propertiesRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: localStorageLimits.maxBytes },
});

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

function multerErrorHandler(
  err: unknown,
  _req: import("express").Request,
  _res: import("express").Response,
  next: import("express").NextFunction,
): void {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      next(
        new AppError("VALIDATION_ERROR", "Image exceeds 2MB limit", 422, [
          { field: "file", issue: "max 2MB" },
        ]),
      );
      return;
    }
    next(new AppError("VALIDATION_ERROR", err.message, 422, [{ field: "file", issue: err.code }]));
    return;
  }
  next(err);
}

propertiesRouter.get(
  "/export",
  requireAuth,
  requireRole("agent", "admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = exportPropertiesQuerySchema.safeParse(req.query);
    if (!parsed.success) throw zodToAppError(parsed.error);
    if (parsed.data.format === "json") {
      const list = await propertyService.list(
        {
          page: 1,
          pageSize: parsed.data.limit,
          status: parsed.data.status,
          q: parsed.data.q,
          sortBy: parsed.data.sortBy,
          sortOrder: parsed.data.sortOrder,
        },
        req.authUser!,
      );
      res.status(200).json(list);
      return;
    }
    const csv = await propertyService.exportCsv(parsed.data, req.authUser!);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="properties.csv"');
    res.status(200).send(csv);
  }),
);

propertiesRouter.post(
  "/bulk/status",
  requireAuth,
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = bulkPropertyStatusSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    const result = await propertyService.bulkStatus(parsed.data, req.authUser!);
    res.status(200).json(result);
  }),
);

propertiesRouter.get(
  "/",
  requireAuth,
  requireRole("agent", "admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = listPropertiesQuerySchema.safeParse(req.query);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await propertyService.list(parsed.data, req.authUser!));
  }),
);

propertiesRouter.post(
  "/",
  requireAuth,
  requireRole("agent", "admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = propertyCreateSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    const property = await propertyService.create(parsed.data, req.authUser!);
    res.status(201).json(property);
  }),
);

propertiesRouter.get(
  "/:id",
  (req, res, next) => {
    if (req.headers.authorization) {
      requireAuth(req, res, next);
      return;
    }
    next();
  },
  asyncHandler(async (req, res) => {
    const property = await propertyService.getById(req.params.id, req.authUser);
    res.status(200).json(property);
  }),
);

propertiesRouter.patch(
  "/:id",
  requireAuth,
  requireRole("agent", "admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = propertyUpdateSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    const property = await propertyService.update(req.params.id, parsed.data, req.authUser!);
    res.status(200).json(property);
  }),
);

propertiesRouter.put(
  "/:id/amenities",
  requireAuth,
  requireRole("agent", "admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = amenitiesUpdateSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    const property = await propertyService.replaceAmenities(
      req.params.id,
      parsed.data,
      req.authUser!,
    );
    res.status(200).json(property);
  }),
);

propertiesRouter.get(
  "/:id/images",
  (req, res, next) => {
    if (req.headers.authorization) {
      requireAuth(req, res, next);
      return;
    }
    next();
  },
  asyncHandler(async (req, res) => {
    const images = await propertyImageService.list(req.params.id, req.authUser);
    res.status(200).json(images);
  }),
);

propertiesRouter.post(
  "/:id/images",
  requireAuth,
  requireRole("agent", "admin", "super_admin"),
  (req, res, next) => {
    upload.single("file")(req, res, (err) => multerErrorHandler(err, req, res, next));
  },
  asyncHandler(async (req, res) => {
    const parsed = propertyImageUploadMetaSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    const file = req.file
      ? { mimetype: req.file.mimetype, size: req.file.size, buffer: req.file.buffer }
      : undefined;
    const image = await propertyImageService.upload(
      req.params.id,
      file,
      parsed.data,
      req.authUser!,
    );
    res.status(201).json(image);
  }),
);

propertiesRouter.delete(
  "/:id/images/:imageId",
  requireAuth,
  requireRole("agent", "admin", "super_admin"),
  asyncHandler(async (req, res) => {
    await propertyImageService.remove(req.params.id, req.params.imageId, req.authUser!);
    res.status(204).send();
  }),
);

propertiesRouter.delete(
  "/:id",
  requireAuth,
  requireRole("agent", "admin", "super_admin"),
  asyncHandler(async (req, res) => {
    await propertyService.remove(req.params.id, req.authUser!);
    res.status(204).send();
  }),
);

propertiesRouter.patch(
  "/:id/status",
  requireAuth,
  requireRole("agent", "admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = propertyStatusPatchSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    const property = await propertyService.updateStatus(
      req.params.id,
      parsed.data.status,
      req.authUser!,
    );
    res.status(200).json(property);
  }),
);

propertiesRouter.post(
  "/:id/duplicate",
  requireAuth,
  requireRole("agent", "admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const property = await propertyService.duplicate(req.params.id, req.authUser!);
    res.status(201).json(property);
  }),
);

propertiesRouter.post(
  "/:id/archive",
  requireAuth,
  requireRole("agent", "admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const property = await propertyService.archive(req.params.id, req.authUser!);
    res.status(200).json(property);
  }),
);
