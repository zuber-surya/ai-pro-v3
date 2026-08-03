import { describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "./app.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

async function cleanupUserEmail(email: string) {
  const user = await prisma.user.findFirst({ where: { email } });
  if (user) {
    await prisma.favorite.deleteMany({ where: { userId: user.id } });
    const agent = await prisma.agent.findUnique({ where: { userId: user.id } });
    if (agent) {
      await prisma.property.deleteMany({ where: { agentId: agent.id } });
      await prisma.agent.delete({ where: { id: agent.id } });
    }
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }
}

async function login(email: string, password: string) {
  const res = await request(app).post("/api/v1/auth/token").send({ email, password });
  expect(res.status).toBe(200);
  return res.body.accessToken as string;
}

describe("Favorites", () => {
  const password = "SecurePass1!";
  const customerEmail = `qa.fav.customer.${Date.now()}@example.com`;
  const adminEmail = `qa.fav.admin.${Date.now()}@example.com`;
  let customerToken = "";
  let adminToken = "";
  let propertyId = "";

  it("seeds customer, admin, published property", async () => {
    await cleanupUserEmail(customerEmail);
    await cleanupUserEmail(adminEmail);

    await prisma.user.create({
      data: {
        email: customerEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "customer",
        fullName: "Fav Customer",
      },
    });
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
        fullName: "Fav Admin",
      },
    });
    customerToken = await login(customerEmail, password);
    adminToken = await login(adminEmail, password);

    const created = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Favorite Target Flat",
        price: "6500000",
        propertyType: "Apartment",
        addressLine: "22 Favorite Road",
        city: "Bengaluru",
        bedrooms: 2,
        bathrooms: 2,
        areaSqFt: 1200,
        status: "published",
      });
    expect(created.status).toBe(201);
    propertyId = created.body.id;
  });

  it("forbids non-customer writes", async () => {
    const res = await request(app)
      .post("/api/v1/favorites")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ propertyId });
    expect(res.status).toBe(403);
  });

  it("adds favorite idempotently", async () => {
    const first = await request(app)
      .post("/api/v1/favorites")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ propertyId });
    expect(first.status).toBe(201);
    expect(first.body.propertyId).toBe(propertyId);
    expect(first.body.property?.id).toBe(propertyId);

    const second = await request(app)
      .post("/api/v1/favorites")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ propertyId });
    expect(second.status).toBe(200);
    expect(second.body.propertyId).toBe(propertyId);

    const ids = await request(app)
      .get("/api/v1/favorites/ids")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(ids.status).toBe(200);
    expect(ids.body.propertyIds).toContain(propertyId);

    const list = await request(app)
      .get("/api/v1/favorites")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(list.status).toBe(200);
    expect(list.body.data.some((f: { propertyId: string }) => f.propertyId === propertyId)).toBe(
      true,
    );
  });

  it("removes favorite idempotently", async () => {
    const del = await request(app)
      .delete(`/api/v1/favorites/${propertyId}`)
      .set("Authorization", `Bearer ${customerToken}`);
    expect(del.status).toBe(204);

    const again = await request(app)
      .delete(`/api/v1/favorites/${propertyId}`)
      .set("Authorization", `Bearer ${customerToken}`);
    expect(again.status).toBe(204);

    const ids = await request(app)
      .get("/api/v1/favorites/ids")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(ids.body.propertyIds).not.toContain(propertyId);
  });

  it("cleanup", async () => {
    if (propertyId) {
      await prisma.favorite.deleteMany({ where: { propertyId } });
      await prisma.property.deleteMany({ where: { id: propertyId } });
    }
    await cleanupUserEmail(customerEmail);
    await cleanupUserEmail(adminEmail);
  });
});
