import { useEffect, useState, useCallback } from "react";
import { checkHealth } from "../../services/api.js";

interface HeaderProps {
  historyCount?: number;
  onOpenHistory?: () => void;
}

export function Header({ historyCount = 0, onOpenHistory }: HeaderProps) {
  const [healthy, setHealthy] = useState<boolean | null>(null);

  const ping = useCallback(async () => {
    const ok = await checkHealth();
    setHealthy(ok);
  }, []);

  useEffect(() => {
    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, [ping]);

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-md shadow-brand-900/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">CampaignAI</h1>
            <p className="text-xs text-slate-400 leading-tight hidden sm:block">
              AI-powered campaign copy for every channel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="btn-ghost text-xs flex items-center gap-1.5"
              title="View saved campaigns history"
            >
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>History</span>
              {historyCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand-600/30 text-brand-300 border border-brand-500/40 text-[10px] flex items-center justify-center font-bold">
                  {historyCount}
                </span>
              )}
            </button>
          )}

          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
              healthy === null
                ? "text-slate-400 border-slate-700 bg-slate-800"
                : healthy
                ? "text-green-400 border-green-800 bg-green-950"
                : "text-red-400 border-red-800 bg-red-950"
            }`}
            title={healthy === null ? "Checking..." : healthy ? "AI is ready" : "AI unavailable"}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                healthy === null
                  ? "bg-slate-400 animate-pulse"
                  : healthy
                  ? "bg-green-400"
                  : "bg-red-400"
              }`}
            />
            {healthy === null ? "Checking" : healthy ? "AI Ready" : "Offline"}
          </span>
        </div>
      </div>
    </header>
  );
}
