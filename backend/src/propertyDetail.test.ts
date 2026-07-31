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
      await prisma.propertyImage.deleteMany({
        where: { property: { agentId: agent.id } },
      });
      await prisma.propertyAmenity.deleteMany({
        where: { property: { agentId: agent.id } },
      });
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

describe("Property detail DTO", () => {
  const password = "SecurePass1!";
  const adminEmail = `qa.detail.admin.${Date.now()}@example.com`;
  let adminToken = "";
  let publishedId = "";
  let draftId = "";
  let similarId = "";
  let agentId = "";

  it("seeds published property with amenities, image, agent", async () => {
    await cleanupUserEmail(adminEmail);

    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
        fullName: "Detail Admin",
      },
    });
    adminToken = await login(adminEmail, password);

    const agent = await prisma.agent.create({
      data: {
        name: "Detail Agent",
        email: `agent.detail.${Date.now()}@example.com`,
        phone: "+91 90000 00000",
      },
    });
    agentId = agent.id;

    const published = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Published Detail Flat",
        price: "5000000.00",
        propertyType: "Apartment",
        addressLine: "10 Ring Road",
        city: "Bengaluru",
        bedrooms: 3,
        bathrooms: 2,
        areaSqFt: 1450,
        status: "published",
        description: "Bright corner unit",
        agentId,
      });
    expect(published.status).toBe(201);
    publishedId = published.body.id;

    const similar = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Similar Flat Nearby",
        price: "4800000.00",
        propertyType: "Apartment",
        addressLine: "22 Ring Road",
        city: "Bengaluru",
        bedrooms: 2,
        bathrooms: 2,
        areaSqFt: 1200,
        status: "published",
        agentId,
      });
    expect(similar.status).toBe(201);
    similarId = similar.body.id;

    const draft = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Draft Hidden",
        price: "1000000",
        propertyType: "Apartment",
        addressLine: "1 Hidden",
        city: "Bengaluru",
        status: "draft",
      });
    expect(draft.status).toBe(201);
    draftId = draft.body.id;

    const amenities = await request(app)
      .put(`/api/v1/properties/${publishedId}/amenities`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ amenities: ["Pool", "Gym"] });
    expect(amenities.status).toBe(200);

    await prisma.propertyImage.create({
      data: {
        propertyId: publishedId,
        url: "/uploads/properties/demo/photo/cover.jpg",
        kind: "photo",
        sortOrder: 0,
        caption: "Living room",
      },
    });
    await prisma.propertyImage.create({
      data: {
        propertyId: publishedId,
        url: "/uploads/properties/demo/floorplan/plan.jpg",
        kind: "floorplan",
        sortOrder: 1,
      },
    });
  });

  it("returns published detail with amenities, images, agent", async () => {
    const res = await request(app).get(`/api/v1/properties/${publishedId}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Published Detail Flat");
    expect(res.body.amenities).toEqual(expect.arrayContaining(["Pool", "Gym"]));
    expect(res.body.images).toHaveLength(2);
    expect(res.body.images[0].kind).toBe("photo");
    expect(res.body.agent).toMatchObject({ id: agentId, name: "Detail Agent" });
  });

  it("returns 404 envelope for draft as guest", async () => {
    const res = await request(app).get(`/api/v1/properties/${draftId}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("RESOURCE_NOT_FOUND");
  });

  it("lists similar published properties", async () => {
    const res = await request(app)
      .get(`/api/v1/properties/${publishedId}/similar`)
      .query({ page: 1, pageSize: 6 });
    expect(res.status).toBe(200);
    expect(res.body.data.some((p: { id: string }) => p.id === similarId)).toBe(true);
    expect(res.body.data.every((p: { id: string }) => p.id !== publishedId)).toBe(true);
    expect(res.body.meta.page).toBe(1);
  });

  it("returns 404 for similar on draft as guest", async () => {
    const res = await request(app).get(`/api/v1/properties/${draftId}/similar`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("RESOURCE_NOT_FOUND");
  });
});
