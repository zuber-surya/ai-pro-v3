import { apiRequest } from "./client";

export type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export type AiChatRequest = {
  message: string;
  sessionId?: string;
  context?: {
    history?: ChatHistoryItem[];
  };
};

export type AiChatResponse = {
  reply: string;
  sessionId: string;
  provider: "gemini";
  degraded?: boolean;
};

export type AiChatGreeting = {
  greeting: string;
  provider: "gemini";
};

export function getChatGreeting() {
  return apiRequest<AiChatGreeting>("/ai/chat/greeting");
}

export function aiChat(payload: AiChatRequest) {
  return apiRequest<AiChatResponse>("/ai/chat", {
    method: "POST",
    body: payload,
  });
}
