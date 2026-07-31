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
    await prisma.property.deleteMany({ where: { agentId: null, title: { contains: "Edit QA" } } });
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }
}

describe("Property editor draft/publish/amenities", () => {
  const password = "SecurePass1!";
  const adminEmail = `qa.edit.admin.${Date.now()}@example.com`;
  let adminToken = "";
  let propertyId = "";

  it("seeds admin and draft property", async () => {
    await cleanupUserEmail(adminEmail);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
        fullName: "Edit Admin",
      },
    });
    const login = await request(app).post("/api/v1/auth/token").send({
      email: adminEmail,
      password,
    });
    expect(login.status).toBe(200);
    adminToken = login.body.accessToken;

    const created = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Edit QA Draft",
        price: "1000000",
        propertyType: "Apartment",
        addressLine: "1 Test St",
        city: "Pune",
        bedrooms: 2,
        bathrooms: 2,
        areaSqFt: 900,
        status: "draft",
      });
    expect(created.status).toBe(201);
    propertyId = created.body.id;
  });

  it("rejects publish when areaSqFt is 0", async () => {
    await request(app)
      .patch(`/api/v1/properties/${propertyId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ areaSqFt: 0 });

    const res = await request(app)
      .patch(`/api/v1/properties/${propertyId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "published" });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("updates fields and publishes", async () => {
    const updated = await request(app)
      .patch(`/api/v1/properties/${propertyId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Edit QA Published",
        description: "Nice flat",
        areaSqFt: 1100,
        featured: true,
        status: "published",
      });
    expect(updated.status).toBe(200);
    expect(updated.body.status).toBe("published");
    expect(updated.body.featured).toBe(true);
    expect(updated.body.description).toBe("Nice flat");
  });

  it("saves amenities including custom", async () => {
    const res = await request(app)
      .put(`/api/v1/properties/${propertyId}/amenities`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ amenities: ["Pool", "Gym", "Home Theatre"] });
    expect(res.status).toBe(200);
    expect(res.body.amenities).toEqual(expect.arrayContaining(["Pool", "Gym", "Home Theatre"]));

    const get = await request(app)
      .get(`/api/v1/properties/${propertyId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(get.status).toBe(200);
    expect(get.body.amenities).toEqual(expect.arrayContaining(["Pool", "Gym", "Home Theatre"]));
  });

  it("saves draft status from published", async () => {
    const res = await request(app)
      .patch(`/api/v1/properties/${propertyId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "draft" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("draft");
  });
});
