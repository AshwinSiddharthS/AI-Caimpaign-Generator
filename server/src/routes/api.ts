import { Router } from "express";
import { createCampaignController } from "../controllers/campaignController.js";
import { aiRateLimiter } from "../middleware/rateLimiter.js";
import { CampaignService } from "../services/campaign/CampaignService.js";
import type { AIProvider } from "../providers/AIProvider.js";

export function createApiRouter(provider: AIProvider): Router {
  const router = Router();
  const service = new CampaignService(provider);
  const controller = createCampaignController(service);

  // Health check — never calls AI
  router.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "campaign-ai" });
  });

  // Campaign routes with AI rate limiting
  router.post("/campaigns/generate", aiRateLimiter, controller.generate);
  router.post("/campaigns/regenerate", aiRateLimiter, controller.regenerate);

  return router;
}
