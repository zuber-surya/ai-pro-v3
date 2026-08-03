import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4001),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:3001"),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().min(1).default("gemini-2.0-flash"),
  AI_SEARCH_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
  AI_SEARCH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(30),
  AI_SEARCH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  AI_CHAT_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(40),
  AI_CHAT_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  AI_CHAT_TIMEOUT_MS: z.coerce.number().int().positive().default(12_000),
  AI_CHAT_GREETING: z
    .string()
    .min(1)
    .default(
      "Hello! I'm your AI real estate assistant. Ask me about local property trends, home loans, or how to search listings.",
    ),
  STORAGE_ROOT: z.string().min(1).default("./storage"),
  EMAIL_FROM: z.string().min(1).default("noreply@propvista.local"),
  EMAIL_SMTP_HOST: z.string().optional().default(""),
  EMAIL_SMTP_PORT: z.coerce.number().int().positive().default(587),
  EMAIL_SMTP_USER: z.string().optional().default(""),
  EMAIL_SMTP_PASS: z.string().optional().default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment:", parsed.error.flatten().fieldErrors);
  throw new Error("Environment validation failed");
}

export const env = parsed.data;
