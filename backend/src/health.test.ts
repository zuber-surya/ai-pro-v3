import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

// Lightweight smoke without DB: health does not use Prisma
describe("GET /api/v1/health", () => {
  it("returns ok", async () => {
    process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/propvista";
    process.env.CORS_ORIGIN ??= "http://localhost:3000";
    const app = createApp();
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
