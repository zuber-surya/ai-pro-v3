import { describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "./app.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

async function cleanupUserEmail(email: string) {
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) return;
  await prisma.notification.deleteMany({ where: { userId: user.id } });
  const agent = await prisma.agent.findUnique({ where: { userId: user.id } });
  if (agent) {
    await prisma.lead.deleteMany({ where: { assigneeAgentId: agent.id } });
    await prisma.property.deleteMany({ where: { agentId: agent.id } });
    await prisma.agent.delete({ where: { id: agent.id } });
  }
  await prisma.lead.deleteMany({ where: { customerUserId: user.id } });
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
}

async function login(email: string, password: string) {
  const res = await request(app).post("/api/v1/auth/token").send({ email, password });
  expect(res.status).toBe(200);
  return res.body.accessToken as string;
}

describe("In-app notifications", () => {
  const password = "SecurePass1!";
  const stamp = Date.now();
  const agentEmail = `qa.ntf.agent.${stamp}@example.com`;
  const customerEmail = `qa.ntf.customer.${stamp}@example.com`;
  const adminEmail = `qa.ntf.admin.${stamp}@example.com`;
  let agentToken = "";
  let customerToken = "";
  let propertyId = "";
  let agentUserId = "";

  it("seeds agent-linked user + published property", async () => {
    await cleanupUserEmail(agentEmail);
    await cleanupUserEmail(customerEmail);
    await cleanupUserEmail(adminEmail);

    const agentUser = await prisma.user.create({
      data: {
        email: agentEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "agent",
        fullName: "Notify Agent",
      },
    });
    agentUserId = agentUser.id;

    await prisma.user.create({
      data: {
        email: customerEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "customer",
        fullName: "Notify Customer",
      },
    });

    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
        fullName: "Notify Admin",
      },
    });

    const agent = await prisma.agent.create({
      data: {
        userId: agentUser.id,
        name: "Notify Agent",
        email: agentEmail,
        phone: "+91 90000 22222",
      },
    });

    const adminToken = await login(adminEmail, password);
    const created = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Notify Lead Flat",
        price: "7100000",
        propertyType: "Apartment",
        addressLine: "9 Notify Road",
        city: "Bengaluru",
        bedrooms: 2,
        bathrooms: 2,
        areaSqFt: 1150,
        status: "published",
        agentId: agent.id,
      });
    expect(created.status).toBe(201);
    propertyId = created.body.id;

    agentToken = await login(agentEmail, password);
    customerToken = await login(customerEmail, password);
  });

  it("emits in-app notification to assignee agent on new lead", async () => {
    const res = await request(app)
      .post("/api/v1/leads")
      .set("Idempotency-Key", `idem-ntf-${stamp}`)
      .send({
        name: "Lead For Notify",
        email: `qa.ntf.lead.${stamp}@example.com`,
        source: "property_inquire",
        propertyId,
        message: "Please call me",
      });
    expect(res.status).toBe(201);

    const list = await request(app)
      .get("/api/v1/notifications")
      .set("Authorization", `Bearer ${agentToken}`);
    expect(list.status).toBe(200);
    expect(list.body.meta.unreadCount).toBeGreaterThanOrEqual(1);
    expect(list.body.data.some((n: { type: string }) => n.type === "new_lead")).toBe(true);
    expect(list.body.data[0].channel).toBe("in_app");
    expect(list.body.data[0].read).toBe(false);
  });

  it("marks one and all as read", async () => {
    const list = await request(app)
      .get("/api/v1/notifications")
      .set("Authorization", `Bearer ${agentToken}`);
    const id = list.body.data[0].id as string;

    const one = await request(app)
      .post(`/api/v1/notifications/${id}/read`)
      .set("Authorization", `Bearer ${agentToken}`);
    expect(one.status).toBe(200);
    expect(one.body.read).toBe(true);

    await prisma.notification.create({
      data: {
        userId: agentUserId,
        type: "new_lead",
        title: "Extra unread",
        body: "test",
      },
    });

    const all = await request(app)
      .post("/api/v1/notifications/read-all")
      .set("Authorization", `Bearer ${agentToken}`);
    expect(all.status).toBe(200);

    const after = await request(app)
      .get("/api/v1/notifications")
      .set("Authorization", `Bearer ${agentToken}`);
    expect(after.body.meta.unreadCount).toBe(0);
  });

  it("scopes list to own notifications only", async () => {
    const res = await request(app)
      .get("/api/v1/notifications")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(
      res.body.data.every((n: { title: string }) => n.title !== "New lead received"),
    ).toBe(true);
  });

  it("cleanup", async () => {
    await cleanupUserEmail(agentEmail);
    await cleanupUserEmail(customerEmail);
    await cleanupUserEmail(adminEmail);
  });
});
