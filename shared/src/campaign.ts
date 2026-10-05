import { z } from "zod";

export const TONES = [
  "Professional",
  "Energetic",
  "Playful",
  "Premium",
  "Friendly",
  "Urgent",
  "Conversational",
] as const;

export type Tone = (typeof TONES)[number];

// ─── Campaign Constraints (Nuanced Controls) ─────────────────────────────────

export const EMAIL_LENGTH_OPTIONS = ["short", "standard", "detailed"] as const;
export type EmailLengthOption = (typeof EMAIL_LENGTH_OPTIONS)[number];

export const EMOJI_STYLE_OPTIONS = ["none", "balanced", "vibrant"] as const;
export type EmojiStyleOption = (typeof EMOJI_STYLE_OPTIONS)[number];

export const CampaignConstraintsSchema = z.object({
  emailLength: z.enum(EMAIL_LENGTH_OPTIONS).default("standard").optional(),
  smsLimit: z.number().int().min(60).max(320).default(160).optional(),
  language: z.string().trim().default("English").optional(),
  emojiStyle: z.enum(EMOJI_STYLE_OPTIONS).default("balanced").optional(),
  ctaStyle: z.string().trim().max(100).optional(),
});

export type CampaignConstraints = z.infer<typeof CampaignConstraintsSchema>;

// ─── Campaign Input ────────────────────────────────────────────────────────────

export const CampaignInputSchema = z.object({
  productName: z.string().trim().min(1, "Product name is required").max(150),
  productDescription: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(3000),
  offer: z.string().trim().min(1, "Offer/discount is required").max(500),
  targetAudience: z
    .string()
    .trim()
    .min(3, "Target audience must be at least 3 characters")
    .max(1500),
  campaignObjective: z
    .string()
    .trim()
    .min(3, "Campaign objective must be at least 3 characters")
    .max(1500),
  tone: z.enum(TONES, { required_error: "Please select a tone" }),
  constraints: CampaignConstraintsSchema.optional(),
});

export type CampaignInput = z.infer<typeof CampaignInputSchema>;

// ─── AI Output (what the AI is asked to produce) ──────────────────────────────

export const AIOutputSchema = z.object({
  subjectLines: z.array(z.string().min(1)).length(5),
  previewTexts: z.array(z.string().min(1)).length(3),
  promotionalEmail: z.object({
    subject: z.string().min(1),
    body: z.string().min(1),
    cta: z.string().min(1),
  }),
  whatsapp: z.object({
    message: z.string().min(1),
    cta: z.string().min(1),
  }),
  sms: z.object({
    message: z.string().min(1),
  }),
});

export type AIOutput = z.infer<typeof AIOutputSchema>;

// ─── Campaign Output (server adds characterCount + metadata) ──────────────────

export const CampaignOutputSchema = AIOutputSchema.extend({
  sms: z.object({
    message: z.string(),
    characterCount: z.number().int(),
  }),
});

export type CampaignOutput = z.infer<typeof CampaignOutputSchema>;

// ─── Regeneration ─────────────────────────────────────────────────────────────

export const RegenerateTargetSchema = z.discriminatedUnion("section", [
  z.object({
    section: z.literal("subjectLine"),
    index: z.number().int().min(0).max(4),
  }),
  z.object({
    section: z.literal("previewText"),
    index: z.number().int().min(0).max(2),
  }),
  z.object({ section: z.literal("email") }),
  z.object({ section: z.literal("whatsapp") }),
  z.object({ section: z.literal("sms") }),
]);

export type RegenerateTarget = z.infer<typeof RegenerateTargetSchema>;

export const RegenerateRequestSchema = z.object({
  campaign: CampaignInputSchema,
  target: RegenerateTargetSchema,
  current: CampaignOutputSchema,
});

export type RegenerateRequest = z.infer<typeof RegenerateRequestSchema>;

// ─── API Envelope ─────────────────────────────────────────────────────────────

export const API_ERROR_CODES = [
  "VALIDATION_ERROR",
  "RATE_LIMITED",
  "AI_RESPONSE_INVALID",
  "AI_PROVIDER_ERROR",
  "REQUEST_TIMEOUT",
  "INTERNAL_ERROR",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: { promptVersion: string };
}

export interface ApiError {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: { field?: string; message: string }[];
    requestId?: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Regenerated Value ────────────────────────────────────────────────────────

export type RegeneratedValue =
  | { section: "subjectLine"; index: number; value: string }
  | { section: "previewText"; index: number; value: string }
  | {
      section: "email";
      value: { subject: string; body: string; cta: string };
    }
  | { section: "whatsapp"; value: { message: string; cta: string } }
  | { section: "sms"; value: { message: string; characterCount: number } };
