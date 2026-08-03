import { z } from "zod";

export const aiFaqSchema = z.object({
  q: z.string().trim().min(1).max(500),
  a: z.string().trim().min(1).max(4000),
});

export const aiEscalationSchema = z.object({
  failedResponseThreshold: z.coerce.number().int().min(1).max(20).default(3),
  onExplicitHumanRequest: z.boolean().default(true),
  email: z.string().trim().email().nullable().optional(),
});

const geminiModelLabel = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .refine((v) => v.toLowerCase().includes("gemini"), {
    message: "modelLabel must remain Gemini family",
  });

export const aiConfigUpdateSchema = z.object({
  greeting: z.string().trim().min(1).max(4000),
  faqs: z.array(aiFaqSchema).max(50),
  escalation: aiEscalationSchema,
  tone: z.enum(["friendly", "professional", "concise"]).nullable().optional(),
  systemPrompt: z.string().trim().max(8000).optional(),
  modelLabel: geminiModelLabel.optional(),
  /** Accepted for OpenAPI compatibility; provider switches are rejected. */
  provider: z.literal("gemini").optional(),
  model: geminiModelLabel.optional(),
  enabled: z.boolean().optional(),
});

export const aiConfigPreviewSchema = z.object({
  prompt: z.string().trim().min(1).max(2000),
  config: aiConfigUpdateSchema.partial().optional(),
});

export type AiConfigUpdateInput = z.infer<typeof aiConfigUpdateSchema>;
export type AiConfigPreviewInput = z.infer<typeof aiConfigPreviewSchema>;
