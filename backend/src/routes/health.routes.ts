import { Router } from "express";
import { AppError } from "../middleware/errorHandler.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    version: "0.1.0",
  });
});

/** Dev-only probe for error envelope + requestId logging */
healthRouter.get("/error-sample", (_req, _res, next) => {
  next(new AppError("VALIDATION_ERROR", "Sample validation failure", 400, [{ field: "probe", issue: "intentional" }]));
});
