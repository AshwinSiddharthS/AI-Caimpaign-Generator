import { useCopy } from "../../hooks/useCopy.js";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  variant?: "ghost" | "icon";
}

export function CopyButton({
  text,
  label = "Copy",
  className = "",
  variant = "ghost",
}: CopyButtonProps) {
  const { state, copy } = useCopy();

  const isCopied = state === "copied";
  const isError = state === "error";

  const displayLabel = isCopied ? "Copied!" : isError ? "Failed" : label;

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={() => copy(text)}
        className={`btn-icon ${className}`}
        aria-label={displayLabel}
        title={displayLabel}
      >
        <span aria-live="polite" className="sr-only">{displayLabel}</span>
        {isCopied ? (
          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className={`btn-ghost text-xs ${isCopied ? "text-green-400" : ""} ${className}`}
      aria-live="polite"
    >
      {isCopied ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {displayLabel}
        </>
      )}
    </button>
  );
}
