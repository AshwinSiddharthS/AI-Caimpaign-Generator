import { useCallback, useEffect, useRef, useState } from "react";
import type { CampaignInput, CampaignConstraints } from "@campaign-ai/shared";
import {
  CampaignInputSchema,
  TONES,
  EMAIL_LENGTH_OPTIONS,
  EMOJI_STYLE_OPTIONS,
} from "@campaign-ai/shared";
import type { CampaignState } from "../../hooks/useCampaign.js";

interface CampaignFormProps {
  state: CampaignState;
  onFieldChange: (field: keyof CampaignInput, value: string) => void;
  onConstraintChange: (constraints: Partial<CampaignConstraints>) => void;
  onFillExample: () => void;
  onSubmit: (input: CampaignInput) => void;
}

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
  currentLength?: number;
  children: React.ReactNode;
}

function Field({ id, label, hint, error, maxLength, currentLength, children }: FieldProps) {
  const nearLimit = maxLength && currentLength !== undefined && currentLength > maxLength * 0.85;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="label mb-0">
          {label}
        </label>
        {maxLength && currentLength !== undefined && (
          <span className={nearLimit ? "char-count-warn" : "char-count"}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-slate-500 -mt-0.5">{hint}</p>}
      <div className="mt-1.5">{children}</div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-400 flex items-center gap-1 mt-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

const EMAIL_LENGTH_LABELS: Record<string, { label: string; desc: string }> = {
  short: { label: "Short", desc: "50–90 words" },
  standard: { label: "Standard", desc: "90–180 words" },
  detailed: { label: "Detailed", desc: "180–280 words" },
};

const EMOJI_LABELS: Record<string, { label: string; desc: string }> = {
  none: { label: "None", desc: "No emojis" },
  balanced: { label: "Balanced", desc: "1–2 tasteful" },
  vibrant: { label: "Vibrant", desc: "Expressive" },
};

export function CampaignForm({
  state,
  onFieldChange,
  onConstraintChange,
  onFillExample,
  onSubmit,
}: CampaignFormProps) {
  const { form, status, fieldErrors } = state;
  const isLoading = status === "loading";
  const submitRef = useRef<HTMLButtonElement>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [useCustomTone, setUseCustomTone] = useState(false);

  const constraints = (form.constraints as CampaignConstraints | undefined) ?? {};

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(form as CampaignInput);
    },
    [form, onSubmit]
  );

  // Ctrl/Cmd + Enter to submit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        submitRef.current?.click();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const f = (field: keyof CampaignInput) => (form[field] as string) ?? "";
  const smsLimit = constraints.smsLimit ?? 160;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Campaign Details</h2>
        <button
          type="button"
          onClick={onFillExample}
          className="btn-ghost text-xs text-brand-400 hover:text-brand-300"
          disabled={isLoading}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Try Example
        </button>
      </div>

      {/* Global error */}
      {status === "error" && state.error && !Object.keys(fieldErrors).length && (
        <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300 flex items-start gap-2.5">
          <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {state.error}
        </div>
      )}

      {/* Product Name */}
      <Field
        id="productName"
        label="Product Name"
        error={fieldErrors.productName}
        maxLength={150}
        currentLength={f("productName").length}
      >
        <input
          id="productName"
          type="text"
          value={f("productName")}
          onChange={(e) => onFieldChange("productName", e.target.value)}
          placeholder="e.g. AirStride Running Shoes"
          maxLength={150}
          className={`input ${fieldErrors.productName ? "input-error" : ""}`}
          aria-describedby={fieldErrors.productName ? "productName-error" : undefined}
          aria-invalid={!!fieldErrors.productName}
          disabled={isLoading}
        />
      </Field>

      {/* Product Description */}
      <Field
        id="productDescription"
        label="Product Description"
        error={fieldErrors.productDescription}
        maxLength={3000}
        currentLength={f("productDescription").length}
      >
        <textarea
          id="productDescription"
          value={f("productDescription")}
          onChange={(e) => onFieldChange("productDescription", e.target.value)}
          placeholder="Describe your product — features, benefits, what makes it unique..."
          maxLength={3000}
          rows={4}
          className={`input resize-none ${fieldErrors.productDescription ? "input-error" : ""}`}
          aria-describedby={fieldErrors.productDescription ? "productDescription-error" : undefined}
          aria-invalid={!!fieldErrors.productDescription}
          disabled={isLoading}
        />
      </Field>

      {/* Offer */}
      <Field
        id="offer"
        label="Offer / Discount"
        error={fieldErrors.offer}
        maxLength={500}
        currentLength={f("offer").length}
      >
        <input
          id="offer"
          type="text"
          value={f("offer")}
          onChange={(e) => onFieldChange("offer", e.target.value)}
          placeholder="e.g. 20% Off + Free Shipping"
          maxLength={500}
          className={`input ${fieldErrors.offer ? "input-error" : ""}`}
          aria-describedby={fieldErrors.offer ? "offer-error" : undefined}
          aria-invalid={!!fieldErrors.offer}
          disabled={isLoading}
        />
      </Field>

      {/* Target Audience */}
      <Field
        id="targetAudience"
        label="Target Audience"
        error={fieldErrors.targetAudience}
        maxLength={1500}
        currentLength={f("targetAudience").length}
      >
        <textarea
          id="targetAudience"
          value={f("targetAudience")}
          onChange={(e) => onFieldChange("targetAudience", e.target.value)}
          placeholder="e.g. Men and women aged 20–40 who want comfortable everyday running shoes"
          maxLength={1500}
          rows={2}
          className={`input resize-none ${fieldErrors.targetAudience ? "input-error" : ""}`}
          aria-describedby={fieldErrors.targetAudience ? "targetAudience-error" : undefined}
          aria-invalid={!!fieldErrors.targetAudience}
          disabled={isLoading}
        />
      </Field>

      {/* Campaign Objective */}
      <Field
        id="campaignObjective"
        label="Campaign Objective"
        error={fieldErrors.campaignObjective}
        maxLength={1500}
        currentLength={f("campaignObjective").length}
      >
        <textarea
          id="campaignObjective"
          value={f("campaignObjective")}
          onChange={(e) => onFieldChange("campaignObjective", e.target.value)}
          placeholder="e.g. Drive purchases during the weekend sale"
          maxLength={1500}
          rows={2}
          className={`input resize-none ${fieldErrors.campaignObjective ? "input-error" : ""}`}
          aria-describedby={
            fieldErrors.campaignObjective ? "campaignObjective-error" : undefined
          }
          aria-invalid={!!fieldErrors.campaignObjective}
          disabled={isLoading}
        />
      </Field>

      {/* Tone of Voice */}
      <Field id="tone" label="Tone of Voice" error={fieldErrors.tone}>
        {useCustomTone ? (
          <div className="space-y-2">
            <input
              id="tone"
              type="text"
              value={f("tone")}
              onChange={(e) => onFieldChange("tone", e.target.value)}
              placeholder="e.g. Bold and aspirational"
              maxLength={60}
              className={`input ${fieldErrors.tone ? "input-error" : ""}`}
              aria-describedby={fieldErrors.tone ? "tone-error" : undefined}
              aria-invalid={!!fieldErrors.tone}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => {
                setUseCustomTone(false);
                onFieldChange("tone", "");
              }}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Use preset tones
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <select
              id="tone"
              value={f("tone")}
              onChange={(e) => onFieldChange("tone", e.target.value)}
              className={`input ${fieldErrors.tone ? "input-error" : ""} ${
                !f("tone") ? "text-slate-500" : ""
              }`}
              aria-describedby={fieldErrors.tone ? "tone-error" : undefined}
              aria-invalid={!!fieldErrors.tone}
              disabled={isLoading}
            >
              <option value="" disabled>
                Select a tone...
              </option>
              {TONES.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setUseCustomTone(true);
                onFieldChange("tone", "");
              }}
              className="text-xs text-slate-500 hover:text-brand-400 transition-colors"
            >
              + Use custom tone
            </button>
          </div>
        )}
      </Field>

      {/* ── Advanced Settings ─────────────────────────────── */}
      <div className="border border-slate-800 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setAdvancedOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/40 hover:bg-slate-800/70 transition-colors text-sm"
          aria-expanded={advancedOpen}
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-brand-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            <span className="font-medium text-slate-200">Advanced Settings</span>
            {(constraints.emailLength ||
              constraints.emojiStyle ||
              constraints.language ||
              constraints.ctaStyle ||
              (constraints.smsLimit && constraints.smsLimit !== 160)) && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-600/20 text-brand-400 border border-brand-500/30">
                Active
              </span>
            )}
          </div>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              advancedOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {advancedOpen && (
          <div className="px-4 py-4 space-y-5 border-t border-slate-800 bg-slate-900/60">
            {/* Email Length */}
            <div className="space-y-2">
              <label className="label mb-0 flex items-center gap-1.5">
                Email Body Length
                <span className="text-[10px] font-normal text-slate-500">(optional)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {EMAIL_LENGTH_OPTIONS.map((opt) => {
                  const meta = EMAIL_LENGTH_LABELS[opt];
                  const active = (constraints.emailLength ?? "standard") === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onConstraintChange({ emailLength: opt })}
                      disabled={isLoading}
                      className={`rounded-lg border px-2 py-2 text-center text-xs font-medium transition-all duration-150
                        ${
                          active
                            ? "border-brand-500 bg-brand-600/15 text-brand-300"
                            : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                        }`}
                    >
                      <div className="font-semibold">{meta.label}</div>
                      <div className="text-[10px] mt-0.5 opacity-70">{meta.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SMS Character Limit */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="smsLimit" className="label mb-0 flex items-center gap-1.5">
                  SMS Character Limit
                  <span className="text-[10px] font-normal text-slate-500">(optional)</span>
                </label>
                <span className="text-sm font-bold text-brand-400 tabular-nums">
                  {smsLimit} chars
                </span>
              </div>
              <div className="space-y-1.5">
                <input
                  id="smsLimit"
                  type="range"
                  min={60}
                  max={320}
                  step={10}
                  value={smsLimit}
                  onChange={(e) =>
                    onConstraintChange({ smsLimit: parseInt(e.target.value) })
                  }
                  disabled={isLoading}
                  className="range-slider"
                />
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>60 (ultra short)</span>
                  <span className="text-slate-500">160 (standard SMS)</span>
                  <span>320 (2 SMS)</span>
                </div>
              </div>
              {smsLimit !== 160 && (
                <p className="text-[10px] text-amber-400/80">
                  {smsLimit < 160
                    ? `Tip: ${smsLimit} chars is shorter than a standard SMS. Great for push notifications.`
                    : `Tip: ${smsLimit} chars spans multiple SMS segments — carriers may split it.`}
                </p>
              )}
            </div>

            {/* Emoji Style */}
            <div className="space-y-2">
              <label className="label mb-0 flex items-center gap-1.5">
                Emoji Style
                <span className="text-[10px] font-normal text-slate-500">(optional)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {EMOJI_STYLE_OPTIONS.map((opt) => {
                  const meta = EMOJI_LABELS[opt];
                  const active = (constraints.emojiStyle ?? "balanced") === opt;
                  const icons = { none: "🚫", balanced: "✨", vibrant: "🎉" };
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onConstraintChange({ emojiStyle: opt })}
                      disabled={isLoading}
                      className={`rounded-lg border px-2 py-2 text-center text-xs font-medium transition-all duration-150
                        ${
                          active
                            ? "border-brand-500 bg-brand-600/15 text-brand-300"
                            : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                        }`}
                    >
                      <div className="text-base mb-0.5">{icons[opt]}</div>
                      <div className="font-semibold">{meta.label}</div>
                      <div className="text-[10px] mt-0.5 opacity-70">{meta.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Output Language */}
            <div className="space-y-1.5">
              <label htmlFor="language" className="label mb-0 flex items-center gap-1.5">
                Output Language
                <span className="text-[10px] font-normal text-slate-500">(optional)</span>
              </label>
              <select
                id="language"
                value={constraints.language ?? "English"}
                onChange={(e) => onConstraintChange({ language: e.target.value })}
                disabled={isLoading}
                className="input text-sm"
              >
                {[
                  "English",
                  "Spanish",
                  "French",
                  "German",
                  "Portuguese",
                  "Italian",
                  "Dutch",
                  "Arabic",
                  "Hindi",
                  "Japanese",
                  "Korean",
                  "Chinese (Simplified)",
                  "Russian",
                  "Turkish",
                ].map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* CTA Style */}
            <div className="space-y-1.5">
              <label htmlFor="ctaStyle" className="label mb-0 flex items-center gap-1.5">
                Call-to-Action Style
                <span className="text-[10px] font-normal text-slate-500">(optional)</span>
              </label>
              <input
                id="ctaStyle"
                type="text"
                value={constraints.ctaStyle ?? ""}
                onChange={(e) => onConstraintChange({ ctaStyle: e.target.value })}
                placeholder="e.g. 'Shop Now', 'Grab Your Pair', action-oriented"
                maxLength={100}
                disabled={isLoading}
                className="input text-sm"
              />
              <p className="text-[10px] text-slate-500">
                Describe the style or provide example CTA phrases for the AI to follow.
              </p>
            </div>

            {/* Reset Advanced */}
            <button
              type="button"
              onClick={() =>
                onConstraintChange({
                  emailLength: "standard",
                  smsLimit: 160,
                  emojiStyle: "balanced",
                  language: "English",
                  ctaStyle: "",
                })
              }
              className="text-xs text-slate-600 hover:text-red-400 transition-colors"
              disabled={isLoading}
            >
              Reset to defaults
            </button>
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        ref={submitRef}
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full mt-2"
        id="generate-campaign-btn"
      >
        {isLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Creating your campaign…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Generate Campaign Copy
          </>
        )}
      </button>

      <p className="text-xs text-slate-600 text-center">
        Press{" "}
        <kbd className="px-1 py-0.5 text-xs bg-slate-800 border border-slate-700 rounded">
          Ctrl
        </kbd>
        +
        <kbd className="px-1 py-0.5 text-xs bg-slate-800 border border-slate-700 rounded">
          Enter
        </kbd>{" "}
        to generate
      </p>
    </form>
  );
}
