import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { AppError } from "./errorHandler.js";

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.authUser;
    if (!user) {
      next(new AppError("AUTH_INVALID_CREDENTIALS", "Authentication required", 401));
      return;
    }
    if (!roles.includes(user.role)) {
      next(new AppError("AUTH_FORBIDDEN", "Insufficient permissions", 403));
      return;
    }
    next();
  };
}
