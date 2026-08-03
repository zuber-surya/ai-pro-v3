import { describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "./app.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

async function cleanupUserEmail(email: string) {
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) return;
  await prisma.visit.deleteMany({
    where: { OR: [{ customerUserId: user.id }, { createdByUserId: user.id }] },
  });
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
}

async function login(email: string, password: string) {
  const res = await request(app).post("/api/v1/auth/token").send({ email, password });
  expect(res.status).toBe(200);
  return res.body.accessToken as string;
}

describe("POST /api/v1/visits", () => {
  const password = "SecurePass1!";
  const customerEmail = `qa.visit.cust.${Date.now()}@example.com`;
  const adminEmail = `qa.visit.admin.${Date.now()}@example.com`;
  let customerToken = "";
  let adminToken = "";
  let propertyId = "";

  it("seeds customer, admin, and published property", async () => {
    await cleanupUserEmail(customerEmail);
    await cleanupUserEmail(adminEmail);

    await prisma.user.create({
      data: {
        email: customerEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "customer",
        fullName: "Visit Customer",
      },
    });
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
        fullName: "Visit Admin",
      },
    });

    customerToken = await login(customerEmail, password);
    adminToken = await login(adminEmail, password);

    const agent = await prisma.agent.create({
      data: {
        name: "Visit Agent",
        email: `qa.visit.agent.${Date.now()}@example.com`,
      },
    });

    const created = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Visit Tour Flat",
        price: "7500000",
        propertyType: "Apartment",
        addressLine: "88 Tour Road",
        city: "Bengaluru",
        bedrooms: 3,
        bathrooms: 2,
        areaSqFt: 1400,
        status: "published",
        agentId: agent.id,
      });
    expect(created.status).toBe(201);
    propertyId = created.body.id;
  });

  it("customer creates visit request", async () => {
    const when = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const res = await request(app)
      .post("/api/v1/visits")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        propertyId,
        scheduledAt: when,
        notes: "Prefer afternoon",
      });
    expect(res.status).toBe(201);
    expect(res.body.propertyId).toBe(propertyId);
    expect(res.body.status).toBe("requested");
    expect(res.body.scheduledAt).toBeTruthy();
  });

  it("rejects past scheduledAt", async () => {
    const res = await request(app)
      .post("/api/v1/visits")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        propertyId,
        scheduledAt: new Date(Date.now() - 3600_000).toISOString(),
      });
    expect(res.status).toBe(422);
  });

  it("admin can schedule with leadId and advances stage", async () => {
    const lead = await prisma.lead.create({
      data: {
        name: "Visit Lead",
        email: `qa.visit.lead.${Date.now()}@example.com`,
        source: "manual_add",
        propertyId,
        stage: "new",
      },
    });
    const when = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
    const res = await request(app)
      .post("/api/v1/visits")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        propertyId,
        scheduledAt: when,
        leadId: lead.id,
        notes: "Agent-booked tour",
      });
    expect(res.status).toBe(201);
    expect(res.body.leadId).toBe(lead.id);

    const updated = await prisma.lead.findUnique({ where: { id: lead.id } });
    expect(updated?.stage).toBe("visit_scheduled");
  });
});
