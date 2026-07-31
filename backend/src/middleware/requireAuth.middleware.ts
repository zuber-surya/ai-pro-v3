import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "../config/env.js";
import { AppError } from "./errorHandler.js";

export type AuthUser = {
  id: string;
  role: Role;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

type AccessPayload = {
  sub?: string;
  role?: Role;
  email?: string;
};

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new AppError("AUTH_INVALID_CREDENTIALS", "Authentication required", 401));
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    next(new AppError("AUTH_INVALID_CREDENTIALS", "Authentication required", 401));
    return;
  }

  const secret = env.JWT_ACCESS_SECRET;
  if (!secret) {
    next(new AppError("INTERNAL_ERROR", "JWT secrets are not configured", 500));
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as AccessPayload;
    if (!payload.sub || !payload.role || !payload.email) {
      next(new AppError("AUTH_INVALID_CREDENTIALS", "Invalid access token", 401));
      return;
    }
    req.authUser = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
    };
    next();
  } catch {
    next(new AppError("AUTH_INVALID_CREDENTIALS", "Invalid or expired access token", 401));
  }
}
