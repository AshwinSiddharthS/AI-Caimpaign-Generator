import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  SERVE_CLIENT: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === "boolean" ? val : val.toLowerCase() === "true")),

  AI_PROVIDER: z.enum(["gemini", "mock"]).default("gemini"),
  GEMINI_API_KEY: z.string().optional(),
  // Comma-separated ordered list of Gemini models to try (first = highest priority)
  GEMINI_MODEL_CHAIN: z
    .string()
    .default(
      "gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-flash-lite-latest,gemini-3.8-flash,gemini-3.5-flash"
    )
    .transform((s) => s.split(",").map((m) => m.trim()).filter(Boolean)),
  AI_MODEL: z.string().default("gemini-3.5-flash-lite"),
  AI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.9),
  AI_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(8192),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  AI_MAX_RETRIES: z.coerce.number().int().min(0).max(3).default(1),

  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  AI_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(20),
});

function parseEnv() {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error(
      "❌ Invalid environment variables:",
      result.error.flatten().fieldErrors
    );
    process.exit(1);
  }

  const env = result.data;

  // Refuse to start mock provider in production
  if (env.NODE_ENV === "production" && env.AI_PROVIDER === "mock") {
    console.error("❌ AI_PROVIDER=mock is not allowed in production.");
    process.exit(1);
  }

  // Require API key when using Gemini
  if (env.AI_PROVIDER === "gemini" && !env.GEMINI_API_KEY) {
    console.error(
      "❌ GEMINI_API_KEY is required when AI_PROVIDER=gemini. Get one at https://aistudio.google.com"
    );
    process.exit(1);
  }

  return env;
}

export const env = parseEnv();
export type Env = typeof env;
