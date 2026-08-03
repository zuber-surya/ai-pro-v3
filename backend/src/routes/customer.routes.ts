import { Router } from "express";
import { ZodError } from "zod";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/requireAuth.middleware.js";
import { requireRole } from "../middleware/requireRole.middleware.js";
import { customerService } from "../services/customer.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  customerProfileUpdateSchema,
  listInquiriesQuerySchema,
} from "../validators/customer.validators.js";
import { savedSearchesRouter } from "./savedSearches.routes.js";

export const customerRouter = Router();

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

customerRouter.use(requireAuth, requireRole("customer"));
customerRouter.use("/saved-searches", savedSearchesRouter);

customerRouter.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    res.status(200).json(await customerService.getDashboard(req.authUser!));
  }),
);

customerRouter.get(
  "/profile",
  asyncHandler(async (req, res) => {
    res.status(200).json(await customerService.getProfile(req.authUser!));
  }),
);

customerRouter.put(
  "/profile",
  asyncHandler(async (req, res) => {
    const parsed = customerProfileUpdateSchema.safeParse(req.body);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await customerService.updateProfile(parsed.data, req.authUser!));
  }),
);

customerRouter.get(
  "/inquiries",
  asyncHandler(async (req, res) => {
    const parsed = listInquiriesQuerySchema.safeParse(req.query);
    if (!parsed.success) throw zodToAppError(parsed.error);
    res.status(200).json(await customerService.listInquiries(parsed.data, req.authUser!));
  }),
);
