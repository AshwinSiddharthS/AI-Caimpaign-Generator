import type { Request, Response, NextFunction } from "express";
import {
  CampaignInputSchema,
  RegenerateRequestSchema,
} from "@campaign-ai/shared";
import { CampaignService } from "../services/campaign/CampaignService.js";
import { AppError } from "../utils/retry.js";

export function createCampaignController(service: CampaignService) {
  return {
    generate: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parseResult = CampaignInputSchema.safeParse(req.body);
        if (!parseResult.success) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid campaign input",
              details: parseResult.error.errors.map((e) => ({
                field: e.path.join("."),
                message: e.message,
              })),
              requestId: req.requestId,
            },
          });
        }

        const { output, promptVersion } = await service.generateCampaign(
          parseResult.data
        );

        return res.json({
          success: true,
          data: output,
          meta: { promptVersion },
        });
      } catch (err) {
        next(err);
      }
    },

    regenerate: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parseResult = RegenerateRequestSchema.safeParse(req.body);
        if (!parseResult.success) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid regenerate request",
              details: parseResult.error.errors.map((e) => ({
                field: e.path.join("."),
                message: e.message,
              })),
              requestId: req.requestId,
            },
          });
        }

        const { campaign, target, current } = parseResult.data;
        const { value, promptVersion } = await service.regenerateSection(
          campaign,
          target,
          current
        );

        return res.json({
          success: true,
          data: value,
          meta: { promptVersion },
        });
      } catch (err) {
        next(err);
      }
    },
  };
}
