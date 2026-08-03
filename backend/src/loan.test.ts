import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";
import {
  resetGeminiClientForTests,
  setGeminiClientForTests,
  type GeminiClient,
} from "./integrations/gemini/gemini.client.js";
import { resetRateLimitBucketsForTests } from "./middleware/rateLimit.js";
import { AppError } from "./middleware/errorHandler.js";
import { computeEmi } from "./services/loan.service.js";

const app = createApp();

describe("computeEmi", () => {
  it("computes known EMI ballpark", () => {
    const emi = computeEmi(8_000_000, 8.5, 20);
    expect(emi).toBeGreaterThan(60_000);
    expect(emi).toBeLessThan(80_000);
  });

  it("returns 0 for zero principal", () => {
    expect(computeEmi(0, 8.5, 20)).toBe(0);
  });
});

describe("AI loan analysis API", () => {
  afterEach(() => {
    resetGeminiClientForTests();
    resetRateLimitBucketsForTests();
  });

  it("returns Gemini analysis when available", async () => {
    const mock: GeminiClient = {
      async generateText() {
        return "";
      },
      async generateJson() {
        return {
          analysis: "Your stated income supports this EMI comfortably.",
          eligible: true,
        };
      },
    };
    setGeminiClientForTests(mock);

    const res = await request(app).post("/api/v1/ai/loan-analysis").send({
      propertyPrice: "10000000",
      downPayment: "2000000",
      annualIncome: "2400000",
      tenureYears: 20,
    });
    expect(res.status).toBe(200);
    expect(res.body.provider).toBe("gemini");
    expect(res.body.mode).toBe("ai");
    expect(res.body.estimatedEmi).toMatch(/^\d+\.\d{2}$/);
    expect(res.body.analysis).toMatch(/income|EMI|Informational/i);
    expect(res.body.eligible).toBe(true);
  });

  it("falls back to formula when Gemini fails", async () => {
    setGeminiClientForTests({
      async generateText() {
        return "";
      },
      async generateJson() {
        throw new AppError("AI_UNAVAILABLE", "down", 503);
      },
    });

    const res = await request(app).post("/api/v1/ai/loan-analysis").send({
      propertyPrice: "10000000",
      downPayment: "2000000",
      annualIncome: "2400000",
      tenureYears: 20,
      interestRatePct: 8.5,
    });
    expect(res.status).toBe(200);
    expect(res.body.mode).toBe("fallback");
    expect(res.body.analysis).toMatch(/Formula estimate|fallback/i);
    expect(Number(res.body.estimatedEmi)).toBeGreaterThan(0);
  });

  it("rejects invalid down payment", async () => {
    const res = await request(app).post("/api/v1/ai/loan-analysis").send({
      propertyPrice: "1000000",
      downPayment: "2000000",
      annualIncome: "1000000",
    });
    expect(res.status).toBe(422);
  });
});
