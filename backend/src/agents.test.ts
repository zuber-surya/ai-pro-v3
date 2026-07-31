import { describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "./app.js";
import { prisma } from "./lib/prisma.js";
import { assertValidImageUpload } from "./integrations/storage/local.storage.js";
import { AppError } from "./middleware/errorHandler.js";

const app = createApp();

async function cleanupAgentEmail(email: string) {
  await prisma.agent.deleteMany({ where: { email: email.toLowerCase() } });
}

async function cleanupUserEmail(email: string) {
  const user = await prisma.user.findFirst({ where: { email } });
  if (user) {
    await prisma.agent.deleteMany({ where: { userId: user.id } });
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }
}

async function seedAdmin() {
  const email = `qa.agent.admin.${Date.now()}@example.com`;
  const password = "SecurePass1!";
  await cleanupUserEmail(email);
  await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "admin",
      fullName: "Agent Admin",
    },
  });
  const login = await request(app).post("/api/v1/auth/token").send({ email, password });
  expect(login.status).toBe(200);
  return { email, token: login.body.accessToken as string };
}

describe("local image validation", () => {
  it("rejects invalid MIME", () => {
    expect(() =>
      assertValidImageUpload({
        mimetype: "application/pdf",
        size: 100,
        buffer: Buffer.from("%PDF"),
      }),
    ).toThrow(AppError);
  });

  it("rejects oversized image", () => {
    expect(() =>
      assertValidImageUpload({
        mimetype: "image/png",
        size: 3 * 1024 * 1024,
        buffer: Buffer.alloc(100),
      }),
    ).toThrow(AppError);
  });
});

describe("Agents CRUD + image upload", () => {
  let adminToken = "";
  let agentId = "";
  const agentEmail = `qa.agent.${Date.now()}@example.com`;

  it("seeds admin", async () => {
    const admin = await seedAdmin();
    adminToken = admin.token;
  });

  it("creates agent", async () => {
    await cleanupAgentEmail(agentEmail);
    const res = await request(app)
      .post("/api/v1/agents")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Ada Agent",
        email: agentEmail,
        phone: "+919999999999",
      });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Ada Agent");
    expect(res.body.email).toBe(agentEmail.toLowerCase());
    agentId = res.body.id;
  });

  it("lists agents", async () => {
    const res = await request(app)
      .get("/api/v1/agents")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.some((a: { id: string }) => a.id === agentId)).toBe(true);
  });

  it("updates agent", async () => {
    const res = await request(app)
      .patch(`/api/v1/agents/${agentId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ phone: "+918888888888" });
    expect(res.status).toBe(200);
    expect(res.body.phone).toBe("+918888888888");
  });

  it("rejects non-image upload with 422", async () => {
    const res = await request(app)
      .post(`/api/v1/agents/${agentId}/image`)
      .set("Authorization", `Bearer ${adminToken}`)
      .attach("file", Buffer.from("not-an-image"), {
        filename: "doc.pdf",
        contentType: "application/pdf",
      });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects oversized upload with 422", async () => {
    const big = Buffer.alloc(2 * 1024 * 1024 + 10, 1);
    const res = await request(app)
      .post(`/api/v1/agents/${agentId}/image`)
      .set("Authorization", `Bearer ${adminToken}`)
      .attach("file", big, { filename: "big.png", contentType: "image/png" });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("accepts png upload", async () => {
    // minimal 1x1 PNG
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );
    const res = await request(app)
      .post(`/api/v1/agents/${agentId}/image`)
      .set("Authorization", `Bearer ${adminToken}`)
      .attach("file", png, { filename: "dot.png", contentType: "image/png" });
    expect(res.status).toBe(200);
    expect(res.body.profileImageUrl).toMatch(/^\/uploads\/agents\//);
  });

  it("deletes agent", async () => {
    const res = await request(app)
      .delete(`/api/v1/agents/${agentId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});
