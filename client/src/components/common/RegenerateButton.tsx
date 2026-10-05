interface RegenerateButtonProps {
  onRegenerate: () => void;
  isRegenerating: boolean;
  className?: string;
}

export function RegenerateButton({
  onRegenerate,
  isRegenerating,
  className = "",
}: RegenerateButtonProps) {
  return (
    <button
      type="button"
      onClick={onRegenerate}
      disabled={isRegenerating}
      className={`btn-ghost text-xs disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      aria-label={isRegenerating ? "Generating new variation..." : "Generate a new variation"}
      title="Generate a different variation"
    >
      {isRegenerating ? (
        <>
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Generating…
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Regenerate
        </>
      )}
    </button>
  );
}
