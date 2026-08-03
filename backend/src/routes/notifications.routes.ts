import { Router } from "express";
import { ZodError } from "zod";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/requireAuth.middleware.js";
import { requireRole } from "../middleware/requireRole.middleware.js";
import { notificationService } from "../services/notification.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { listNotificationsQuerySchema } from "../validators/notification.validators.js";

export const notificationsRouter = Router();

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

notificationsRouter.use(requireAuth);
notificationsRouter.use(requireRole("customer", "agent", "admin", "super_admin"));

notificationsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = listNotificationsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await notificationService.list(req.authUser!.id, parsed.data));
  }),
);

notificationsRouter.post(
  "/read-all",
  asyncHandler(async (req, res) => {
    res.status(200).json(await notificationService.markAllRead(req.authUser!.id));
  }),
);

notificationsRouter.post(
  "/:id/read",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) throw new AppError("VALIDATION_ERROR", "Notification id required", 422);
    res.status(200).json(await notificationService.markRead(id, req.authUser!.id));
  }),
);
