import { useState, useCallback } from "react";
import type { CampaignInput, RegenerateTarget } from "@campaign-ai/shared";
import { Header } from "./components/common/Header.js";
import { CampaignForm } from "./components/form/CampaignForm.js";
import { ResultsPanel } from "./components/results/ResultsPanel.js";
import { CampaignHistoryModal } from "./components/common/CampaignHistoryModal.js";
import { useCampaign } from "./hooks/useCampaign.js";

export default function App() {
  const {
    state,
    updateForm,
    updateConstraints,
    fillExample,
    generate,
    regenerate,
    restoreCampaign,
    deleteHistoryItem,
    clearHistory,
  } = useCampaign();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleSubmit = useCallback(
    async (input: CampaignInput) => {
      await generate(input);
    },
    [generate]
  );

  const handleRegenerate = useCallback(
    async (target: RegenerateTarget) => {
      await regenerate(target);
    },
    [regenerate]
  );

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-x-hidden">
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-brand-600/5 blur-[120px] animate-glow-pulse" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-500/4 blur-[100px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/3 blur-[100px] animate-glow-pulse" style={{ animationDelay: "3s" }} />
      </div>

      <Header
        historyCount={state.history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stale banner — visible above panels on mobile */}
        {state.isStale && state.result && (
          <div className="mb-4 rounded-lg border border-amber-800/50 bg-amber-950/30 px-4 py-3
                          text-sm text-amber-300 flex items-center gap-2 lg:hidden">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Campaign inputs changed. Generate again to update the copy.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start">
          {/* Form panel */}
          <div className="card p-6 lg:sticky lg:top-24">
            <CampaignForm
              state={state}
              onFieldChange={updateForm}
              onConstraintChange={updateConstraints}
              onFillExample={fillExample}
              onSubmit={handleSubmit}
            />
          </div>

          {/* Results panel */}
          <div className="min-w-0">
            <ResultsPanel
              status={state.status}
              result={state.result}
              submittedInput={state.submittedInput}
              isStale={state.isStale}
              regenerating={state.regenerating}
              regenErrors={state.regenErrors}
              onRegenerate={handleRegenerate}
            />
          </div>
        </div>
      </main>

      <CampaignHistoryModal
        isOpen={isHistoryOpen}
        history={state.history}
        onClose={() => setIsHistoryOpen(false)}
        onRestore={restoreCampaign}
        onDelete={deleteHistoryItem}
        onClear={clearHistory}
      />
    </div>
  );
}
