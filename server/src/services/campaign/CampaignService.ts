import type {
  AIOutput,
  CampaignInput,
  CampaignOutput,
  RegenerateTarget,
  RegeneratedValue,
} from "@campaign-ai/shared";
import { AIOutputSchema } from "@campaign-ai/shared";
import { env } from "../../config/env.js";
import type { AIProvider } from "../../providers/AIProvider.js";
import {
  AIResponseInvalidError,
  RequestTimeoutError,
  RateLimitedError,
  withRetry,
  createTimeoutController,
} from "../../utils/retry.js";
import {
  validateQuality,
  computeSmsCharacterCount,
} from "./qualityValidator.js";
import { PROMPT_VERSION } from "../../prompts/PromptBuilder.js";

export class CampaignService {
  constructor(private readonly provider: AIProvider) {}

  async generateCampaign(input: CampaignInput): Promise<{
    output: CampaignOutput;
    promptVersion: string;
  }> {
    const output = await withRetry(async (attempt, feedback) => {
      const controller = createTimeoutController(env.AI_TIMEOUT_MS);

      try {
        const raw = await this.provider.generateCampaign(input, {
          signal: controller.signal,
          feedback: attempt > 0 ? feedback : undefined,
        });

        return this.validateAndProcess(raw, input.constraints);
      } catch (err) {
        if (
          err instanceof Error &&
          (err.name === "AbortError" || err.message.includes("aborted"))
        ) {
          throw new RequestTimeoutError();
        }
        if (err instanceof Error && err.message.includes("429")) {
          throw new RateLimitedError();
        }
        throw err;
      } finally {
        controller.abort();
      }
    });

    return { output, promptVersion: PROMPT_VERSION };
  }

  async regenerateSection(
    input: CampaignInput,
    target: RegenerateTarget,
    current: CampaignOutput
  ): Promise<{ value: RegeneratedValue; promptVersion: string }> {
    const value = await withRetry(async (_attempt, _feedback) => {
      const controller = createTimeoutController(env.AI_TIMEOUT_MS);

      try {
        return await this.provider.regenerateSection(input, target, current, {
          signal: controller.signal,
        });
      } catch (err) {
        if (
          err instanceof Error &&
          (err.name === "AbortError" || err.message.includes("aborted"))
        ) {
          throw new RequestTimeoutError();
        }
        if (err instanceof Error && err.message.includes("429")) {
          throw new RateLimitedError();
        }
        throw err;
      } finally {
        controller.abort();
      }
    });

    return { value, promptVersion: PROMPT_VERSION };
  }

  private validateAndProcess(raw: AIOutput, constraints?: CampaignInput["constraints"]): CampaignOutput {
    // Zod validation
    const zodResult = AIOutputSchema.safeParse(raw);
    if (!zodResult.success) {
      const messages = zodResult.error.errors.map(
        (e) => `${e.path.join(".")}: ${e.message}`
      );
      throw new AIResponseInvalidError(
        `AI output schema validation failed: ${messages.join("; ")}`
      );
    }

    // Quality validation
    const qualityErrors = validateQuality(zodResult.data, constraints);
    if (qualityErrors.length > 0) {
      const messages = qualityErrors.map((e) => `${e.field}: ${e.message}`);
      throw new AIResponseInvalidError(
        `Quality checks failed: ${messages.join("; ")}`
      );
    }

    return computeSmsCharacterCount(zodResult.data);
  }
}
