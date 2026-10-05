import { CopyButton } from "../common/CopyButton.js";
import { RegenerateButton } from "../common/RegenerateButton.js";
import type { RegenerateTarget } from "@campaign-ai/shared";

interface SubjectLinesProps {
  lines: string[];
  regenerating: Set<string>;
  regenErrors: Record<string, string>;
  onRegenerate: (target: RegenerateTarget) => void;
}

export function SubjectLines({
  lines,
  regenerating,
  regenErrors,
  onRegenerate,
}: SubjectLinesProps) {
  return (
    <section aria-label="Email Subject Lines">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded bg-brand-600/20 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-white">Email Subject Lines</h3>
        <span className="text-xs text-slate-500 ml-auto">5 variations</span>
      </div>

      <div className="space-y-2">
        {lines.map((line, i) => {
          const key = `subjectLine:${i}`;
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
                      <div className="skeleton h-4 w-3/4 rounded" />
                      <p className="text-xs text-slate-500">Creating a new variation…</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-100 leading-relaxed">{line}</p>
                  )}

                  {error && !isRegenerating && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {error}
                      <button
                        type="button"
                        className="text-brand-400 hover:text-brand-300 underline ml-1"
                        onClick={() => onRegenerate({ section: "subjectLine", index: i })}
                      >
                        Retry
                      </button>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <CopyButton text={line} variant="icon" />
                  <RegenerateButton
                    onRegenerate={() => onRegenerate({ section: "subjectLine", index: i })}
                    isRegenerating={isRegenerating}
                  />
                </div>
              </div>
              <div className="mt-1.5 ml-8">
                <span className={`text-xs ${line.length > 60 ? "text-amber-400" : "text-slate-600"}`}>
                  {line.length}/60 chars
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
