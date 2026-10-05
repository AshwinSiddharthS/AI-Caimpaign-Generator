import { CopyButton } from "../common/CopyButton.js";
import { RegenerateButton } from "../common/RegenerateButton.js";
import type { CampaignOutput, RegenerateTarget } from "@campaign-ai/shared";

interface WhatsAppPreviewProps {
  whatsapp: CampaignOutput["whatsapp"];
  isRegenerating: boolean;
  error?: string;
  onRegenerate: (target: RegenerateTarget) => void;
}

export function WhatsAppPreview({
  whatsapp,
  isRegenerating,
  error,
  onRegenerate,
}: WhatsAppPreviewProps) {
  const fullText = `${whatsapp.message}\n\n${whatsapp.cta}`;

  return (
    <section aria-label="WhatsApp Message">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded bg-green-600/20 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-green-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-white">WhatsApp Message</h3>
        <div className="ml-auto flex items-center gap-1">
          <CopyButton text={fullText} label="Copy Message" />
          <RegenerateButton
            onRegenerate={() => onRegenerate({ section: "whatsapp" })}
            isRegenerating={isRegenerating}
          />
        </div>
      </div>

      <div className="card p-4 animate-slide-up">
        {/* Chat bubble preview */}
        <div className="bg-slate-800/40 rounded-lg p-3 mb-3">
          <div className="flex justify-end">
            <div className="max-w-xs bg-[#005c4b] rounded-lg rounded-tr-sm px-3.5 py-2.5 shadow-sm">
              {isRegenerating ? (
                <div className="space-y-1.5 min-w-[160px]">
                  <div className="skeleton h-3 w-full rounded bg-white/20" />
                  <div className="skeleton h-3 w-5/6 rounded bg-white/20" />
                  <div className="skeleton h-3 w-3/4 rounded bg-white/20" />
                  <p className="text-xs text-green-300/70 mt-1">Generating…</p>
                </div>
              ) : (
                <p className="text-sm text-white leading-relaxed whitespace-pre-line">
                  {whatsapp.message}
                </p>
              )}
              <div className="flex justify-end mt-1">
                <span className="text-[10px] text-green-200/60">
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {!isRegenerating && (
          <div className="border-t border-slate-800 pt-3">
            <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Call to Action</p>
            <p className="text-sm text-slate-300">{whatsapp.cta}</p>
          </div>
        )}

        {!isRegenerating && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
            <span className={`text-xs ${whatsapp.message.length > 500 ? "text-amber-400 font-medium" : "text-slate-600"}`}>
              {whatsapp.message.length}/500 chars
              {whatsapp.message.length > 500 && " ⚠ Over limit"}
            </span>
          </div>
        )}

        {error && !isRegenerating && (
          <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error} —{" "}
            <button type="button" className="text-brand-400 hover:text-brand-300 underline"
              onClick={() => onRegenerate({ section: "whatsapp" })}>
              Retry
            </button>
          </p>
        )}
      </div>
    </section>
  );
}
