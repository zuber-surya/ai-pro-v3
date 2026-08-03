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
  await prisma.user.delete({ where: { id: user.id } });
}

async function login(email: string, password: string) {
  const res = await request(app).post("/api/v1/auth/token").send({ email, password });
  expect(res.status).toBe(200);
  return res.body.accessToken as string;
}

describe("Metrics command center", () => {
  const password = "SecurePass1!";
  const stamp = Date.now();
  const adminEmail = `qa.metrics.admin.${stamp}@example.com`;
  const customerEmail = `qa.metrics.customer.${stamp}@example.com`;
  let adminToken = "";

  it("seeds users", async () => {
    await cleanupUserEmail(adminEmail);
    await cleanupUserEmail(customerEmail);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
        fullName: "Metrics Admin",
      },
    });
    await prisma.user.create({
      data: {
        email: customerEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "customer",
        fullName: "Metrics Customer",
      },
    });
    adminToken = await login(adminEmail, password);
  });

  it("rejects customer from dashboard", async () => {
    const token = await login(customerEmail, password);
    const res = await request(app)
      .get("/api/v1/metrics/dashboard")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("returns KPIs charts and activity for admin", async () => {
    const res = await request(app)
      .get("/api/v1/metrics/dashboard")
      .query({ from: "2026-07-01", to: "2026-08-03", activityType: "all" })
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.kpis.activeListings).toBeTruthy();
    expect(res.body.kpis.activeLeads).toBeTruthy();
    expect(res.body.kpis.conversionRate).toBeTruthy();
    expect(res.body.kpis.sessions).toBeTruthy();
    expect(Array.isArray(res.body.charts.leadSources)).toBe(true);
    expect(Array.isArray(res.body.charts.viewsOverTime)).toBe(true);
    expect(Array.isArray(res.body.charts.stageDistribution)).toBe(true);
    expect(Array.isArray(res.body.activity)).toBe(true);
    expect(res.body.range.from).toBe("2026-07-01");
    expect(Array.isArray(res.body.agentLeaderboard)).toBe(true);
  });

  it("filters activity by type", async () => {
    const res = await request(app)
      .get("/api/v1/metrics/dashboard")
      .query({ activityType: "lead" })
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.activity.every((a: { type: string }) => a.type === "lead")).toBe(true);
  });

  it("admin can load reports summary", async () => {
    const res = await request(app)
      .get("/api/v1/metrics/reports")
      .query({ reportType: "summary" })
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.reportType).toBe("summary");
    expect(res.body.data.kpis).toBeTruthy();
  });
});
