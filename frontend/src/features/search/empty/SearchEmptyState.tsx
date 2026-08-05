"use client";

const DEFAULT_CHIPS = [
  "Bengaluru",
  "Mumbai",
  "3BHK apartment",
  "Under 1 crore",
  "Recently Added",
] as const;

export type SearchEmptyStateProps = {
  onBroaden: () => void;
  onGuidedMatch: () => void;
  onChip: (chip: string) => void;
  chips?: string[];
};

export function SearchEmptyState({
  onBroaden,
  onGuidedMatch,
  onChip,
  chips = [...DEFAULT_CHIPS],
}: SearchEmptyStateProps) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-lg py-xl text-center">
      <div className="flex w-full max-w-xl flex-col items-center">
        <div className="relative mb-lg flex h-48 w-48 items-center justify-center md:h-64 md:w-64">
          <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-secondary-container opacity-20 blur-xl" />
          <div className="absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-primary-container opacity-10 blur-2xl" />
          <div className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-full bg-surface-container-low p-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/search-magnifying-glass.svg"
              alt=""
              className="h-28 w-28 object-contain md:h-36 md:w-36"
            />
          </div>
        </div>

        <h2 className="mb-sm font-headline-lg text-headline-lg text-on-surface">
          No properties match your filters
        </h2>
        <p className="mb-xl max-w-md font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
          We couldn&apos;t find anything matching your exact criteria. Try broadening your search
          or use guided matching for a tailored result.
        </p>

        <div className="flex w-full flex-col items-center gap-md sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={onBroaden}
            className="w-full rounded-lg border-2 border-outline-variant px-lg py-md text-body-md font-semibold text-on-surface transition-all hover:bg-surface-container-high sm:w-auto"
          >
            Broaden your search
          </button>
          <button
            type="button"
            onClick={onGuidedMatch}
            className="flex w-full items-center justify-center gap-sm rounded-lg bg-primary px-lg py-md text-body-md font-semibold text-on-primary shadow-md transition-all hover:bg-primary-container sm:w-auto"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden
            >
              auto_awesome
            </span>
            Try guided matching instead
          </button>
        </div>

        <div className="mt-xl flex max-w-lg flex-wrap justify-center gap-sm">
          <span className="mb-xs w-full text-label-sm text-outline-variant">Try searching for:</span>
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onChip(chip)}
              className="cursor-pointer rounded-full border border-outline-variant bg-surface px-md py-xs text-body-sm transition-all hover:border-primary"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-xl w-full max-w-xs rounded-xl border border-outline-variant border-l-4 border-l-secondary bg-surface-container-lowest/90 p-lg shadow-lg backdrop-blur-sm 2xl:absolute 2xl:bottom-xl 2xl:right-xl 2xl:mt-0">
        <div className="mb-md flex items-center gap-sm text-secondary">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden
          >
            lightbulb
          </span>
          <span className="font-label-md uppercase tracking-wider">AI Insight</span>
        </div>
        <p className="mb-md text-body-sm leading-tight text-on-surface">
          Based on your filters, try guided matching for listings just outside your current
          criteria.
        </p>
        <button
          type="button"
          onClick={onGuidedMatch}
          className="group flex items-center gap-xs font-label-sm font-semibold text-secondary"
        >
          View suggestions
          <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
}
