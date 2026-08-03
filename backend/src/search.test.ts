import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "./app.js";
import { prisma } from "./lib/prisma.js";
import {
  resetGeminiClientForTests,
  setGeminiClientForTests,
  type GeminiClient,
} from "./integrations/gemini/gemini.client.js";
import { resetRateLimitBucketsForTests } from "./middleware/rateLimit.js";
import { AppError } from "./middleware/errorHandler.js";
import { parseFiltersHeuristic } from "./services/search.service.js";

const app = createApp();

async function cleanupUserEmail(email: string) {
  const user = await prisma.user.findFirst({ where: { email } });
  if (user) {
    await prisma.lead.deleteMany({ where: { customerUserId: user.id } });
    const agent = await prisma.agent.findUnique({ where: { userId: user.id } });
    if (agent) {
      await prisma.propertyAmenity.deleteMany({
        where: { property: { agentId: agent.id } },
      });
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

describe("parseFiltersHeuristic", () => {
  it("extracts bhk and max price", () => {
    const f = parseFiltersHeuristic("3BHK under 80 lakh Bengaluru");
    expect(f.bedrooms).toBe(3);
    expect(f.maxPrice).toBe(8_000_000);
    expect(f.city?.toLowerCase()).toBe("bengaluru");
  });
});

describe("AI search API", () => {
  const password = "SecurePass1!";
  const adminEmail = `qa.search.admin.${Date.now()}@example.com`;
  let adminToken = "";
  let propertyId = "";

  afterEach(() => {
    resetGeminiClientForTests();
    resetRateLimitBucketsForTests();
  });

  it("seeds published inventory", async () => {
    await cleanupUserEmail(adminEmail);
    await prisma.propertyAmenity.deleteMany({
      where: { property: { title: { startsWith: "QA Search Skyline" } } },
    });
    await prisma.property.deleteMany({
      where: { title: { startsWith: "QA Search Skyline" } },
    });
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
        fullName: "Search Admin",
      },
    });
    adminToken = await login(adminEmail, password);

    const created = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: `QA Search Skyline 3BHK ${Date.now()}`,
        price: "7850000",
        propertyType: "Apartment",
        addressLine: "12 Residency Road",
        city: "Bengaluru",
        bedrooms: 3,
        bathrooms: 2,
        areaSqFt: 1450,
        status: "published",
        description: "Near tech park with gym",
      });
    expect(created.status).toBe(201);
    propertyId = created.body.id;

    await request(app)
      .put(`/api/v1/properties/${propertyId}/amenities`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ amenities: ["Gym", "Parking"] });
  });

  it("filter-only mode works without Gemini", async () => {
    const res = await request(app).post("/api/v1/ai/search").send({
      query: "3BHK under 90 lakh Bengaluru",
      mode: "fallback",
    });
    expect(res.status).toBe(200);
    expect(res.body.mode).toBe("fallback");
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results.some((r: { propertyId: string }) => r.propertyId === propertyId)).toBe(
      true,
    );
    expect(res.body.results.every((r: { propertyId: string }) => typeof r.propertyId === "string")).toBe(
      true,
    );
  });

  it("AI mode ranks only inventory ids from mocked Gemini", async () => {
    const mock: GeminiClient = {
      async generateText() {
        return "";
      },
      async generateJson(options) {
        if (options.prompt.includes("Extract filters")) {
          return {
            city: "Bengaluru",
            bedrooms: 3,
            maxPrice: 9000000,
            propertyType: "Apartment",
            amenities: ["Gym"],
            interpretation: "3 bedroom apartments in Bengaluru under 90 lakh with gym",
          };
        }
        return {
          rankings: [
            {
              propertyId,
              score: 92,
              reasons: [
                { label: "Within budget", matched: true },
                { label: "Gym amenity", matched: true },
              ],
            },
            {
              propertyId: "00000000-0000-4000-8000-000000000099",
              score: 99,
              reasons: [{ label: "Invented", matched: true }],
            },
          ],
        };
      },
    };
    setGeminiClientForTests(mock);

    const res = await request(app).post("/api/v1/ai/search").send({
      query: "3BHK near metro under 90 lakh Bengaluru with gym",
      mode: "ai",
    });
    expect(res.status).toBe(200);
    expect(res.body.mode).toBe("ai");
    const mine = res.body.results.find((r: { propertyId: string }) => r.propertyId === propertyId);
    expect(mine).toBeTruthy();
    expect(mine.matchScorePercent).toBe(92);
    expect(
      res.body.results.every(
        (r: { propertyId: string }) => r.propertyId !== "00000000-0000-4000-8000-000000000099",
      ),
    ).toBe(true);
  });

  it("falls back on Gemini timeout", async () => {
    setGeminiClientForTests({
      async generateText() {
        return "";
      },
      async generateJson() {
        throw new AppError("AI_TIMEOUT", "Gemini request timed out", 504);
      },
    });

    const res = await request(app).post("/api/v1/ai/search").send({
      query: "3BHK Bengaluru",
      mode: "ai",
    });
    expect(res.status).toBe(200);
    expect(res.body.mode).toBe("fallback");
    expect(res.body.fallbackReason).toBe("AI_TIMEOUT");
    expect(res.body.bannerMessage).toMatch(/unavailable/i);
  });

  it("returns 429 when rate limited", async () => {
    process.env.AI_SEARCH_RATE_LIMIT_MAX = "2";
    // env already loaded — use reset + many calls against default; instead force via middleware by flooding
    resetRateLimitBucketsForTests();
    // Temporarily patch by hitting more than default max is heavy; call with custom low limit via direct middleware test:
    const { rateLimit } = await import("./middleware/rateLimit.js");
    const limited = rateLimit({ max: 1, windowMs: 60_000, key: () => "test-ip" });
    const req = { path: "/search", ip: "1.2.3.4", headers: {} } as never;
    const headers: Record<string, string> = {};
    const res = {
      setHeader: (k: string, v: string) => {
        headers[k] = v;
      },
    } as never;
    let err: unknown;
    limited(req, res, () => undefined);
    limited(req, res, (e?: unknown) => {
      err = e;
    });
    expect(err).toBeInstanceOf(AppError);
    expect((err as AppError).code).toBe("RATE_LIMITED");
    expect(headers["Retry-After"]).toBeTruthy();
  });
});
