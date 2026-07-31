import { describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "./app.js";
import { prisma } from "./lib/prisma.js";
import { assertValidImageUpload } from "./integrations/storage/local.storage.js";
import { AppError } from "./middleware/errorHandler.js";

const app = createApp();

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function cleanupUserEmail(email: string) {
  const user = await prisma.user.findFirst({ where: { email } });
  if (user) {
    const props = await prisma.property.findMany({
      where: { OR: [{ title: { contains: "Media QA" } }] },
    });
    for (const p of props) {
      await prisma.propertyImage.deleteMany({ where: { propertyId: p.id } });
      await prisma.property.delete({ where: { id: p.id } });
    }
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }
}

describe("property image validation", () => {
  it("rejects non-image mime", () => {
    expect(() =>
      assertValidImageUpload({
        mimetype: "video/mp4",
        size: 100,
        buffer: Buffer.from("x"),
      }),
    ).toThrow(AppError);
  });
});

describe("Property media upload", () => {
  const password = "SecurePass1!";
  const adminEmail = `qa.media.admin.${Date.now()}@example.com`;
  let adminToken = "";
  let propertyId = "";
  let imageId = "";

  it("seeds admin + property", async () => {
    await cleanupUserEmail(adminEmail);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
        fullName: "Media Admin",
      },
    });
    const login = await request(app).post("/api/v1/auth/token").send({
      email: adminEmail,
      password,
    });
    adminToken = login.body.accessToken;

    const created = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Media QA Home",
        price: "2000000",
        propertyType: "Apartment",
        addressLine: "9 Media St",
        city: "Goa",
        bedrooms: 1,
        bathrooms: 1,
        areaSqFt: 600,
      });
    expect(created.status).toBe(201);
    propertyId = created.body.id;
  });

  it("rejects pdf upload", async () => {
    const res = await request(app)
      .post(`/api/v1/properties/${propertyId}/images`)
      .set("Authorization", `Bearer ${adminToken}`)
      .field("kind", "photo")
      .attach("file", Buffer.from("%PDF"), {
        filename: "x.pdf",
        contentType: "application/pdf",
      });
    expect(res.status).toBe(422);
  });

  it("rejects oversized upload", async () => {
    const big = Buffer.alloc(2 * 1024 * 1024 + 20, 1);
    const res = await request(app)
      .post(`/api/v1/properties/${propertyId}/images`)
      .set("Authorization", `Bearer ${adminToken}`)
      .field("kind", "photo")
      .attach("file", big, { filename: "big.png", contentType: "image/png" });
    expect(res.status).toBe(422);
  });

  it("uploads photo", async () => {
    const res = await request(app)
      .post(`/api/v1/properties/${propertyId}/images`)
      .set("Authorization", `Bearer ${adminToken}`)
      .field("kind", "photo")
      .field("caption", "Living room")
      .attach("file", PNG, { filename: "dot.png", contentType: "image/png" });
    expect(res.status).toBe(201);
    expect(res.body.kind).toBe("photo");
    expect(res.body.url).toMatch(/^\/uploads\/properties\//);
    imageId = res.body.id;
  });

  it("uploads floorplan", async () => {
    const res = await request(app)
      .post(`/api/v1/properties/${propertyId}/images`)
      .set("Authorization", `Bearer ${adminToken}`)
      .field("kind", "floorplan")
      .attach("file", PNG, { filename: "plan.png", contentType: "image/png" });
    expect(res.status).toBe(201);
    expect(res.body.kind).toBe("floorplan");
  });

  it("lists images", async () => {
    const res = await request(app)
      .get(`/api/v1/properties/${propertyId}/images`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it("deletes image", async () => {
    const res = await request(app)
      .delete(`/api/v1/properties/${propertyId}/images/${imageId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});
