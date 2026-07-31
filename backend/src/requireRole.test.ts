import { describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { requireRole } from "./middleware/requireRole.middleware.js";
import { AppError } from "./middleware/errorHandler.js";

function mockRes() {
  return {} as Response;
}

describe("requireRole", () => {
  it("returns 403 AUTH_FORBIDDEN when role mismatches", () => {
    const mw = requireRole("admin", "super_admin");
    const req = {
      authUser: { id: "u1", role: "customer", email: "c@example.com" },
    } as Request;
    const next = vi.fn() as NextFunction;
    mw(req, mockRes(), next);
    expect(next).toHaveBeenCalledOnce();
    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0][0] as AppError;
    expect(err).toBeInstanceOf(AppError);
    expect(err.status).toBe(403);
    expect(err.code).toBe("AUTH_FORBIDDEN");
  });

  it("allows matching role", () => {
    const mw = requireRole("admin", "super_admin");
    const req = {
      authUser: { id: "u1", role: "admin", email: "a@example.com" },
    } as Request;
    const next = vi.fn() as NextFunction;
    mw(req, mockRes(), next);
    expect(next).toHaveBeenCalledWith();
  });
});
