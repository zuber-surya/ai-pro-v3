"use client";

export type SearchFallbackBannerProps = {
  query: string;
  message?: string;
  onResetSearch: () => void;
  onRefineAi?: () => void;
};

export function SearchFallbackBanner({
  query,
  message,
  onResetSearch,
  onRefineAi,
}: SearchFallbackBannerProps) {
  return (
    <div className="mb-xl space-y-md">
      <div
        className="flex flex-col gap-md rounded-xl border border-secondary/20 bg-secondary-container/10 p-4 sm:flex-row sm:items-center sm:justify-between"
        role="status"
      >
        <div className="flex items-start gap-3 sm:items-center">
          <div className="flex items-center justify-center rounded-lg bg-secondary-container p-1.5">
            <span
              className="material-symbols-outlined text-[20px] text-on-secondary-container"
              aria-hidden
            >
              filter_alt
            </span>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-secondary-container">
              Showing filter-based results
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {message ||
                `AI ranking is temporarily unavailable for “${query}”, so we’ve expanded to filter-matched listings.`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-md">
          {onRefineAi ? (
            <button
              type="button"
              className="font-label-md text-label-md text-primary hover:underline"
              onClick={onRefineAi}
            >
              Refine AI Search
            </button>
          ) : null}
          <button
            type="button"
            className="font-label-md text-label-md text-secondary hover:underline"
            onClick={onResetSearch}
          >
            Reset Search
          </button>
        </div>
      </div>
    </div>
  );
}
