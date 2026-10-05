import { GoogleGenAI } from "@google/genai";
import {
  AIOutputSchema,
  type AIOutput,
  type CampaignInput,
  type CampaignOutput,
  type RegenerateTarget,
  type RegeneratedValue,
} from "@campaign-ai/shared";
import { env } from "../../config/env.js";
import { PromptBuilder } from "../../prompts/PromptBuilder.js";
import type { AIProvider, CallOpts } from "../AIProvider.js";
import {
  AppError,
  AIResponseInvalidError,
  AIProviderError,
  RequestTimeoutError,
  RateLimitedError,
  ServiceUnavailableError,
} from "../../utils/retry.js";
import { cleanAndParseJson } from "../../utils/jsonParser.js";

const REGEN_SCHEMAS: Record<string, object> = {
  subjectLine: {
    type: "object",
    properties: { value: { type: "string" } },
    required: ["value"],
  },
  previewText: {
    type: "object",
    properties: { value: { type: "string" } },
    required: ["value"],
  },
  email: {
    type: "object",
    properties: {
      value: {
        type: "object",
        properties: {
          subject: { type: "string" },
          body: { type: "string" },
          cta: { type: "string" },
        },
        required: ["subject", "body", "cta"],
      },
    },
    required: ["value"],
  },
  whatsapp: {
    type: "object",
    properties: {
      value: {
        type: "object",
        properties: {
          message: { type: "string" },
          cta: { type: "string" },
        },
        required: ["message", "cta"],
      },
    },
    required: ["value"],
  },
  sms: {
    type: "object",
    properties: {
      value: {
        type: "object",
        properties: { message: { type: "string" } },
        required: ["message"],
      },
    },
    required: ["value"],
  },
};

const GENERATE_SCHEMA = {
  type: "object",
  properties: {
    subjectLines: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 5 },
    previewTexts: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
    promotionalEmail: {
      type: "object",
      properties: {
        subject: { type: "string" },
        body: { type: "string" },
        cta: { type: "string" },
      },
      required: ["subject", "body", "cta"],
    },
    whatsapp: {
      type: "object",
      properties: {
        message: { type: "string" },
        cta: { type: "string" },
      },
      required: ["message", "cta"],
    },
    sms: {
      type: "object",
      properties: { message: { type: "string" } },
      required: ["message"],
    },
  },
  required: ["subjectLines", "previewTexts", "promotionalEmail", "whatsapp", "sms"],
};

export class GeminiProvider implements AIProvider {
  private client: GoogleGenAI;
  private promptBuilder: PromptBuilder;
  readonly modelName: string;

  constructor(modelName?: string) {
    this.modelName = modelName ?? env.AI_MODEL;
    this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY! });
    this.promptBuilder = new PromptBuilder();
  }

  async generateCampaign(input: CampaignInput, opts: CallOpts): Promise<AIOutput> {
    const parts: string[] = [this.promptBuilder.buildCampaignPrompt(input)];
    if (opts.feedback && opts.feedback.length > 0) {
      parts.push(this.promptBuilder.buildRetryFeedback(opts.feedback));
    }

    const responseText = await this.callGemini(
      this.promptBuilder.buildSystemPrompt(),
      parts.join("\n\n"),
      GENERATE_SCHEMA,
      opts.signal
    );

    const parsed = cleanAndParseJson(responseText);
    const zodResult = AIOutputSchema.safeParse(parsed);
    if (!zodResult.success) {
      const issues = zodResult.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
      throw new AIResponseInvalidError(`AI output format validation failed: ${issues}`);
    }
    return zodResult.data;
  }

  async regenerateSection(
    input: CampaignInput,
    target: RegenerateTarget,
    current: CampaignOutput,
    opts: CallOpts
  ): Promise<RegeneratedValue> {
    const prompt = this.promptBuilder.buildRegenerationPrompt(input, target, current);
    const schema = REGEN_SCHEMAS[target.section];

    const responseText = await this.callGemini(
      this.promptBuilder.buildSystemPrompt(),
      prompt,
      schema,
      opts.signal
    );

    const parsed = cleanAndParseJson(responseText);
    return this.buildRegeneratedValue(target, parsed.value);
  }

  private buildRegeneratedValue(
    target: RegenerateTarget,
    value: unknown
  ): RegeneratedValue {
    switch (target.section) {
      case "subjectLine":
        return { section: "subjectLine", index: target.index, value: value as string };
      case "previewText":
        return { section: "previewText", index: target.index, value: value as string };
      case "email":
        return { section: "email", value: value as { subject: string; body: string; cta: string } };
      case "whatsapp":
        return { section: "whatsapp", value: value as { message: string; cta: string } };
      case "sms": {
        const msg = (value as { message: string }).message;
        return { section: "sms", value: { message: msg, characterCount: msg.length } };
      }
    }
  }

  async callGemini(
    systemInstruction: string,
    prompt: string,
    responseSchema: object,
    signal?: AbortSignal
  ): Promise<string> {
    if (signal?.aborted) {
      throw new RequestTimeoutError();
    }

    try {
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema as any,
          temperature: env.AI_TEMPERATURE,
          maxOutputTokens: env.AI_MAX_OUTPUT_TOKENS,
        },
      });

      const candidate = response.candidates?.[0];
      if (candidate?.finishReason === "MAX_TOKENS") {
        throw new AIResponseInvalidError("AI generation exceeded maximum output tokens. Retrying...");
      }

      const text = response.text;
      if (!text) {
        throw new AIResponseInvalidError("Empty response from AI provider");
      }
      return text;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      if (signal?.aborted || err.name === "AbortError") {
        throw new RequestTimeoutError();
      }

      const status = err.status ?? err.statusCode ?? err.error?.code;
      const rawMsg = String(err.error?.message || err.message || "");

      const isRateLimit =
        status === 429 ||
        status === "RESOURCE_EXHAUSTED" ||
        err.error?.status === "RESOURCE_EXHAUSTED" ||
        /429|resource_exhausted|quota|rate limit/i.test(rawMsg);

      if (isRateLimit) {
        throw new RateLimitedError(rawMsg || undefined);
      }

      const isUnavailable =
        status === 503 ||
        status === "UNAVAILABLE" ||
        err.error?.status === "UNAVAILABLE" ||
        /503|unavailable|high demand|overloaded/i.test(rawMsg);

      if (isUnavailable) {
        throw new ServiceUnavailableError(rawMsg || undefined);
      }

      throw new AIProviderError(`AI provider error (${this.modelName}): ${rawMsg || "Unknown error"}`);
    }
  }
}
