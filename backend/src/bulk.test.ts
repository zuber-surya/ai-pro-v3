import { describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "./app.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

async function cleanupUserEmail(email: string) {
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) return;
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  await prisma.bulkUploadSession.deleteMany({ where: { uploadedBy: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
}

async function login(email: string, password: string) {
  const res = await request(app).post("/api/v1/auth/token").send({ email, password });
  expect(res.status).toBe(200);
  return res.body.accessToken as string;
}

describe("Bulk property upload", () => {
  const password = "SecurePass1!";
  const stamp = Date.now();
  const adminEmail = `qa.bulk.admin.${stamp}@example.com`;
  const customerEmail = `qa.bulk.customer.${stamp}@example.com`;
  let adminToken = "";
  let sessionId = "";

  it("seeds users", async () => {
    await cleanupUserEmail(adminEmail);
    await cleanupUserEmail(customerEmail);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
        fullName: "Bulk Admin",
      },
    });
    await prisma.user.create({
      data: {
        email: customerEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "customer",
        fullName: "Bulk Customer",
      },
    });
    adminToken = await login(adminEmail, password);
  });

  it("rejects customer", async () => {
    const token = await login(customerEmail, password);
    const res = await request(app)
      .post("/api/v1/bulk/properties/validate")
      .set("Authorization", `Bearer ${token}`)
      .send({
        records: [
          {
            title: "X",
            price: "100",
            propertyType: "Apartment",
            bedrooms: 1,
            bathrooms: 1,
            areaSqFt: 500,
            addressLine: "1 St",
          },
        ],
      });
    expect(res.status).toBe(403);
  });

  it("validates mixed rows and persists errors", async () => {
    const res = await request(app)
      .post("/api/v1/bulk/properties/validate")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        fileName: "fixture.csv",
        records: [
          {
            title: "Valid One",
            price: "5000000",
            propertyType: "Apartment",
            bedrooms: 2,
            bathrooms: 2,
            areaSqFt: 1100,
            addressLine: "MG Road",
            city: "Bangalore",
            status: "draft",
          },
          {
            title: "Missing Price",
            propertyType: "Villa",
            bedrooms: 3,
            bathrooms: 2,
            areaSqFt: 1400,
            addressLine: "Whitefield",
          },
          {
            title: "Valid Two",
            priceAmount: "8500000",
            propertyType: "Villa",
            bedrooms: 2,
            bathrooms: 2,
            areaSqFt: 1400,
            addressLine: "Koramangala",
            city: "Bangalore",
            status: "DRAFT",
          },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.validCount).toBe(2);
    expect(res.body.errorCount).toBe(1);
    sessionId = res.body.sessionId;
  });

  it("returns session with error details", async () => {
    const res = await request(app)
      .get(`/api/v1/bulk/properties/sessions/${sessionId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("validated");
    expect(res.body.totalRows).toBe(3);
    expect(res.body.errors.some((e: { severity: string }) => e.severity === "error")).toBe(
      true,
    );
  });

  it("downloads error CSV", async () => {
    const res = await request(app)
      .get(`/api/v1/bulk/properties/sessions/${sessionId}/errors.csv`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(String(res.headers["content-type"])).toContain("text/csv");
    expect(res.text).toContain("rowNumber");
    expect(res.text).toContain("price");
  });

  it("imports valid rows only", async () => {
    const before = await prisma.property.count({ where: { title: { startsWith: "Valid " } } });
    const res = await request(app)
      .post(`/api/v1/bulk/properties/sessions/${sessionId}/import`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(202);
    expect(res.body.status).toBe("imported");
    const after = await prisma.property.count({
      where: { title: { in: ["Valid One", "Valid Two"] } },
    });
    expect(after).toBeGreaterThanOrEqual(before + 2);
  });
});
