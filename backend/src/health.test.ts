import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";
import { redactSecrets } from "./middleware/errorHandler.js";

describe("GET /api/v1/health", () => {
  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  it("returns ok with db check and request id header", async () => {
    process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/propvista";
    process.env.CORS_ORIGIN ??= "http://localhost:3001";
    const app = createApp();
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.version).toBeTruthy();
    expect(res.body.checks.database).toBe("up");
    expect(res.headers["x-request-id"]).toBeTruthy();
  });

  it("returns envelope on sample error outside production", async () => {
    process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/propvista";
    process.env.CORS_ORIGIN ??= "http://localhost:3001";
    process.env.NODE_ENV = "test";
    const app = createApp();
    const res = await request(app).get("/api/v1/health/error-sample");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual([{ field: "probe", issue: "intentional" }]);
    expect(res.headers["x-request-id"]).toBeTruthy();
  });

  it("hides error-sample in production", async () => {
    process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/propvista";
    process.env.CORS_ORIGIN ??= "http://localhost:3001";
    process.env.NODE_ENV = "production";
    const app = createApp();
    const res = await request(app).get("/api/v1/health/error-sample");
    expect(res.status).toBe(404);
  });
});

describe("redactSecrets", () => {
  it("scrubs bearer tokens and connection strings", () => {
    const raw =
      'Authorization Bearer abc.def.ghi DATABASE_URL=postgresql://user:pass@localhost:5432/db api_key=sk-secret';
    const scrubbed = redactSecrets(raw);
    expect(scrubbed).not.toContain("abc.def.ghi");
    expect(scrubbed).not.toContain("user:pass");
    expect(scrubbed).not.toContain("sk-secret");
    expect(scrubbed).toContain("[REDACTED]");
  });
});
