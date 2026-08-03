import { Router } from "express";
import { ZodError } from "zod";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/requireAuth.middleware.js";
import { requireRole } from "../middleware/requireRole.middleware.js";
import { leadService } from "../services/lead.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  leadCreateSchema,
  leadNoteCreateSchema,
  leadStagePatchSchema,
  leadUpdateSchema,
  listLeadsQuerySchema,
} from "../validators/lead.validators.js";

export const leadsRouter = Router();

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

leadsRouter.get(
  "/",
  requireAuth,
  requireRole("agent", "admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = listLeadsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await leadService.list(parsed.data, req.authUser!));
  }),
);

leadsRouter.get(
  "/:id/notes",
  requireAuth,
  requireRole("agent", "admin", "super_admin"),
  asyncHandler(async (req, res) => {
    res.status(200).json(await leadService.listNotes(req.params.id!, req.authUser!));
  }),
);

leadsRouter.post(
  "/:id/notes",
  requireAuth,
  requireRole("agent", "admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = leadNoteCreateSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(201).json(await leadService.createNote(req.params.id!, parsed.data, req.authUser!));
  }),
);

leadsRouter.patch(
  "/:id/stage",
  requireAuth,
  requireRole("agent", "admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = leadStagePatchSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await leadService.updateStage(req.params.id!, parsed.data, req.authUser!));
  }),
);

leadsRouter.get(
  "/:id",
  requireAuth,
  requireRole("agent", "admin", "super_admin", "customer"),
  asyncHandler(async (req, res) => {
    res.status(200).json(await leadService.getById(req.params.id!, req.authUser!));
  }),
);

leadsRouter.patch(
  "/:id",
  requireAuth,
  requireRole("agent", "admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = leadUpdateSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await leadService.update(req.params.id!, parsed.data, req.authUser!));
  }),
);

/** Public inquire/callback/schedule capture; optional auth attaches customer. */
leadsRouter.post(
  "/",
  (req, res, next) => {
    if (req.headers.authorization) {
      requireAuth(req, res, next);
      return;
    }
    next();
  },
  asyncHandler(async (req, res) => {
    const parsed = leadCreateSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);

    const idempotencyKeyHeader = req.header("Idempotency-Key")?.trim();
    if (!idempotencyKeyHeader) {
      throw new AppError("VALIDATION_ERROR", "Idempotency-Key header required", 400, [
        { field: "Idempotency-Key", issue: "required" },
      ]);
    }

    const { lead, replayed } = await leadService.create(
      parsed.data,
      req.authUser,
      idempotencyKeyHeader,
    );
    res.status(replayed ? 200 : 201).json(lead);
  }),
);
