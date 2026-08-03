import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "./app.js";
import {
  resetGeminiClientForTests,
  setGeminiClientForTests,
  type GeminiClient,
} from "./integrations/gemini/gemini.client.js";
import { prisma } from "./lib/prisma.js";
import { resetRateLimitBucketsForTests } from "./middleware/rateLimit.js";

const app = createApp();

async function cleanupUserEmail(email: string) {
  const user = await prisma.user.findFirst({ where: { email } });
  if (user) {
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }
}

async function login(email: string, password: string) {
  const res = await request(app).post("/api/v1/auth/token").send({ email, password });
  expect(res.status).toBe(200);
  return res.body.accessToken as string;
}

describe("AI config admin API", () => {
  const password = "SecurePass1!";
  const adminEmail = `qa.aiconfig.admin.${Date.now()}@example.com`;
  const customerEmail = `qa.aiconfig.customer.${Date.now()}@example.com`;
  let adminToken = "";
  let customerToken = "";

  afterEach(() => {
    resetGeminiClientForTests();
    resetRateLimitBucketsForTests();
  });

  it("seeds admin and customer", async () => {
    await cleanupUserEmail(adminEmail);
    await cleanupUserEmail(customerEmail);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
        fullName: "AI Config Admin",
      },
    });
    await prisma.user.create({
      data: {
        email: customerEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "customer",
        fullName: "AI Config Customer",
      },
    });
    adminToken = await login(adminEmail, password);
    customerToken = await login(customerEmail, password);
  });

  it("forbids customer from GET/PUT", async () => {
    const getRes = await request(app)
      .get("/api/v1/ai/config")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(getRes.status).toBe(403);

    const putRes = await request(app)
      .put("/api/v1/ai/config")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        greeting: "Nope",
        faqs: [],
        escalation: { failedResponseThreshold: 3, onExplicitHumanRequest: true },
      });
    expect(putRes.status).toBe(403);
  });

  it("admin can get and update config", async () => {
    const getRes = await request(app)
      .get("/api/v1/ai/config")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.provider).toBe("gemini");
    expect(getRes.body.greeting).toBeTruthy();
    expect(Array.isArray(getRes.body.faqs)).toBe(true);

    const greeting = `Configured greeting ${Date.now()}`;
    const putRes = await request(app)
      .put("/api/v1/ai/config")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        greeting,
        faqs: [{ q: "Fees?", a: "No buyer commission for listed offers." }],
        escalation: {
          failedResponseThreshold: 4,
          onExplicitHumanRequest: true,
          email: "agents@example.com",
        },
        tone: "professional",
        systemPrompt: "You are a professional PropVista assistant.",
        modelLabel: "gemini",
        provider: "gemini",
      });
    expect(putRes.status).toBe(200);
    expect(putRes.body.greeting).toBe(greeting);
    expect(putRes.body.faqs).toHaveLength(1);
    expect(putRes.body.escalation.failedResponseThreshold).toBe(4);
    expect(putRes.body.tone).toBe("professional");
    expect(putRes.body.provider).toBe("gemini");

    const greetingRes = await request(app).get("/api/v1/ai/chat/greeting");
    expect(greetingRes.status).toBe(200);
    expect(greetingRes.body.greeting).toBe(greeting);
  });

  it("rejects non-gemini model label", async () => {
    const res = await request(app)
      .put("/api/v1/ai/config")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        greeting: "Hello",
        faqs: [],
        escalation: { failedResponseThreshold: 3, onExplicitHumanRequest: true },
        modelLabel: "openai",
      });
    expect(res.status).toBe(422);
  });

  it("preview uses config override", async () => {
    const mock: GeminiClient = {
      async generateJson() {
        throw new Error("not used");
      },
      async generateText({ system }) {
        expect(system).toMatch(/preview greeting/i);
        return "Preview reply from Gemini";
      },
    };
    setGeminiClientForTests(mock);

    const res = await request(app)
      .post("/api/v1/ai/config/preview")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        prompt: "Hello",
        config: { greeting: "Preview greeting for test" },
      });
    expect(res.status).toBe(200);
    expect(res.body.provider).toBe("gemini");
    expect(res.body.output).toMatch(/Preview reply/i);
  });

  it("cleanup users", async () => {
    await cleanupUserEmail(adminEmail);
    await cleanupUserEmail(customerEmail);
  });
});
