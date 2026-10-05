/**
 * FallbackProvider — Seamless multi-model fallback for Gemini API rate limits.
 *
 * Strategy:
 *   1. Try each model in priority order (fastest/cheapest first).
 *   2. On a 429 (RateLimitedError), mark that model as cooled-down for
 *      COOLDOWN_MS, then immediately retry with the next available model.
 *   3. On a non-rate-limit error, throw immediately (no point trying other models
 *      for auth/parsing/validation failures).
 *   4. If ALL models are exhausted or cooled down, surface a clear error.
 *   5. Every 60 s, logs which models are available vs cooling down.
 */

import type {
  AIOutput,
  CampaignInput,
  CampaignOutput,
  RegenerateTarget,
  RegeneratedValue,
} from "@campaign-ai/shared";
import type { AIProvider, CallOpts } from "../AIProvider.js";
import { GeminiProvider } from "../gemini/GeminiProvider.js";
import {
  RateLimitedError,
  ServiceUnavailableError,
  AppError,
} from "../../utils/retry.js";

/** How long (ms) to skip a model after it returns 429 or 503. Default: 60 s */
const COOLDOWN_MS = 60_000;

/** Ordered list of Gemini models to try, fastest/highest-quota first */
const MODEL_CHAIN: string[] = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
];

interface ModelSlot {
  provider: GeminiProvider;
  cooledDownUntil: number; // epoch ms — 0 means available
}

export class FallbackProvider implements AIProvider {
  private slots: ModelSlot[];

  constructor(modelChain: string[] = MODEL_CHAIN) {
    this.slots = modelChain.map((model) => ({
      provider: new GeminiProvider(model),
      cooledDownUntil: 0,
    }));

    console.log(
      `🔀 FallbackProvider initialised with ${this.slots.length} models: ${modelChain.join(" → ")}`
    );
  }

  // ─── Public AIProvider interface ───────────────────────────────────────────

  async generateCampaign(input: CampaignInput, opts: CallOpts): Promise<AIOutput> {
    return this.withFallback((provider) => provider.generateCampaign(input, opts));
  }

  async regenerateSection(
    input: CampaignInput,
    target: RegenerateTarget,
    current: CampaignOutput,
    opts: CallOpts
  ): Promise<RegeneratedValue> {
    return this.withFallback((provider) =>
      provider.regenerateSection(input, target, current, opts)
    );
  }

  // ─── Core fallback logic ───────────────────────────────────────────────────

  private async withFallback<T>(
    fn: (provider: GeminiProvider) => Promise<T>
  ): Promise<T> {
    const now = Date.now();
    let allCooledDown = true;

    for (const slot of this.slots) {
      // Skip models still in cooldown
      if (slot.cooledDownUntil > now) {
        const remaining = Math.ceil((slot.cooledDownUntil - now) / 1000);
        console.log(
          `⏳ [FallbackProvider] ${slot.provider.modelName} is cooling down — ${remaining}s remaining, skipping.`
        );
        continue;
      }

      allCooledDown = false;

      try {
        const result = await fn(slot.provider);
        // Successful — clear any lingering cooldown on this slot
        if (slot.cooledDownUntil > 0) {
          slot.cooledDownUntil = 0;
          console.log(`✅ [FallbackProvider] ${slot.provider.modelName} recovered.`);
        }
        return result;
      } catch (err) {
        const isTransient =
          err instanceof RateLimitedError ||
          err instanceof ServiceUnavailableError ||
          (err instanceof AppError && (err.statusCode === 429 || err.statusCode === 503 || err.statusCode === 504 || err.statusCode === 502));

        if (isTransient) {
          slot.cooledDownUntil = Date.now() + COOLDOWN_MS;
          const reason = err instanceof AppError ? err.code : "ERROR";
          console.warn(
            `⚠️  [FallbackProvider] ${slot.provider.modelName} failed (${reason}). ` +
            `Cooling down for ${COOLDOWN_MS / 1000}s. Trying next available model in chain…`
          );
          // Continue to next model in the chain
          continue;
        }

        // Non-transient errors (auth, schema, client validation) propagate immediately
        throw err;
      }
    }

    // All slots tried and exhausted (or all cooling down)
    if (allCooledDown) {
      const soonest = Math.min(...this.slots.map((s) => s.cooledDownUntil));
      const waitSec = Math.max(1, Math.ceil((soonest - Date.now()) / 1000));
      console.error(
        `❌ [FallbackProvider] ALL ${this.slots.length} models are rate-limited or cooling down. ` +
        `Fastest recovery in ~${waitSec}s.`
      );
      throw new RateLimitedError(
        `All AI models are temporarily busy or rate-limited. Please try again in ${waitSec} seconds.`
      );
    }

    // All models tried in this loop but all failed
    throw new RateLimitedError(
      "All available AI models returned rate-limit or temporary capacity errors. Please wait a moment and try again."
    );
  }

  // ─── Status introspection (for logging / health checks) ───────────────────

  getStatus(): { model: string; available: boolean; cooldownRemainingMs: number }[] {
    const now = Date.now();
    return this.slots.map((slot) => ({
      model: slot.provider.modelName,
      available: slot.cooledDownUntil <= now,
      cooldownRemainingMs: Math.max(0, slot.cooledDownUntil - now),
    }));
  }
}
