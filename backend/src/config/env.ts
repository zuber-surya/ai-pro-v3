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
  STORAGE_ROOT: z.string().min(1).default("./storage"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment:", parsed.error.flatten().fieldErrors);
  throw new Error("Environment validation failed");
}

export const env = parsed.data;
