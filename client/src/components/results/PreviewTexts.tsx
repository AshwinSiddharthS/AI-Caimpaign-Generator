import { CopyButton } from "../common/CopyButton.js";
import { RegenerateButton } from "../common/RegenerateButton.js";
import type { RegenerateTarget } from "@campaign-ai/shared";

interface PreviewTextsProps {
  texts: string[];
  regenerating: Set<string>;
  regenErrors: Record<string, string>;
  onRegenerate: (target: RegenerateTarget) => void;
}

export function PreviewTexts({
  texts,
  regenerating,
  regenErrors,
  onRegenerate,
}: PreviewTextsProps) {
  return (
    <section aria-label="Email Preview Texts">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded bg-purple-600/20 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-white">Preview Texts</h3>
        <span className="text-xs text-slate-500 ml-auto">3 variations</span>
      </div>

      <div className="space-y-2">
        {texts.map((text, i) => {
          const key = `previewText:${i}`;
          const isRegenerating = regenerating.has(key);
          const error = regenErrors[key];

          return (
            <div key={i} className="card px-4 py-3 animate-slide-up">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-800 border border-slate-700
                                 text-xs text-slate-400 flex items-center justify-center font-medium mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  {isRegenerating ? (
                    <div className="space-y-1.5">
                      <div className="skeleton h-4 w-2/3 rounded" />
                      <p className="text-xs text-slate-500">Creating a new variation…</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-100 leading-relaxed">{text}</p>
                  )}
                  {error && !isRegenerating && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {error}
                      <button type="button" className="text-brand-400 hover:text-brand-300 underline ml-1"
                        onClick={() => onRegenerate({ section: "previewText", index: i })}>
                        Retry
                      </button>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <CopyButton text={text} variant="icon" />
                  <RegenerateButton
                    onRegenerate={() => onRegenerate({ section: "previewText", index: i })}
                    isRegenerating={isRegenerating}
                  />
                </div>
              </div>
              <div className="mt-1.5 ml-8">
                <span className={`text-xs ${text.length > 100 ? "text-amber-400" : "text-slate-600"}`}>
                  {text.length}/100 chars
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
