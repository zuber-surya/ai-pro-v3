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

const app = createApp();

describe("AI chat API", () => {
  afterEach(() => {
    resetGeminiClientForTests();
    resetRateLimitBucketsForTests();
  });

  it("returns greeting without auth", async () => {
    const res = await request(app).get("/api/v1/ai/chat/greeting");
    expect(res.status).toBe(200);
    expect(res.body.greeting).toBeTruthy();
    expect(res.body.provider).toBe("gemini");
  });

  it("rounds trip chat with mocked Gemini", async () => {
    const mock: GeminiClient = {
      async generateJson() {
        throw new Error("not used");
      },
      async generateText() {
        return "Home loans typically need KYC, income proof, and property documents.";
      },
    };
    setGeminiClientForTests(mock);

    const res = await request(app)
      .post("/api/v1/ai/chat")
      .send({ message: "What documents for a home loan?" });
    expect(res.status).toBe(200);
    expect(res.body.provider).toBe("gemini");
    expect(res.body.reply).toMatch(/KYC|documents/i);
    expect(res.body.sessionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it("degrades when Gemini unavailable", async () => {
    const mock: GeminiClient = {
      async generateJson() {
        throw new Error("not used");
      },
      async generateText() {
        throw new AppError("AI_UNAVAILABLE", "down", 503);
      },
    };
    setGeminiClientForTests(mock);

    const res = await request(app)
      .post("/api/v1/ai/chat")
      .send({ message: "Find 3BHK near metro" });
    expect(res.status).toBe(200);
    expect(res.body.provider).toBe("gemini");
    expect(res.body.reply).toBeTruthy();
    expect(res.body.degraded).toBe(true);
  });

  it("validates empty message", async () => {
    const res = await request(app).post("/api/v1/ai/chat").send({ message: "" });
    expect(res.status).toBe(422);
  });
});
