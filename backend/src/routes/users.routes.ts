import { Router } from "express";
import { ZodError } from "zod";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/requireAuth.middleware.js";
import { requireRole } from "../middleware/requireRole.middleware.js";
import { userService } from "../services/user.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  listUsersQuerySchema,
  userCreateSchema,
  userUpdateSchema,
} from "../validators/user.validators.js";

export const usersRouter = Router();

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

usersRouter.use(requireAuth);

usersRouter.get(
  "/",
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = listUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) throw zodToAppError(parsed.error);
    const result = await userService.list(parsed.data);
    res.status(200).json(result);
  }),
);

usersRouter.post(
  "/",
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = userCreateSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    const user = await userService.create(parsed.data, req.authUser!.role);
    res.status(201).json(user);
  }),
);

usersRouter.get(
  "/:id",
  requireRole("admin", "super_admin", "agent"),
  asyncHandler(async (req, res) => {
    const user = await userService.getById(req.params.id);
    res.status(200).json(user);
  }),
);

usersRouter.patch(
  "/:id",
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const parsed = userUpdateSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    const user = await userService.update(req.params.id, parsed.data, req.authUser!.role);
    res.status(200).json(user);
  }),
);

usersRouter.delete(
  "/:id",
  requireRole("super_admin"),
  asyncHandler(async (req, res) => {
    await userService.softDelete(req.params.id);
    res.status(204).send();
  }),
);
