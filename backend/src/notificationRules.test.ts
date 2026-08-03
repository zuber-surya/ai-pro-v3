import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "./app.js";
import {
  getEmailOutboxForTests,
  resetEmailClientForTests,
} from "./integrations/email/email.client.js";
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
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
}

async function login(email: string, password: string) {
  const res = await request(app).post("/api/v1/auth/token").send({ email, password });
  expect(res.status).toBe(200);
  return res.body.accessToken as string;
}

describe("Notification rules + email", () => {
  const password = "SecurePass1!";
  const stamp = Date.now();
  const adminEmail = `qa.rules.admin.${stamp}@example.com`;
  const agentEmail = `qa.rules.agent.${stamp}@example.com`;
  const customerEmail = `qa.rules.customer.${stamp}@example.com`;
  let adminToken = "";
  let agentToken = "";
  let propertyId = "";
  let ruleId = "";

  afterEach(() => {
    resetEmailClientForTests();
  });

  it("seeds users and property", async () => {
    await cleanupUserEmail(adminEmail);
    await cleanupUserEmail(agentEmail);
    await cleanupUserEmail(customerEmail);

    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
        fullName: "Rules Admin",
      },
    });
    const agentUser = await prisma.user.create({
      data: {
        email: agentEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "agent",
        fullName: "Rules Agent",
      },
    });
    await prisma.user.create({
      data: {
        email: customerEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "customer",
        fullName: "Rules Customer",
      },
    });

    const agent = await prisma.agent.create({
      data: {
        userId: agentUser.id,
        name: "Rules Agent",
        email: agentEmail,
      },
    });

    adminToken = await login(adminEmail, password);
    agentToken = await login(agentEmail, password);

    const created = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Rules Lead Flat",
        price: "8000000",
        propertyType: "Apartment",
        addressLine: "1 Rules Ave",
        city: "Bengaluru",
        bedrooms: 3,
        bathrooms: 2,
        areaSqFt: 1400,
        status: "published",
        agentId: agent.id,
      });
    expect(created.status).toBe(201);
    propertyId = created.body.id;
  });

  it("forbids customer from rules API", async () => {
    const customerToken = await login(customerEmail, password);
    const res = await request(app)
      .get("/api/v1/notification-rules")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });

  it("admin lists seeded rules and rejects sms channel", async () => {
    const list = await request(app)
      .get("/api/v1/notification-rules")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(list.status).toBe(200);
    expect(list.body.data.length).toBeGreaterThanOrEqual(1);
    const newLead = list.body.data.find((r: { event: string }) => r.event === "new_lead");
    expect(newLead).toBeTruthy();
    expect(newLead.channels).toEqual(expect.arrayContaining(["email", "in_app"]));
    expect(newLead.enabled).toBe(true);
    ruleId = newLead.id;

    const bad = await request(app)
      .patch(`/api/v1/notification-rules/${ruleId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ channels: ["sms"] });
    expect(bad.status).toBe(422);
  });

  it("sends catcher email + in-app when rules enabled", async () => {
    resetEmailClientForTests();
    const res = await request(app)
      .post("/api/v1/leads")
      .set("Idempotency-Key", `idem-rules-email-${stamp}`)
      .send({
        name: "Email Lead",
        email: `qa.rules.lead.${stamp}@example.com`,
        source: "property_inquire",
        propertyId,
      });
    expect(res.status).toBe(201);

    const outbox = getEmailOutboxForTests();
    expect(outbox.length).toBeGreaterThanOrEqual(1);
    expect(outbox.some((m) => m.subject.includes("New lead"))).toBe(true);
    expect(outbox[0]?.transport).toBe("catcher");

    const ntf = await request(app)
      .get("/api/v1/notifications")
      .set("Authorization", `Bearer ${agentToken}`);
    expect(ntf.body.data.some((n: { type: string }) => n.type === "new_lead")).toBe(true);
  });

  it("disabling email channel skips email but keeps in-app", async () => {
    resetEmailClientForTests();
    const patch = await request(app)
      .patch(`/api/v1/notification-rules/${ruleId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ channels: ["in_app"], enabled: true });
    expect(patch.status).toBe(200);
    expect(patch.body.channels).toEqual(["in_app"]);

    const before = getEmailOutboxForTests().length;
    const res = await request(app)
      .post("/api/v1/leads")
      .set("Idempotency-Key", `idem-rules-inapp-only-${stamp}`)
      .send({
        name: "InApp Only Lead",
        email: `qa.rules.lead2.${stamp}@example.com`,
        source: "property_inquire",
        propertyId,
      });
    expect(res.status).toBe(201);
    expect(getEmailOutboxForTests().length).toBe(before);

    // restore both channels for later suites
    await request(app)
      .patch(`/api/v1/notification-rules/${ruleId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ channels: ["email", "in_app"], enabled: true });
  });

  it("cleanup", async () => {
    await cleanupUserEmail(adminEmail);
    await cleanupUserEmail(agentEmail);
    await cleanupUserEmail(customerEmail);
  });
});
