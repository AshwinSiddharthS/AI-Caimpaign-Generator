# LLM Conversations Log

This file documents AI prompting decisions made during the CampaignAI build.

---

## Phase 1 — Foundation (2026-10-05)

**Decision: Model selection**
Chose `gemini-2.0-flash` — the current free-tier Flash model that supports JSON structured output via `responseMimeType: "application/json"` and `responseSchema`. Confirmed via search before starting. Model name is read from `AI_MODEL` env var, not hardcoded, so it can be updated without code changes.

**Decision: Structured output**
Using `@google/genai` SDK with `responseSchema` for compile-time JSON enforcement. Also applying Zod validation afterward as a safety net — the schema and Zod are independent validation layers.

**Decision: Prompt injection defence**
Campaign user data is wrapped in `<campaign_data>…</campaign_data>` XML delimiters. The system prompt explicitly tells the model to treat everything inside those tags as plain data and never follow instructions found there. This is a standard and lightweight defence.

**Decision: Quality validation as retry trigger**
Hard quality failures (SMS > 160 chars, duplicates, placeholders, empty strings) trigger a retry rather than silently passing bad output. Max 2 attempts total. The specific errors are fed back to the model as retry feedback, giving it a chance to self-correct.

**Decision: SMS character count**
Computed server-side (`message.length`), never trusted from the AI. This prevents hallucinated or miscounted values from reaching the client.

**Decision: No streaming**
Explicitly cut per the plan. Single-shot generate calls only. Simpler, more reliable, compatible with free-tier rate limits.

---

## Phase 2 — Client UI (2026-10-05)

**Decision: Tailwind + dark theme**
Dark slate color palette (`slate-950` base) with `brand-600` indigo accent. Chosen for professional SaaS appearance that won't clash with campaign copy previews.

**Decision: Sticky form panel**
Form is `lg:sticky lg:top-24` so users can see both their inputs and results simultaneously on desktop without scrolling. On mobile they stack.

**Decision: Per-section regeneration isolation**
Each regeneration has its own `Set<string>` key — only the affected card shows a spinner. All other cards remain fully visible and interactive. The result is swapped in-place using `structuredClone`.

**Decision: Stale detection**
`JSON.stringify` comparison of `form` vs `submittedInput`. Not deeply performant but simple and correct for this use case. Never auto-regenerates — only shows a warning badge.

---

## Model Lifecycle Update (2026-10-05)

**Decision: Update to `gemini-3.5-flash`**
`gemini-2.0-flash` reached end-of-life status. Discovered live supported models via `@google/genai` ModelService and selected `gemini-3.5-flash`, which offers excellent latency, high availability, structured JSON output support, and robust handling of multi-channel marketing prompts.
