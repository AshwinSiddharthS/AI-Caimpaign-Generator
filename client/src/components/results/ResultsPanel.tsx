import { useState } from "react";
import type { CampaignOutput, CampaignInput, RegenerateTarget } from "@campaign-ai/shared";
import { SubjectLines } from "./SubjectLines.js";
import { PreviewTexts } from "./PreviewTexts.js";
import { EmailPreview } from "../previews/EmailPreview.js";
import { WhatsAppPreview } from "../previews/WhatsAppPreview.js";
import { SMSPreview } from "../previews/SMSPreview.js";
import { ResultsSkeleton } from "./ResultsSkeleton.js";
import { exportMarkdown } from "../../utils/exportMarkdown.js";
import { exportPDF } from "../../utils/exportPDF.js";

interface ResultsPanelProps {
  status: "idle" | "loading" | "success" | "error";
  result: CampaignOutput | null;
  submittedInput: CampaignInput | null;
  isStale: boolean;
  regenerating: Set<string>;
  regenErrors: Record<string, string>;
  onRegenerate: (target: RegenerateTarget) => void;
}

const CHANNEL_CONFIG = [
  {
    label: "Email",
    subtitle: "5 subject lines + body",
    color: "blue",
    bg: "bg-blue-600/10",
    border: "border-blue-500/20",
    dot: "bg-blue-400",
    text: "text-blue-400",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    subtitle: "Message + CTA",
    color: "green",
    bg: "bg-green-600/10",
    border: "border-green-500/20",
    dot: "bg-green-400",
    text: "text-green-400",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    label: "SMS",
    subtitle: "160-char optimized",
    color: "orange",
    bg: "bg-orange-600/10",
    border: "border-orange-500/20",
    dot: "bg-orange-400",
    text: "text-orange-400",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
];

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      {/* Animated icon with glow */}
      <div className="relative mb-7 animate-float">
        <div className="absolute inset-0 rounded-2xl bg-brand-500/20 blur-xl animate-glow-pulse" />
        <div className="relative w-18 h-18 w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600
                        flex items-center justify-center shadow-lg shadow-brand-900/40 border border-brand-500/30">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
        Your campaign copy will appear here
      </h3>
      <p className="text-sm text-slate-400 max-w-sm mb-8 leading-relaxed">
        Fill in your campaign details on the left and click{" "}
        <span className="font-semibold text-brand-400">Generate Campaign Copy</span>{" "}
        to get AI-powered marketing content for every channel.
      </p>

      {/* Channel cards */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-8">
        {CHANNEL_CONFIG.map((ch) => (
          <div
            key={ch.label}
            className={`${ch.bg} border ${ch.border} rounded-xl p-3 text-center
                        hover:scale-105 transition-transform duration-200`}
          >
            <div className={`flex justify-center mb-1.5 ${ch.text}`}>{ch.icon}</div>
            <p className={`text-xs font-semibold ${ch.text}`}>{ch.label}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{ch.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap items-center gap-2 justify-center">
        {[
          "✦ One-click copy",
          "✦ Section regeneration",
          "✦ Export PDF & Markdown",
          "✦ Campaign history",
        ].map((feat) => (
          <span key={feat}
            className="text-[11px] font-medium text-slate-500 border border-slate-800
                       bg-slate-900/60 rounded-full px-3 py-1">
            {feat}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ResultsPanel({
  status,
  result,
  submittedInput,
  isStale,
  regenerating,
  regenErrors,
  onRegenerate,
}: ResultsPanelProps) {
  if (status === "loading" && !result) {
    return (
      <div>
        <PanelHeader result={null} submittedInput={null} isStale={false} />
        <ResultsSkeleton />
      </div>
    );
  }

  if (!result) {
    return <EmptyState />;
  }

  return (
    <div>
      <PanelHeader
        result={result}
        submittedInput={submittedInput}
        isStale={isStale}
      />

      <div className="space-y-8">
        <SubjectLines
          lines={result.subjectLines}
          regenerating={regenerating}
          regenErrors={regenErrors}
          onRegenerate={onRegenerate}
        />

        <PreviewTexts
          texts={result.previewTexts}
          regenerating={regenerating}
          regenErrors={regenErrors}
          onRegenerate={onRegenerate}
        />

        <EmailPreview
          email={result.promotionalEmail}
          submittedInput={submittedInput}
          isRegenerating={regenerating.has("email")}
          error={regenErrors["email"]}
          onRegenerate={onRegenerate}
        />

        <WhatsAppPreview
          whatsapp={result.whatsapp}
          isRegenerating={regenerating.has("whatsapp")}
          error={regenErrors["whatsapp"]}
          onRegenerate={onRegenerate}
        />

        <SMSPreview
          sms={result.sms}
          submittedInput={submittedInput}
          isRegenerating={regenerating.has("sms")}
          error={regenErrors["sms"]}
          onRegenerate={onRegenerate}
        />
      </div>
    </div>
  );
}

interface PanelHeaderProps {
  result: CampaignOutput | null;
  submittedInput: CampaignInput | null;
  isStale: boolean;
}

function PanelHeader({ result, submittedInput, isStale }: PanelHeaderProps) {
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = async () => {
    if (!result || !submittedInput) return;

    const fullText = `CAMPAIGN COPY: ${submittedInput.productName}
Offer: ${submittedInput.offer}
Tone: ${submittedInput.tone}

=== EMAIL SUBJECT LINES ===
${result.subjectLines.map((s, i) => `${i + 1}. ${s}`).join("\n")}

=== PREVIEW TEXTS ===
${result.previewTexts.map((p, i) => `${i + 1}. ${p}`).join("\n")}

=== PROMOTIONAL EMAIL ===
Subject: ${result.promotionalEmail.subject}
Body:
${result.promotionalEmail.body}
CTA: ${result.promotionalEmail.cta}

=== WHATSAPP MESSAGE ===
${result.whatsapp.message}
CTA: ${result.whatsapp.cta}

=== SMS MESSAGE (${result.sms.characterCount}/160 chars) ===
${result.sms.message}`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = fullText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-white">Campaign Copy</h2>
        {result && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
            5 Channels Ready
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isStale && (
          <span className="text-xs text-amber-400 flex items-center gap-1.5 bg-amber-950/40 border border-amber-800/50 rounded-full px-2.5 py-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Inputs changed
          </span>
        )}

        {result && submittedInput && (
          <>
            <button
              type="button"
              onClick={handleCopyAll}
              className="btn-ghost text-xs flex items-center gap-1.5"
              title="Copy entire campaign copy to clipboard"
            >
              {copiedAll ? (
                <>
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-400 font-medium">Copied All</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy All</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => exportPDF(submittedInput, result)}
              className="btn-ghost text-xs flex items-center gap-1.5"
              title="Export all campaign copy as a styled PDF"
            >
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Export PDF</span>
            </button>

            <button
              type="button"
              onClick={() => exportMarkdown(submittedInput, result)}
              className="btn-ghost text-xs flex items-center gap-1.5"
              title="Export all campaign copy as Markdown"
            >
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export .md</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
