import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

describe("GET /api/v1/health", () => {
  it("returns ok with request id header", async () => {
    process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/propvista";
    process.env.CORS_ORIGIN ??= "http://localhost:3001";
    const app = createApp();
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.headers["x-request-id"]).toBeTruthy();
  });

  it("returns envelope on sample error", async () => {
    process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/propvista";
    process.env.CORS_ORIGIN ??= "http://localhost:3001";
    const app = createApp();
    const res = await request(app).get("/api/v1/health/error-sample");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual([{ field: "probe", issue: "intentional" }]);
    expect(res.headers["x-request-id"]).toBeTruthy();
  });
});
