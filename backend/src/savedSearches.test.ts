import { describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "./app.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

async function cleanupUserEmail(email: string) {
  const user = await prisma.user.findFirst({ where: { email } });
  if (user) {
    await prisma.savedSearch.deleteMany({ where: { userId: user.id } });
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }
}

async function login(email: string, password: string) {
  const res = await request(app).post("/api/v1/auth/token").send({ email, password });
  expect(res.status).toBe(200);
  return res.body.accessToken as string;
}

describe("Saved searches", () => {
  const password = "SecurePass1!";
  const customerEmail = `qa.saved.customer.${Date.now()}@example.com`;
  const adminEmail = `qa.saved.admin.${Date.now()}@example.com`;
  let customerToken = "";
  let adminToken = "";
  let savedId = "";

  it("seeds customer and admin", async () => {
    await cleanupUserEmail(customerEmail);
    await cleanupUserEmail(adminEmail);

    await prisma.user.create({
      data: {
        email: customerEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "customer",
        fullName: "Saved Search Customer",
      },
    });
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
        fullName: "Saved Search Admin",
      },
    });
    customerToken = await login(customerEmail, password);
    adminToken = await login(adminEmail, password);
  });

  it("forbids non-customer create", async () => {
    const res = await request(app)
      .post("/api/v1/customer/saved-searches")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Admin try",
        criteria: { query: "3BHK" },
      });
    expect(res.status).toBe(403);
  });

  it("creates lists and deletes saved search", async () => {
    const created = await request(app)
      .post("/api/v1/customer/saved-searches")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        name: "Indiranagar 3BHK",
        criteria: {
          query: "3BHK near Indiranagar",
          mode: "ai",
          filters: { bedrooms: 3, maxPrice: "8000000" },
        },
        notifyVia: "email",
      });
    expect(created.status).toBe(201);
    expect(created.body.name).toBe("Indiranagar 3BHK");
    expect(created.body.criteria.query).toBe("3BHK near Indiranagar");
    expect(created.body.notifyVia).toBe("email");
    savedId = created.body.id;

    const list = await request(app)
      .get("/api/v1/customer/saved-searches")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(list.status).toBe(200);
    expect(list.body.data.some((s: { id: string }) => s.id === savedId)).toBe(true);

    const del = await request(app)
      .delete(`/api/v1/customer/saved-searches/${savedId}`)
      .set("Authorization", `Bearer ${customerToken}`);
    expect(del.status).toBe(204);

    const list2 = await request(app)
      .get("/api/v1/customer/saved-searches")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(list2.body.data.some((s: { id: string }) => s.id === savedId)).toBe(false);
  });

  it("cleanup", async () => {
    await cleanupUserEmail(customerEmail);
    await cleanupUserEmail(adminEmail);
  });
});
