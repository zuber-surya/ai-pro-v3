import { Router } from "express";
import { ZodError } from "zod";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/requireAuth.middleware.js";
import { requireRole } from "../middleware/requireRole.middleware.js";
import { notificationRuleService } from "../services/notificationRule.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  listNotificationRulesQuerySchema,
  notificationRuleCreateSchema,
  notificationRuleUpdateSchema,
} from "../validators/notificationRule.validators.js";

export const notificationRulesRouter = Router();

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

notificationRulesRouter.use(requireAuth);
notificationRulesRouter.use(requireRole("admin", "super_admin"));

notificationRulesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = listNotificationRulesQuerySchema.safeParse(req.query);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await notificationRuleService.list(parsed.data));
  }),
);

notificationRulesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = notificationRuleCreateSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(201).json(await notificationRuleService.create(parsed.data, req.authUser!.id));
  }),
);

notificationRulesRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) throw new AppError("VALIDATION_ERROR", "Rule id required", 422);
    const parsed = notificationRuleUpdateSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await notificationRuleService.update(id, parsed.data, req.authUser!.id));
  }),
);

notificationRulesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) throw new AppError("VALIDATION_ERROR", "Rule id required", 422);
    await notificationRuleService.remove(id);
    res.status(204).send();
  }),
);
