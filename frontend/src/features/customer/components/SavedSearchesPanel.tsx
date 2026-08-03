"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AppError,
  deleteSavedSearch,
  listSavedSearches,
  savedSearchHref,
  type SavedSearch,
} from "@/lib/api";
import { EmptyState, ErrorState, Loader } from "@/components/states";
import { Button } from "@/components/ui/Button";

export function SavedSearchesPanel() {
  const [items, setItems] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await listSavedSearches({ page: 1, pageSize: 50 });
      setItems(res.data);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Could not load saved searches.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function onDelete(id: string) {
    try {
      await deleteSavedSearch(id);
      setItems((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Could not delete.");
    }
  }

  return (
    <section className="space-y-md rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
      <div className="flex items-center justify-between gap-md">
        <h2 className="font-headline-md text-headline-md text-on-surface">Saved searches</h2>
        <Link href="/search" className="font-label-md text-primary hover:underline">
          New search
        </Link>
      </div>

      {loading ? (
        <Loader label="Loading saved searches" />
      ) : error ? (
        <ErrorState title="Saved searches unavailable" message={error} onRetry={() => void refresh()} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No saved searches yet"
          description='Run a search and click "Save search".'
          action={
            <Link href="/search" className="font-label-md text-primary hover:underline">
              Go to search
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-outline-variant">
          {items.map((item) => {
            const q =
              (typeof item.criteria.query === "string" && item.criteria.query) ||
              (typeof item.criteria.q === "string" && item.criteria.q) ||
              "";
            return (
              <li key={item.id} className="flex items-center justify-between gap-md py-md">
                <div className="min-w-0">
                  <Link
                    href={savedSearchHref(item.criteria)}
                    className="font-label-md text-on-surface hover:text-primary"
                  >
                    {item.name}
                  </Link>
                  {q ? (
                    <p className="truncate text-body-sm text-on-surface-variant">{q}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-sm">
                  <Link
                    href={savedSearchHref(item.criteria)}
                    className="font-label-sm text-primary hover:underline"
                  >
                    Open
                  </Link>
                  <Button type="button" variant="ghost" onClick={() => void onDelete(item.id)}>
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
