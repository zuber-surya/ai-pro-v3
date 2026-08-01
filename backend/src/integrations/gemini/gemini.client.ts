import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env.js";
import { AppError } from "../../middleware/errorHandler.js";

export type GeminiGenerateJsonOptions = {
  prompt: string;
  system?: string;
  timeoutMs?: number;
};

export type GeminiClient = {
  generateJson<T>(options: GeminiGenerateJsonOptions): Promise<T>;
};

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1]?.trim() ?? trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new AppError("AI_UNAVAILABLE", "Gemini returned non-JSON content", 503);
  }
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    throw new AppError("AI_UNAVAILABLE", "Gemini returned invalid JSON", 503);
  }
}

export function createGeminiClient(apiKey = env.GEMINI_API_KEY): GeminiClient {
  if (!apiKey) {
    return {
      async generateJson() {
        throw new AppError("AI_UNAVAILABLE", "GEMINI_API_KEY is not configured", 503);
      },
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: env.GEMINI_MODEL,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  return {
    async generateJson<T>({ prompt, system, timeoutMs }: GeminiGenerateJsonOptions): Promise<T> {
      const ms = timeoutMs ?? env.AI_SEARCH_TIMEOUT_MS;
      const fullPrompt = system ? `${system}\n\n${prompt}` : prompt;

      try {
        const result = await Promise.race([
          model.generateContent(fullPrompt),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new AppError("AI_TIMEOUT", "Gemini request timed out", 504)), ms);
          }),
        ]);
        const text = result.response.text();
        return extractJson(text) as T;
      } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError("AI_UNAVAILABLE", "Gemini request failed", 503);
      }
    },
  };
}

/** Test seam — override in unit tests. */
let activeClient: GeminiClient = createGeminiClient();

export function getGeminiClient(): GeminiClient {
  return activeClient;
}

export function setGeminiClientForTests(client: GeminiClient): void {
  activeClient = client;
}

export function resetGeminiClientForTests(): void {
  activeClient = createGeminiClient();
}
