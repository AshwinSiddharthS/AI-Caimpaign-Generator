import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { createApiRouter } from "./routes/api.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestIdMiddleware } from "./middleware/requestId.js";
import { globalRateLimiter } from "./middleware/rateLimiter.js";
import { GeminiProvider } from "./providers/gemini/GeminiProvider.js";
import { FallbackProvider } from "./providers/fallback/FallbackProvider.js";
import { MockProvider } from "./providers/mock/MockProvider.js";
import type { AIProvider } from "./providers/AIProvider.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Create provider ───────────────────────────────────────────────────────────
const provider: AIProvider =
  env.AI_PROVIDER === "gemini"
    ? new FallbackProvider(env.GEMINI_MODEL_CHAIN)
    : new MockProvider();

console.log(
  `🤖 AI provider: ${env.AI_PROVIDER} | fallback chain: ${env.GEMINI_MODEL_CHAIN.join(" → ")}`
);

// ─── Express app ───────────────────────────────────────────────────────────────
const app = express();

// Trust proxy for correct IP behind Render/reverse proxies
if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Security headers
app.use(helmet());

// CORS — allow configured client origins
const allowedOrigins = env.CLIENT_ORIGIN.split(",").map((o) => o.trim());
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Body parsing (100kb limit — regenerate sends current campaign)
app.use(express.json({ limit: "100kb" }));

// Request ID
app.use(requestIdMiddleware);

// Global rate limiter
app.use(globalRateLimiter);

// API routes
app.use("/api/v1", createApiRouter(provider));

// Serve built client in production
const clientDist = path.resolve(__dirname, "../../client/dist");
if (env.NODE_ENV === "production") {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// Central error handler — MUST be last
app.use(errorHandler);

// ─── Start ─────────────────────────────────────────────────────────────────────
const server = app.listen(env.PORT, () => {
  console.log(`🚀 CampaignAI server running on http://localhost:${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

export { app };
