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
      await prisma.nearbyLandmark.deleteMany({
        where: { property: { agentId: agent.id } },
      });
      await prisma.propertyImage.deleteMany({
        where: { property: { agentId: agent.id } },
      });
      await prisma.propertyAmenity.deleteMany({
        where: { property: { agentId: agent.id } },
      });
      await prisma.property.deleteMany({ where: { agentId: agent.id } });
      await prisma.agent.delete({ where: { id: agent.id } });
    }
    await prisma.property.deleteMany({
      where: {
        agentId: null,
        title: { contains: "Map QA" },
      },
    });
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }
}

async function login(email: string, password: string) {
  const res = await request(app).post("/api/v1/auth/token").send({ email, password });
  expect(res.status).toBe(200);
  return res.body.accessToken as string;
}

describe("Property landmarks & map payload", () => {
  const password = "SecurePass1!";
  const adminEmail = `qa.map.admin.${Date.now()}@example.com`;
  let adminToken = "";
  let propertyId = "";

  it("seeds property with coords", async () => {
    await cleanupUserEmail(adminEmail);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
        fullName: "Map Admin",
      },
    });
    adminToken = await login(adminEmail, password);

    const created = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Map QA Flagship",
        price: "7500000",
        propertyType: "Apartment",
        addressLine: "MG Road",
        city: "Bengaluru",
        bedrooms: 3,
        bathrooms: 2,
        areaSqFt: 1400,
        status: "published",
      });
    expect(created.status).toBe(201);
    propertyId = created.body.id;

    const patched = await request(app)
      .patch(`/api/v1/properties/${propertyId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ lat: 12.9716, lng: 77.5946 });
    expect(patched.status).toBe(200);
    expect(patched.body.lat).toBeCloseTo(12.9716);
  });

  it("replaces landmarks and returns them on detail", async () => {
    const put = await request(app)
      .put(`/api/v1/properties/${propertyId}/landmarks`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        landmarks: [
          {
            name: "Cubbon Park",
            category: "Parks",
            distanceM: 800,
            lat: 12.9763,
            lng: 77.5929,
          },
          { name: "Metro Station", category: "Transit", distanceM: 450 },
          "Local School",
        ],
      });
    expect(put.status).toBe(200);
    expect(put.body.landmarks).toHaveLength(3);

    const detail = await request(app).get(`/api/v1/properties/${propertyId}`);
    expect(detail.status).toBe(200);
    expect(detail.body.lat).toBeCloseTo(12.9716);
    expect(detail.body.lng).toBeCloseTo(77.5946);
    expect(detail.body.landmarks.some((l: { name: string }) => l.name === "Cubbon Park")).toBe(
      true,
    );
    expect(
      detail.body.landmarks.find((l: { name: string }) => l.name === "Cubbon Park").lat,
    ).toBeCloseTo(12.9763);
  });
});
