import type { CampaignInput, CampaignOutput } from "@campaign-ai/shared";
import { exportMarkdown } from "../../utils/exportMarkdown.js";
import { exportPDF } from "../../utils/exportPDF.js";

export interface HistoryItem {
  id: string;
  timestamp: number;
  input: CampaignInput;
  output: CampaignOutput;
}

interface CampaignHistoryModalProps {
  isOpen: boolean;
  history: HistoryItem[];
  onClose: () => void;
  onRestore: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function CampaignHistoryModal({
  isOpen,
  history,
  onClose,
  onRestore,
  onDelete,
  onClear,
}: CampaignHistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Campaign History</h3>
              <p className="text-xs text-slate-400">Saved generations stored locally in your browser</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <svg className="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-sm font-medium text-slate-300">No campaigns generated yet</p>
              <p className="text-xs text-slate-500 mt-1">Generated campaigns will automatically be saved here.</p>
            </div>
          ) : (
            history.map((item) => {
              const formattedDate = new Date(item.timestamp).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={item.id}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{item.input.productName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {item.input.campaignObjective}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {item.input.offer}
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {item.input.tone} Tone
                        </span>
                        <span className="text-[11px] text-slate-500">{formattedDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => {
                          onRestore(item);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 text-xs font-medium bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => exportPDF(item.input, item.output)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        title="Export PDF"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => exportMarkdown(item.input, item.output)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        title="Export Markdown"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                        title="Delete from history"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        {history.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>{history.length} saved campaign{history.length > 1 ? "s" : ""}</span>
            <button
              onClick={onClear}
              className="text-red-400 hover:text-red-300 hover:underline transition"
            >
              Clear All History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
