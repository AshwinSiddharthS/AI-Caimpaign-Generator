import { CopyButton } from "../common/CopyButton.js";
import { RegenerateButton } from "../common/RegenerateButton.js";
import type { CampaignOutput, CampaignInput, RegenerateTarget } from "@campaign-ai/shared";

interface EmailPreviewProps {
  email: CampaignOutput["promotionalEmail"];
  submittedInput?: CampaignInput | null;
  isRegenerating: boolean;
  error?: string;
  onRegenerate: (target: RegenerateTarget) => void;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getEmailLengthRange(
  emailLength?: string
): { min: number; max: number; label: string } {
  switch (emailLength) {
    case "short":
      return { min: 50, max: 90, label: "Short" };
    case "detailed":
      return { min: 180, max: 280, label: "Detailed" };
    default:
      return { min: 90, max: 180, label: "Standard" };
  }
}

export function EmailPreview({
  email,
  submittedInput,
  isRegenerating,
  error,
  onRegenerate,
}: EmailPreviewProps) {
  const fullText = `Subject: ${email.subject}\n\n${email.body}\n\nCTA: ${email.cta}`;
  const wordCount = countWords(email.body);
  const lengthRange = getEmailLengthRange(submittedInput?.constraints?.emailLength);
  const isUnderRange = wordCount < lengthRange.min;
  const isOverRange = wordCount > lengthRange.max;
  const wordCountColor = isOverRange || isUnderRange ? "text-amber-400" : "text-green-400";

  return (
    <section aria-label="Promotional Email">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded bg-blue-600/20 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-white">Promotional Email</h3>
        {submittedInput?.constraints?.emailLength && submittedInput.constraints.emailLength !== "standard" && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-600/10 text-blue-400 border border-blue-500/20">
            {lengthRange.label}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          <CopyButton text={fullText} label="Copy All" />
          <RegenerateButton
            onRegenerate={() => onRegenerate({ section: "email" })}
            isRegenerating={isRegenerating}
          />
        </div>
      </div>

      <div className="card overflow-hidden animate-slide-up">
        {isRegenerating ? (
          <div className="p-5 space-y-3">
            <div className="skeleton h-4 w-2/3 rounded" />
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-5/6 rounded" />
              <div className="skeleton h-3 w-4/6 rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-3/5 rounded" />
            </div>
            <p className="text-xs text-slate-500 text-center pt-1">Creating a new variation…</p>
          </div>
        ) : (
          <>
            {/* Email header bar */}
            <div className="bg-slate-800/60 border-b border-slate-700 px-5 py-3">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <span className="font-medium text-slate-300">From:</span>
                <span>your-brand@example.com</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs font-medium text-slate-300 flex-shrink-0 mt-0.5">Subject:</span>
                <span className="text-sm font-semibold text-white leading-snug">{email.subject}</span>
              </div>
            </div>

            {/* Email body */}
            <div className="px-5 py-4">
              <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {email.body}
              </div>

              {/* CTA button-like element */}
              <div className="mt-5">
                <div className="inline-block bg-brand-600 text-white text-sm font-semibold
                               px-5 py-2.5 rounded-lg cursor-default select-text">
                  {email.cta}
                </div>
              </div>

              {/* Word count */}
              <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-800">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className={`text-xs font-medium ${wordCountColor}`}>
                  {wordCount} words
                </span>
                <span className="text-xs text-slate-600">
                  · Target: {lengthRange.min}–{lengthRange.max} words ({lengthRange.label})
                </span>
                {(isOverRange || isUnderRange) && (
                  <span className="text-xs text-amber-500 ml-auto">
                    {isOverRange ? "Slightly over — regenerate if needed" : "Slightly under target"}
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        {error && !isRegenerating && (
          <div className="px-5 pb-4">
            <p className="text-xs text-red-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error} —{" "}
              <button type="button" className="text-brand-400 hover:text-brand-300 underline"
                onClick={() => onRegenerate({ section: "email" })}>
                Retry
              </button>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
