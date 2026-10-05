export function ResultsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Subject lines skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="skeleton w-6 h-6 rounded" />
          <div className="skeleton h-4 w-32 rounded" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="skeleton w-5 h-5 rounded-full flex-shrink-0" />
                <div className="skeleton h-4 rounded flex-1" style={{ width: `${70 + i * 5}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview texts skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="skeleton w-6 h-6 rounded" />
          <div className="skeleton h-4 w-28 rounded" />
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="skeleton w-5 h-5 rounded-full flex-shrink-0" />
                <div className="skeleton h-4 rounded flex-1" style={{ width: `${60 + i * 8}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="skeleton w-6 h-6 rounded" />
          <div className="skeleton h-4 w-36 rounded" />
        </div>
        <div className="card overflow-hidden">
          <div className="bg-slate-800/60 border-b border-slate-700 px-5 py-3 space-y-2">
            <div className="skeleton h-3 w-40 rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
          </div>
          <div className="px-5 py-4 space-y-2">
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-5/6 rounded" />
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-4/5 rounded" />
            <div className="skeleton h-3 w-3/4 rounded" />
            <div className="mt-4 skeleton h-9 w-40 rounded-lg" />
          </div>
        </div>
      </div>

      {/* WhatsApp + SMS skeletons */}
      {["WhatsApp", "SMS"].map((label) => (
        <div key={label}>
          <div className="flex items-center gap-2 mb-3">
            <div className="skeleton w-6 h-6 rounded" />
            <div className="skeleton h-4 w-28 rounded" />
          </div>
          <div className="card p-4 space-y-2">
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-5/6 rounded" />
            <div className="skeleton h-3 w-3/4 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
