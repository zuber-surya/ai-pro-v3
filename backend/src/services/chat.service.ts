import { randomUUID } from "crypto";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import { getGeminiClient } from "../integrations/gemini/gemini.client.js";
import type { AiChatRequest } from "../validators/chat.validators.js";
import { AI_CONFIG_DEFAULT_SYSTEM, aiConfigService } from "./aiConfig.service.js";

function fallbackReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("loan") || lower.includes("emi") || lower.includes("mortgage")) {
    return "For home loans, gather income proof, ID, and property papers. Use PropVista search to shortlist homes, then ask an agent about lender options.";
  }
  if (lower.includes("search") || lower.includes("bhk") || lower.includes("find")) {
    return "Try the AI search bar with plain English — for example “3BHK under 80 lakhs near metro”. You can also open /search and refine filters.";
  }
  return "I'm having trouble reaching the AI service right now. Please try again shortly, or use AI search on the homepage to explore listings.";
}

function toneInstruction(tone: string | null | undefined): string {
  switch (tone) {
    case "professional":
      return "Tone: professional and concise.";
    case "concise":
      return "Tone: very concise; prefer short answers.";
    case "friendly":
    default:
      return "Tone: friendly and helpful.";
  }
}

export const chatService = {
  async greeting() {
    try {
      const config = await aiConfigService.get();
      return {
        greeting: config.greeting || env.AI_CHAT_GREETING,
        provider: "gemini" as const,
      };
    } catch {
      return {
        greeting: env.AI_CHAT_GREETING,
        provider: "gemini" as const,
      };
    }
  },

  async chat(input: AiChatRequest) {
    const sessionId = input.sessionId ?? randomUUID();
    const history = input.context?.history ?? [];
    const historyBlock = history
      .map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`)
      .join("\n");

    let system = AI_CONFIG_DEFAULT_SYSTEM;
    let faqBlock = "";
    try {
      const config = await aiConfigService.get();
      system = [config.systemPrompt || AI_CONFIG_DEFAULT_SYSTEM, toneInstruction(config.tone)]
        .filter(Boolean)
        .join("\n\n");
      if (config.faqs.length > 0) {
        faqBlock = `Known FAQs:\n${config.faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n")}`;
      }
    } catch {
      /* use defaults */
    }

    const prompt = [
      faqBlock,
      historyBlock ? `Conversation so far:\n${historyBlock}\n` : "",
      `User: ${input.message.trim()}`,
      "Assistant:",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const reply = await getGeminiClient().generateText({
        system,
        prompt,
        timeoutMs: env.AI_CHAT_TIMEOUT_MS,
      });
      return {
        reply,
        sessionId,
        provider: "gemini" as const,
      };
    } catch (err) {
      if (err instanceof AppError && (err.code === "AI_UNAVAILABLE" || err.code === "AI_TIMEOUT")) {
        return {
          reply: fallbackReply(input.message),
          sessionId,
          provider: "gemini" as const,
          degraded: true,
        };
      }
      throw err;
    }
  },
};
