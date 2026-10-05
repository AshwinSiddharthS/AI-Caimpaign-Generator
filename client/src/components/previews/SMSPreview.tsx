import { CopyButton } from "../common/CopyButton.js";
import { RegenerateButton } from "../common/RegenerateButton.js";
import type { CampaignOutput, CampaignInput, RegenerateTarget } from "@campaign-ai/shared";

interface SMSPreviewProps {
  sms: CampaignOutput["sms"];
  submittedInput?: CampaignInput | null;
  isRegenerating: boolean;
  error?: string;
  onRegenerate: (target: RegenerateTarget) => void;
}

export function SMSPreview({
  sms,
  submittedInput,
  isRegenerating,
  error,
  onRegenerate,
}: SMSPreviewProps) {
  const limit = submittedInput?.constraints?.smsLimit ?? 160;
  const isOverLimit = sms.characterCount > limit;
  const isNearLimit = sms.characterCount > limit * 0.875;
  const pct = Math.min((sms.characterCount / limit) * 100, 100);

  return (
    <section aria-label="SMS Message">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded bg-orange-600/20 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-white">SMS Message</h3>
        {limit !== 160 && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-600/10 text-orange-400 border border-orange-500/20">
            {limit}-char limit
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          <CopyButton text={sms.message} label="Copy SMS" />
          <RegenerateButton
            onRegenerate={() => onRegenerate({ section: "sms" })}
            isRegenerating={isRegenerating}
          />
        </div>
      </div>

      <div className="card p-4 animate-slide-up">
        {isRegenerating ? (
          <div className="space-y-2">
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-5/6 rounded" />
            <p className="text-xs text-slate-500 mt-1">Creating a new variation…</p>
          </div>
        ) : (
          <>
            {/* SMS bubble */}
            <div className="bg-slate-800/40 rounded-lg p-3 mb-3">
              <div className="flex justify-start">
                <div className="max-w-xs bg-slate-700 rounded-lg rounded-tl-sm px-3.5 py-2.5 shadow-sm">
                  <p className="text-sm text-white leading-relaxed">{sms.message}</p>
                </div>
              </div>
            </div>

            {/* Character count with progress bar */}
            <div
              className={`rounded-md px-3 py-2 text-xs
                ${isOverLimit
                  ? "bg-red-950/50 border border-red-800"
                  : isNearLimit
                  ? "bg-amber-950/30 border border-amber-800/50"
                  : "bg-slate-800/50"
                }`}
              role={isOverLimit ? "alert" : "status"}
              aria-label={`SMS character count: ${sms.characterCount} of ${limit}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`flex items-center gap-1.5 font-medium ${
                  isOverLimit ? "text-red-300" : isNearLimit ? "text-amber-300" : "text-slate-400"
                }`}>
                  {isOverLimit && (
                    <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  {sms.characterCount} / {limit} characters
                </span>
                {isOverLimit && <span className="text-red-400 font-medium">Over limit — regenerate</span>}
                {isNearLimit && !isOverLimit && <span className="text-amber-400">Near limit</span>}
                {!isNearLimit && <span className="text-slate-600">{limit - sms.characterCount} remaining</span>}
              </div>
              {/* Progress bar */}
              <div className="h-1 rounded-full bg-slate-700/60 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOverLimit
                      ? "bg-red-500"
                      : isNearLimit
                      ? "bg-amber-400"
                      : "bg-brand-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </>
        )}

        {error && !isRegenerating && (
          <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error} —{" "}
            <button type="button" className="text-brand-400 hover:text-brand-300 underline"
              onClick={() => onRegenerate({ section: "sms" })}>
              Retry
            </button>
          </p>
        )}
      </div>
    </section>
  );
}
