import { apiRequest } from "./client";

export type AiFaq = { q: string; a: string };

export type AiEscalation = {
  failedResponseThreshold: number;
  onExplicitHumanRequest: boolean;
  email?: string | null;
};

export type AiConfig = {
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

export type AiConfigUpdate = {
  greeting: string;
  faqs: AiFaq[];
  escalation: AiEscalation;
  tone?: "friendly" | "professional" | "concise" | null;
  systemPrompt?: string;
  modelLabel?: string;
  provider?: "gemini";
  enabled?: boolean;
};

export type AiConfigPreviewResponse = {
  output: string;
  provider: "gemini";
  degraded?: boolean;
};

export function getAiConfig() {
  return apiRequest<AiConfig>("/ai/config");
}

export function updateAiConfig(payload: AiConfigUpdate) {
  return apiRequest<AiConfig>("/ai/config", {
    method: "PUT",
    body: payload,
  });
}

export function previewAiConfig(prompt: string, config?: Partial<AiConfigUpdate>) {
  return apiRequest<AiConfigPreviewResponse>("/ai/config/preview", {
    method: "POST",
    body: { prompt, config },
  });
}
