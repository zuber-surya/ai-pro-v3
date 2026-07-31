import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

async function cleanupEmail(email: string) {
  const user = await prisma.user.findFirst({ where: { email } });
  if (user) {
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }
}

describe("Auth register/login", () => {
  const email = `qa.auth.${Date.now()}@example.com`;
  const password = "SecurePass1!";

  it("registers a customer and returns tokens", async () => {
    await cleanupEmail(email);
    const res = await request(app).post("/api/v1/auth/register").send({
      email,
      password,
      fullName: "QA User",
    });
    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
    expect(res.body.tokenType).toBe("Bearer");
    expect(res.body.expiresIn).toBeGreaterThan(0);
  });

  it("rejects duplicate email with 409", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email,
      password,
      fullName: "QA User",
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT_DUPLICATE_EMAIL");
  });

  it("logs in with valid credentials", async () => {
    const res = await request(app).post("/api/v1/auth/token").send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
  });

  it("rejects invalid credentials with 401", async () => {
    const res = await request(app).post("/api/v1/auth/token").send({
      email,
      password: "WrongPass999!",
    });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("AUTH_INVALID_CREDENTIALS");
  });

  it("rejects short password on register", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: `short.${Date.now()}@example.com`,
      password: "short",
      fullName: "Short",
    });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("Auth refresh/logout/guards", () => {
  const email = `qa.session.${Date.now()}@example.com`;
  const password = "SecurePass1!";
  let accessToken = "";
  let refreshToken = "";

  it("registers session user", async () => {
    await cleanupEmail(email);
    const res = await request(app).post("/api/v1/auth/register").send({
      email,
      password,
      fullName: "Session User",
    });
    expect(res.status).toBe(201);
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it("returns current user via /auth/me", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(email);
    expect(res.body.role).toBe("customer");
  });

  it("rejects /auth/me without token with 401", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("AUTH_INVALID_CREDENTIALS");
  });

  it("refreshes tokens and rotates refresh", async () => {
    const res = await request(app).post("/api/v1/auth/refresh").send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
    expect(res.body.refreshToken).not.toBe(refreshToken);

    const reused = await request(app).post("/api/v1/auth/refresh").send({ refreshToken });
    expect(reused.status).toBe(401);

    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it("logs out and invalidates refresh", async () => {
    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(204);

    const refreshed = await request(app).post("/api/v1/auth/refresh").send({ refreshToken });
    expect(refreshed.status).toBe(401);
  });
});
