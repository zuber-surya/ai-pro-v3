import { describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "./app.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

async function cleanupUserEmail(email: string) {
  const user = await prisma.user.findFirst({ where: { email } });
  if (user) {
    await prisma.lead.deleteMany({
      where: { OR: [{ customerUserId: user.id }, { email: { contains: "qa.lead" } }] },
    });
    const agent = await prisma.agent.findUnique({ where: { userId: user.id } });
    if (agent) {
      await prisma.lead.deleteMany({ where: { assigneeAgentId: agent.id } });
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

describe("Lead inquire from property", () => {
  const password = "SecurePass1!";
  const adminEmail = `qa.lead.admin.${Date.now()}@example.com`;
  let adminToken = "";
  let propertyId = "";
  let leadId = "";
  const idemKey = `idem-lead-${Date.now()}`;

  it("seeds published property", async () => {
    await cleanupUserEmail(adminEmail);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
        fullName: "Lead Admin",
      },
    });
    adminToken = await login(adminEmail, password);

    const agent = await prisma.agent.create({
      data: {
        name: "Lead Agent",
        email: `qa.lead.agent.${Date.now()}@example.com`,
        phone: "+91 98888 11111",
      },
    });

    const created = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Lead CTA Flat",
        price: "6200000",
        propertyType: "Apartment",
        addressLine: "12 Residency Road",
        city: "Bengaluru",
        bedrooms: 2,
        bathrooms: 2,
        areaSqFt: 1100,
        status: "published",
        agentId: agent.id,
      });
    expect(created.status).toBe(201);
    propertyId = created.body.id;
  });

  it("creates inquire lead as guest with source/property", async () => {
    const res = await request(app)
      .post("/api/v1/leads")
      .set("Idempotency-Key", idemKey)
      .send({
        name: "Priya Guest",
        email: `qa.lead.guest.${Date.now()}@example.com`,
        phone: "+91 90000 12345",
        message: "Interested in a weekend tour",
        source: "property_inquire",
        propertyId,
      });
    expect(res.status).toBe(201);
    expect(res.body.propertyId).toBe(propertyId);
    expect(res.body.source).toBe("property_inquire");
    expect(res.body.stage).toBe("new");
    expect(res.body.agentId).toBeTruthy();
    leadId = res.body.id;
  });

  it("replays idempotent create", async () => {
    const res = await request(app)
      .post("/api/v1/leads")
      .set("Idempotency-Key", idemKey)
      .send({
        name: "Priya Guest",
        email: "ignored@example.com",
        source: "property_inquire",
        propertyId,
      });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(leadId);
  });

  it("lists lead via admin API", async () => {
    const res = await request(app)
      .get("/api/v1/leads")
      .query({ propertyId })
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.some((l: { id: string }) => l.id === leadId)).toBe(true);
  });

  it("rejects create without Idempotency-Key", async () => {
    const res = await request(app).post("/api/v1/leads").send({
      name: "No Key",
      email: "nokey@example.com",
      source: "property_callback",
      propertyId,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("creates homepage contact lead without propertyId", async () => {
    const res = await request(app)
      .post("/api/v1/leads")
      .set("Idempotency-Key", `home-${Date.now()}`)
      .send({
        name: "Home Visitor",
        email: `qa.home.lead.${Date.now()}@example.com`,
        phone: "+91 98888 11111",
        message: "Looking for 3BHK near metro",
        preferredContactTime: "Weekday evenings",
        source: "homepage_contact",
      });
    expect(res.status).toBe(201);
    expect(res.body.source).toBe("homepage_contact");
    expect(res.body.propertyId).toBeNull();
    expect(res.body.stage).toBe("new");
  });

  it("admin can add lead manually", async () => {
    const res = await request(app)
      .post("/api/v1/leads")
      .set("Authorization", `Bearer ${adminToken}`)
      .set("Idempotency-Key", `manual-${Date.now()}`)
      .send({
        name: "Manual Lead",
        email: `qa.manual.lead.${Date.now()}@example.com`,
        phone: "+91 91111 22222",
        source: "manual_add",
        message: "Called in from walk-in",
      });
    expect(res.status).toBe(201);
    expect(res.body.source).toBe("manual_add");
    expect(res.body.stage).toBe("new");
  });

  it("get lead by id for admin", async () => {
    const res = await request(app)
      .get(`/api/v1/leads/${leadId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(leadId);
  });

  it("patches stage and persists", async () => {
    const res = await request(app)
      .patch(`/api/v1/leads/${leadId}/stage`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ stage: "contacted" });
    expect(res.status).toBe(200);
    expect(res.body.stage).toBe("contacted");
  });

  it("creates and lists notes", async () => {
    const created = await request(app)
      .post(`/api/v1/leads/${leadId}/notes`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ body: "Called lead — interested in weekend tour" });
    expect(created.status).toBe(201);
    expect(created.body.body).toContain("weekend tour");
    expect(created.body.createdAt).toBeTruthy();

    const listed = await request(app)
      .get(`/api/v1/leads/${leadId}/notes`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(listed.status).toBe(200);
    expect(Array.isArray(listed.body)).toBe(true);
    expect(listed.body.some((n: { id: string }) => n.id === created.body.id)).toBe(true);
  });
});

