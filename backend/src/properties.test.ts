import { describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "./app.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

async function cleanupUserEmail(email: string) {
  const user = await prisma.user.findFirst({ where: { email } });
  if (user) {
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

describe("Properties inventory", () => {
  const password = "SecurePass1!";
  const adminEmail = `qa.prop.admin.${Date.now()}@example.com`;
  const agentEmail = `qa.prop.agent.${Date.now()}@example.com`;
  let adminToken = "";
  let agentToken = "";
  let agentProfileId = "";
  let propertyId = "";
  let otherPropertyId = "";

  it("seeds admin and agent", async () => {
    await cleanupUserEmail(adminEmail);
    await cleanupUserEmail(agentEmail);

    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
        fullName: "Prop Admin",
      },
    });

    const agentUser = await prisma.user.create({
      data: {
        email: agentEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "agent",
        fullName: "Prop Agent",
      },
    });
    const agent = await prisma.agent.create({
      data: {
        userId: agentUser.id,
        name: "Prop Agent",
        email: agentEmail,
      },
    });
    agentProfileId = agent.id;

    adminToken = await login(adminEmail, password);
    agentToken = await login(agentEmail, password);
  });

  it("creates properties", async () => {
    const mine = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${agentToken}`)
      .send({
        title: "Agent Flat",
        price: "4500000.00",
        propertyType: "Apartment",
        addressLine: "12 MG Road",
        city: "Bengaluru",
        bedrooms: 2,
        bathrooms: 2,
        areaSqFt: 1100,
        status: "published",
      });
    expect(mine.status).toBe(201);
    expect(mine.body.agentId).toBe(agentProfileId);
    propertyId = mine.body.id;

    const other = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Admin Villa",
        price: "12000000",
        propertyType: "Villa",
        addressLine: "1 Lake View",
        city: "Mysuru",
        status: "draft",
      });
    expect(other.status).toBe(201);
    otherPropertyId = other.body.id;
  });

  it("lists with status filter for admin", async () => {
    const res = await request(app)
      .get("/api/v1/properties")
      .query({ status: "draft", page: 1, pageSize: 20 })
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.every((p: { status: string }) => p.status === "draft")).toBe(true);
  });

  it("scopes agent list to own listings", async () => {
    const res = await request(app)
      .get("/api/v1/properties")
      .set("Authorization", `Bearer ${agentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.every((p: { agentId: string }) => p.agentId === agentProfileId)).toBe(
      true,
    );
    expect(res.body.data.some((p: { id: string }) => p.id === otherPropertyId)).toBe(false);
  });

  it("duplicates as draft", async () => {
    const res = await request(app)
      .post(`/api/v1/properties/${propertyId}/duplicate`)
      .set("Authorization", `Bearer ${agentToken}`);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("draft");
    expect(res.body.title).toContain("(Copy)");
  });

  it("archives property", async () => {
    const res = await request(app)
      .post(`/api/v1/properties/${propertyId}/archive`)
      .set("Authorization", `Bearer ${agentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("archived");
  });

  it("bulk updates status as admin", async () => {
    const res = await request(app)
      .post("/api/v1/properties/bulk/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ propertyIds: [otherPropertyId], status: "published" });
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });

  it("rejects agent bulk status with 403", async () => {
    const res = await request(app)
      .post("/api/v1/properties/bulk/status")
      .set("Authorization", `Bearer ${agentToken}`)
      .send({ propertyIds: [propertyId], status: "published" });
    expect(res.status).toBe(403);
  });

  it("exports csv", async () => {
    const res = await request(app)
      .get("/api/v1/properties/export")
      .query({ format: "csv" })
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/csv/);
    expect(res.text.split("\n")[0]).toContain("title");
  });

  it("deletes property", async () => {
    const res = await request(app)
      .delete(`/api/v1/properties/${otherPropertyId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});
