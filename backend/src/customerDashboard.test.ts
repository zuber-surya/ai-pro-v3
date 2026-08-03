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
    await prisma.savedSearch.deleteMany({ where: { userId: user.id } });
    await prisma.customerProfile.deleteMany({ where: { userId: user.id } });
    await prisma.lead.deleteMany({
      where: { OR: [{ customerUserId: user.id }, { email: user.email }] },
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

describe("Customer dashboard", () => {
  const password = "SecurePass1!";
  const customerEmail = `qa.cus.dash.${Date.now()}@example.com`;
  const adminEmail = `qa.cus.admin.${Date.now()}@example.com`;
  let customerToken = "";
  let adminToken = "";
  let propertyId = "";

  it("seeds users and property", async () => {
    await cleanupUserEmail(customerEmail);
    await cleanupUserEmail(adminEmail);

    await prisma.user.create({
      data: {
        email: customerEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "customer",
        fullName: "Sarah Customer",
      },
    });
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
        fullName: "Dash Admin",
      },
    });
    customerToken = await login(customerEmail, password);
    adminToken = await login(adminEmail, password);

    const prop = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Dash Favorite Flat",
        price: "9000000",
        propertyType: "Apartment",
        addressLine: "1 Dash Road",
        city: "Bengaluru",
        bedrooms: 3,
        bathrooms: 2,
        areaSqFt: 1400,
        status: "published",
      });
    expect(prop.status).toBe(201);
    propertyId = prop.body.id;
  });

  it("updates requirement profile and returns dashboard stats", async () => {
    const profile = await request(app)
      .put("/api/v1/customer/profile")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        fullName: "Sarah Customer",
        preferences: {
          budgetMin: "5000000",
          budgetMax: "12000000",
          propertyTypes: ["Apartment"],
          bedsMin: 3,
          locations: ["Bengaluru"],
        },
      });
    expect(profile.status).toBe(200);
    expect(profile.body.preferences.completionPct).toBe(100);
    expect(profile.body.preferences.bedsMin).toBe(3);

    await request(app)
      .post("/api/v1/favorites")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ propertyId });

    await request(app)
      .post("/api/v1/leads")
      .set("Idempotency-Key", `cus-dash-${Date.now()}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        name: "Sarah Customer",
        email: customerEmail,
        source: "property_inquire",
        propertyId,
        message: "Interested",
      });

    const dash = await request(app)
      .get("/api/v1/customer/dashboard")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(dash.status).toBe(200);
    expect(dash.body.favoritesCount).toBeGreaterThanOrEqual(1);
    expect(dash.body.inquiriesCount).toBeGreaterThanOrEqual(1);
    expect(dash.body.welcomeName).toBe("Sarah");
    expect(Array.isArray(dash.body.recentProperties)).toBe(true);

    const inquiries = await request(app)
      .get("/api/v1/customer/inquiries")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(inquiries.status).toBe(200);
    expect(inquiries.body.data.length).toBeGreaterThanOrEqual(1);
    expect(inquiries.body.data[0].status).toBeTruthy();
  });

  it("forbids admin from customer dashboard", async () => {
    const res = await request(app)
      .get("/api/v1/customer/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(403);
  });

  it("cleanup", async () => {
    if (propertyId) {
      await prisma.favorite.deleteMany({ where: { propertyId } });
      await prisma.lead.deleteMany({ where: { propertyId } });
      await prisma.property.deleteMany({ where: { id: propertyId } });
    }
    await cleanupUserEmail(customerEmail);
    await cleanupUserEmail(adminEmail);
  });
});
