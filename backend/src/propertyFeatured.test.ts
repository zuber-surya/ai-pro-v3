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

describe("GET /properties/featured", () => {
  const password = "SecurePass1!";
  const adminEmail = `qa.featured.admin.${Date.now()}@example.com`;

  it("returns only published featured properties without auth", async () => {
    await cleanupUserEmail(adminEmail);

    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
        fullName: "Featured Admin",
      },
    });
    const token = await login(adminEmail, password);

    const featured = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Featured Home",
        price: "8000000",
        propertyType: "Apartment",
        addressLine: "1 MG Road",
        city: "Bengaluru",
        bedrooms: 3,
        bathrooms: 2,
        areaSqFt: 1600,
        status: "published",
        featured: true,
      });
    expect(featured.status).toBe(201);

    const plain = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Plain Home",
        price: "5000000",
        propertyType: "Apartment",
        addressLine: "2 MG Road",
        city: "Bengaluru",
        bedrooms: 2,
        bathrooms: 1,
        areaSqFt: 1100,
        status: "published",
        featured: false,
      });
    expect(plain.status).toBe(201);

    const res = await request(app).get("/api/v1/properties/featured");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toMatchObject({ page: 1 });
    const ids = (res.body.data as Array<{ id: string; featured: boolean }>).map((p) => p.id);
    expect(ids).toContain(featured.body.id);
    expect(ids).not.toContain(plain.body.id);
    expect(
      (res.body.data as Array<{ featured: boolean }>).every((p) => p.featured === true),
    ).toBe(true);

    await cleanupUserEmail(adminEmail);
  });
});
