"use client";

import { Loader2, ChevronDown, PackageCheck } from "lucide-react";

export default function PaginationControls({
  loading,
  hasMore,
  onLoadMore,
  count,
}) {
  if (count === 0) return null;

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      {!hasMore && count > 0 && (
        <div className="flex items-center gap-2 text-sm text-ink-400">
          <PackageCheck size={16} />
          <span>No more listings to show</span>
        </div>
      )}

      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-ink-900 px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Load More
            </>
          )}
        </button>
      )}
    </div>
  );
}
