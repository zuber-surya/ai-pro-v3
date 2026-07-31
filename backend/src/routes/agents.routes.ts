import { Router } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/requireAuth.middleware.js";
import { requireRole } from "../middleware/requireRole.middleware.js";
import { agentService } from "../services/agent.service.js";
import { localStorageLimits } from "../integrations/storage/local.storage.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  agentCreateSchema,
  agentUpdateSchema,
  listAgentsQuerySchema,
} from "../validators/agent.validators.js";

export const agentsRouter = Router();

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

agentsRouter.get(
  "/",
  requireAuth,
  requireRole("customer", "agent", "admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = listAgentsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await agentService.list(parsed.data));
  }),
);

agentsRouter.post(
  "/",
  requireAuth,
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = agentCreateSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    const agent = await agentService.create(parsed.data);
    res.status(201).json(agent);
  }),
);

agentsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const agent = await agentService.getById(req.params.id);
    res.status(200).json(agent);
  }),
);

agentsRouter.patch(
  "/:id",
  requireAuth,
  requireRole("admin", "super_admin", "agent"),
  asyncHandler(async (req, res) => {
    const parsed = agentUpdateSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    const agent = await agentService.update(req.params.id, parsed.data);
    res.status(200).json(agent);
  }),
);

agentsRouter.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    await agentService.remove(req.params.id);
    res.status(204).send();
  }),
);

agentsRouter.post(
  "/:id/image",
  requireAuth,
  requireRole("admin", "super_admin"),
  (req, res, next) => {
    upload.single("file")(req, res, (err) => multerErrorHandler(err, req, res, next));
  },
  asyncHandler(async (req, res) => {
    const file = req.file
      ? { mimetype: req.file.mimetype, size: req.file.size, buffer: req.file.buffer }
      : undefined;
    const agent = await agentService.uploadImage(req.params.id, file);
    res.status(200).json(agent);
  }),
);
