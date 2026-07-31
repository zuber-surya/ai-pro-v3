import { describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
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

async function seedUser(opts: {
  email: string;
  password: string;
  role: "customer" | "admin" | "super_admin";
  fullName?: string;
}) {
  await cleanupEmail(opts.email);
  return prisma.user.create({
    data: {
      email: opts.email,
      passwordHash: await bcrypt.hash(opts.password, 10),
      role: opts.role,
      fullName: opts.fullName ?? "Seed User",
    },
  });
}

async function login(email: string, password: string) {
  const res = await request(app).post("/api/v1/auth/token").send({ email, password });
  expect(res.status).toBe(200);
  return res.body.accessToken as string;
}

describe("Users admin CRUD", () => {
  const password = "SecurePass1!";
  const adminEmail = `qa.admin.${Date.now()}@example.com`;
  const superEmail = `qa.super.${Date.now()}@example.com`;
  const customerEmail = `qa.cust.${Date.now()}@example.com`;
  let adminToken = "";
  let superToken = "";
  let customerToken = "";
  let createdUserId = "";

  it("seeds actors", async () => {
    await seedUser({ email: adminEmail, password, role: "admin" });
    await seedUser({ email: superEmail, password, role: "super_admin" });
    await seedUser({ email: customerEmail, password, role: "customer" });
    adminToken = await login(adminEmail, password);
    superToken = await login(superEmail, password);
    customerToken = await login(customerEmail, password);
  });

  it("rejects unauthenticated list with 401", async () => {
    const res = await request(app).get("/api/v1/users");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("AUTH_INVALID_CREDENTIALS");
  });

  it("rejects customer list with 403", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("AUTH_FORBIDDEN");
  });

  it("lists users paginated for admin", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .query({ page: 1, pageSize: 10 })
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.pageSize).toBe(10);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(3);
    expect(res.body.meta.totalPages).toBeGreaterThanOrEqual(1);
  });

  it("creates a customer user as admin", async () => {
    const email = `qa.created.${Date.now()}@example.com`;
    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email,
        password,
        role: "customer",
        fullName: "Created User",
      });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe(email);
    expect(res.body.role).toBe("customer");
    expect(res.body.isActive).toBe(true);
    createdUserId = res.body.id;
  });

  it("rejects admin creating another admin with 403", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: `qa.badadmin.${Date.now()}@example.com`,
        password,
        role: "admin",
        fullName: "Nope",
      });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("AUTH_FORBIDDEN");
  });

  it("super admin can create admin", async () => {
    const email = `qa.newadmin.${Date.now()}@example.com`;
    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${superToken}`)
      .send({
        email,
        password,
        role: "admin",
        fullName: "New Admin",
      });
    expect(res.status).toBe(201);
    expect(res.body.role).toBe("admin");
    await cleanupEmail(email);
  });

  it("deactivates user via PATCH isActive", async () => {
    const res = await request(app)
      .patch(`/api/v1/users/${createdUserId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.isActive).toBe(false);
  });

  it("rejects short password on create with 422", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: `qa.short.${Date.now()}@example.com`,
        password: "short",
        role: "customer",
      });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("soft-deletes user as super_admin", async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${createdUserId}`)
      .set("Authorization", `Bearer ${superToken}`);
    expect(res.status).toBe(204);

    const getRes = await request(app)
      .get(`/api/v1/users/${createdUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(getRes.status).toBe(404);
  });

  it("rejects admin soft-delete with 403", async () => {
    const target = await seedUser({
      email: `qa.del.${Date.now()}@example.com`,
      password,
      role: "customer",
    });
    const res = await request(app)
      .delete(`/api/v1/users/${target.id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(403);
    await cleanupEmail(target.email);
  });
});
