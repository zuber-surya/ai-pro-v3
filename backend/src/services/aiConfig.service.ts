import { Prisma } from "@prisma/client";
import { env } from "../config/env.js";
import { getGeminiClient } from "../integrations/gemini/gemini.client.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import type {
  AiConfigPreviewInput,
  AiConfigUpdateInput,
} from "../validators/aiConfig.validators.js";

export type AiFaq = { q: string; a: string };

export type AiEscalation = {
  failedResponseThreshold: number;
  onExplicitHumanRequest: boolean;
  email?: string | null;
};

export type AiConfigDto = {
  id: string;
  key: string;
  greeting: string;
  faqs: AiFaq[];
  escalation: AiEscalation;
  tone: string | null;
  systemPrompt: string;
  modelLabel: string;
  provider: "gemini";
  model: string;
  enabled: boolean;
  updatedAt: string;
};

const DEFAULT_KEY = "default";

const DEFAULT_SYSTEM = `You are PropVista CRM's AI real estate assistant for the Indian market.
Answer briefly and helpfully about property search, buying/renting basics, home loans, and how to use PropVista.
Do not invent specific inventory listings, prices, or availability. If the user wants listings, suggest using the AI search bar or /search.
Stay on real-estate topics. If asked unrelated questions, politely redirect.
Provider must remain Gemini-only — never mention other LLM vendors.`;

function asFaqs(value: Prisma.JsonValue): AiFaq[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const q = typeof row.q === "string" ? row.q : typeof row.question === "string" ? row.question : "";
      const a = typeof row.a === "string" ? row.a : typeof row.answer === "string" ? row.answer : "";
      if (!q || !a) return null;
      return { q, a };
    })
    .filter((x): x is AiFaq => Boolean(x));
}

function asEscalation(value: Prisma.JsonValue): AiEscalation {
  const row =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const threshold = Number(row.failedResponseThreshold);
  return {
    failedResponseThreshold:
      Number.isFinite(threshold) && threshold >= 1 ? Math.min(20, Math.floor(threshold)) : 3,
    onExplicitHumanRequest: row.onExplicitHumanRequest !== false,
    email: typeof row.email === "string" ? row.email : null,
  };
}

function asPrompts(value: Prisma.JsonValue): { system: string; enabled: boolean } {
  const row =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  return {
    system: typeof row.system === "string" && row.system.trim() ? row.system : DEFAULT_SYSTEM,
    enabled: row.enabled !== false,
  };
}

function toDto(row: {
  id: string;
  key: string;
  greeting: string;
  faqsJson: Prisma.JsonValue;
  escalationJson: Prisma.JsonValue;
  tone: string | null;
  promptsJson: Prisma.JsonValue;
  modelLabel: string;
  updatedAt: Date;
}): AiConfigDto {
  const prompts = asPrompts(row.promptsJson);
  return {
    id: row.id,
    key: row.key,
    greeting: row.greeting,
    faqs: asFaqs(row.faqsJson),
    escalation: asEscalation(row.escalationJson),
    tone: row.tone,
    systemPrompt: prompts.system,
    modelLabel: row.modelLabel,
    provider: "gemini",
    model: row.modelLabel,
    enabled: prompts.enabled,
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function ensureDefault() {
  const existing = await prisma.aiConfig.findUnique({ where: { key: DEFAULT_KEY } });
  if (existing) return existing;

  return prisma.aiConfig.create({
    data: {
      key: DEFAULT_KEY,
      greeting: env.AI_CHAT_GREETING,
      faqsJson: [
        {
          q: "How do I schedule a tour?",
          a: "You can click Schedule Visit on any property page to book a slot.",
        },
      ],
      escalationJson: {
        failedResponseThreshold: 3,
        onExplicitHumanRequest: true,
      },
      tone: "friendly",
      promptsJson: { system: DEFAULT_SYSTEM, enabled: true },
      modelLabel: "gemini",
    },
  });
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

export const aiConfigService = {
  async get(): Promise<AiConfigDto> {
    const row = await ensureDefault();
    return toDto(row);
  },

  async update(input: AiConfigUpdateInput, actorUserId: string): Promise<AiConfigDto> {
    if (input.provider && input.provider !== "gemini") {
      throw new AppError("VALIDATION_ERROR", "Only Gemini provider is supported", 422);
    }
    const modelLabel = input.modelLabel ?? input.model ?? "gemini";
    if (!modelLabel.toLowerCase().includes("gemini")) {
      throw new AppError("VALIDATION_ERROR", "modelLabel must remain Gemini family", 422);
    }

    const existing = await ensureDefault();
    const prompts = asPrompts(existing.promptsJson);
    const systemPrompt = input.systemPrompt?.trim() || prompts.system;
    const enabled = input.enabled ?? prompts.enabled;

    const row = await prisma.aiConfig.update({
      where: { id: existing.id },
      data: {
        greeting: input.greeting,
        faqsJson: input.faqs,
        escalationJson: {
          failedResponseThreshold: input.escalation.failedResponseThreshold,
          onExplicitHumanRequest: input.escalation.onExplicitHumanRequest,
          email: input.escalation.email ?? null,
        },
        tone: input.tone ?? null,
        promptsJson: { system: systemPrompt, enabled },
        modelLabel,
        updatedBy: actorUserId,
        createdBy: existing.createdBy ?? actorUserId,
      },
    });
    return toDto(row);
  },

  async preview(input: AiConfigPreviewInput): Promise<{
    output: string;
    provider: "gemini";
    degraded?: boolean;
  }> {
    const saved = await this.get();
    const greeting = input.config?.greeting?.trim() || saved.greeting;
    const tone = input.config?.tone ?? saved.tone;
    const systemPrompt =
      input.config?.systemPrompt?.trim() || saved.systemPrompt || DEFAULT_SYSTEM;
    const faqs = input.config?.faqs ?? saved.faqs;
    const faqBlock =
      faqs.length > 0
        ? `Known FAQs:\n${faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n")}`
        : "";

    const system = [systemPrompt, toneInstruction(tone), faqBlock, `Configured greeting: ${greeting}`]
      .filter(Boolean)
      .join("\n\n");

    try {
      const output = await getGeminiClient().generateText({
        system,
        prompt: `User preview message: ${input.prompt.trim()}\nAssistant:`,
        timeoutMs: env.AI_CHAT_TIMEOUT_MS,
      });
      return { output, provider: "gemini" };
    } catch (err) {
      if (err instanceof AppError && (err.code === "AI_UNAVAILABLE" || err.code === "AI_TIMEOUT")) {
        return {
          output:
            "AI preview unavailable right now. Greeting and FAQ edits still apply after save; try again shortly.",
          provider: "gemini",
          degraded: true,
        };
      }
      throw err;
    }
  },
};

export { DEFAULT_SYSTEM as AI_CONFIG_DEFAULT_SYSTEM };
