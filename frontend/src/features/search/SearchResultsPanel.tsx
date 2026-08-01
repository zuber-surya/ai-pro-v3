"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AppError,
  aiSearch,
  type AiSearchFilters,
  type AiSearchResponse,
} from "@/lib/api";
import { Skeleton } from "@/components/states/Skeleton";
import { ErrorState } from "@/components/states/ErrorState";
import { SearchResultCard } from "./SearchResultCard";
import {
  DEFAULT_SEARCH_FILTERS,
  SearchFiltersPanel,
  type SearchUiFilters,
} from "./SearchFiltersPanel";

function toApiFilters(ui: SearchUiFilters): AiSearchFilters {
  const filters: AiSearchFilters = {};
  if (ui.minPrice.trim()) filters.minPrice = ui.minPrice.trim();
  if (ui.maxPrice.trim()) filters.maxPrice = ui.maxPrice.trim();
  if (ui.bedrooms != null) filters.bedrooms = ui.bedrooms;
  if (ui.amenities.length) filters.amenities = ui.amenities;
  if (ui.propertyTypes.length === 1) filters.propertyType = ui.propertyTypes[0];
  return filters;
}

function parsePriceSort(results: AiSearchResponse["results"], sort: string) {
  const copy = [...results];
  if (sort === "price_asc") {
    copy.sort((a, b) => Number(a.priceAmount) - Number(b.priceAmount));
  } else if (sort === "price_desc") {
    copy.sort((a, b) => Number(b.priceAmount) - Number(a.priceAmount));
  }
  return copy;
}

export function SearchResultsPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [queryInput, setQueryInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery || "3BHK apartment");
  const [filters, setFilters] = useState<SearchUiFilters>(DEFAULT_SEARCH_FILTERS);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("relevance");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AiSearchResponse | null>(null);
  const [filterTick, setFilterTick] = useState(0);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q != null && q !== query) {
      setQuery(q);
      setQueryInput(q);
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);

    (async () => {
      try {
        const res = await aiSearch({
          query: query.trim() || "apartment",
          mode: "ai",
          filters: toApiFilters(filters),
          page,
          pageSize: 12,
        });
        if (cancelled) return;
        setData(res);
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof AppError ? e.message : "Search failed");
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query, page, filterTick]); // filters applied via Apply / debounce tick

  function applyFilters() {
    setPage(1);
    setFilterTick((n) => n + 1);
  }

  function clearFilters() {
    setFilters(DEFAULT_SEARCH_FILTERS);
    setPage(1);
    setFilterTick((n) => n + 1);
  }

  function onSearchSubmit(e: FormEvent) {
    e.preventDefault();
    const next = queryInput.trim();
    setQuery(next || "apartment");
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("q", next);
    else params.delete("q");
    router.replace(`${pathname}?${params.toString()}`);
  }

  const results = useMemo(() => {
    if (!data) return [];
    let rows = data.results;
    if (filters.propertyTypes.length > 1) {
      rows = rows.filter((r) =>
        filters.propertyTypes.some((t) =>
          r.propertyType.toLowerCase().includes(t.toLowerCase()),
        ),
      );
    }
    return parsePriceSort(rows, sort);
  }, [data, sort, filters.propertyTypes]);

  const heading =
    data?.queryInterpretation ||
    (query ? `Results for “${query}”` : "Search results");

  const from = data ? (data.meta.page - 1) * data.meta.pageSize + (results.length ? 1 : 0) : 0;
  const to = data ? Math.min(data.meta.page * data.meta.pageSize, data.meta.total) : 0;

  return (
    <main className="mx-auto flex w-full max-w-container-max flex-grow flex-col gap-gutter px-margin-mobile py-lg md:flex-row md:px-lg">
      <div className="flex w-full flex-col gap-md md:w-72 md:flex-shrink-0">
        <form onSubmit={onSearchSubmit} className="md:hidden">
          <label className="sr-only" htmlFor="search-q-mobile">
            Search
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">
              search
            </span>
            <input
              id="search-q-mobile"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 text-body-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Search properties..."
            />
          </div>
        </form>
        <SearchFiltersPanel
          filters={filters}
          onChange={setFilters}
          onClear={clearFilters}
        />
        <button
          type="button"
          onClick={applyFilters}
          className="rounded-lg bg-primary px-md py-sm font-label-md text-on-primary hover:opacity-90 md:w-full"
        >
          Apply filters
        </button>
      </div>

      <section className="flex-grow">
        <div className="mb-lg flex flex-col justify-between gap-md sm:flex-row sm:items-center">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">{heading}</h1>
            {status === "ready" && data ? (
              <p className="text-body-sm text-on-surface-variant">
                Showing {from}-{to} of {data.meta.total} properties matching your criteria
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-sm self-end sm:self-auto">
            <form onSubmit={onSearchSubmit} className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">
                search
              </span>
              <input
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                className="w-64 rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 text-body-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Search property..."
                aria-label="Search properties"
              />
            </form>
            <div className="flex rounded-lg bg-surface-container-high p-1">
              <button
                type="button"
                aria-label="Grid view"
                aria-pressed={view === "grid"}
                className={`rounded-md p-2 ${view === "grid" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                onClick={() => setView("grid")}
              >
                <span className="material-symbols-outlined" aria-hidden>
                  grid_view
                </span>
              </button>
              <button
                type="button"
                aria-label="List view"
                aria-pressed={view === "list"}
                className={`rounded-md p-2 ${view === "list" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                onClick={() => setView("list")}
              >
                <span className="material-symbols-outlined" aria-hidden>
                  format_list_bulleted
                </span>
              </button>
            </div>
            <div className="relative">
              <select
                className="cursor-pointer appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest py-2.5 pl-3 pr-10 text-body-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort results"
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {data?.mode === "fallback" && data.bannerMessage ? (
          <div
            className="mb-lg rounded-xl border border-outline-variant bg-surface-container px-lg py-md text-body-sm text-on-surface"
            role="status"
          >
            {data.bannerMessage}
          </div>
        ) : null}

        {status === "loading" ? (
          <div
            className="grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-3"
            aria-busy
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-outline-variant">
                <Skeleton className="h-56 w-full rounded-none" />
                <div className="space-y-sm p-lg">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {status === "error" ? (
          <ErrorState
            title="Search unavailable"
            message={error ?? "Please try again."}
            onRetry={() => setFilterTick((n) => n + 1)}
          />
        ) : null}

        {status === "ready" && results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low px-lg py-xl text-center">
            <span className="material-symbols-outlined mb-md text-4xl text-outline" aria-hidden>
              search_off
            </span>
            <h2 className="font-headline-md text-headline-md">No matching properties</h2>
            <p className="mt-xs text-body-md text-on-surface-variant">
              Try clearing filters or refining your search.
            </p>
          </div>
        ) : null}

        {status === "ready" && results.length > 0 ? (
          <>
            <div
              className={
                view === "grid"
                  ? "grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-3"
                  : "flex flex-col gap-lg"
              }
            >
              {results.map((item) => (
                <SearchResultCard key={item.propertyId} item={item} view={view} />
              ))}
            </div>

            {data && data.meta.totalPages > 1 ? (
              <nav
                className="mt-xl flex items-center justify-center gap-sm"
                aria-label="Pagination"
              >
                <button
                  type="button"
                  className="rounded-lg border border-outline-variant px-md py-sm font-label-md disabled:opacity-40"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span className="px-md text-body-sm text-on-surface-variant">
                  Page {data.meta.page} of {data.meta.totalPages}
                </span>
                <button
                  type="button"
                  className="rounded-lg border border-outline-variant px-md py-sm font-label-md disabled:opacity-40"
                  disabled={page >= data.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </nav>
            ) : null}
          </>
        ) : null}
      </section>
    </main>
  );
}
