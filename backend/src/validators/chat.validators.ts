import { z } from "zod";

export const chatHistoryItemSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

export const aiChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().uuid().optional(),
  context: z
    .object({
      history: z.array(chatHistoryItemSchema).max(20).optional(),
    })
    .passthrough()
    .optional(),
});

export type AiChatRequest = z.infer<typeof aiChatRequestSchema>;
