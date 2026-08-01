"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { POPULAR_SEARCHES } from "../content";

export function HomeHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function goSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) {
      router.push("/search");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    goSearch(query);
  }

  return (
    <section className="relative flex min-h-[600px] flex-col items-center justify-center overflow-hidden px-margin-mobile py-xl text-center">
      <div className="relative z-10 w-full max-w-4xl">
        <div className="mb-lg inline-flex animate-pulse items-center gap-xs rounded-full border border-ai-accent/20 bg-ai-accent/10 px-sm py-1 text-ai-accent">
          <span className="material-symbols-outlined text-[18px]" aria-hidden>
            auto_awesome
          </span>
          <span className="font-label-sm uppercase tracking-wider">AI-Powered Search Engine</span>
        </div>
        <h1 className="font-display-lg mb-md text-display-lg text-on-surface">
          Find your next home with <span className="text-primary">Intelligence</span>.
        </h1>
        <p className="font-body-lg mx-auto mb-xl max-w-2xl text-body-lg text-on-surface-variant">
          Skip the filters. Just tell our AI exactly what you&apos;re looking for in plain English.
        </p>
        <form
          onSubmit={onSubmit}
          className="mx-auto flex w-full max-w-3xl items-center rounded-xl border-2 border-ai-accent bg-surface-container-lowest p-base shadow-lg transition-all focus-within:ring-4 focus-within:ring-ai-accent/10"
        >
          <div className="pl-md text-ai-accent">
            <span className="material-symbols-outlined" aria-hidden>
              psychology
            </span>
          </div>
          <input
            className="flex-grow border-none bg-transparent px-md py-lg text-body-lg placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0"
            placeholder="Try '3BHK under 80 lakhs near tech park'"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="AI property search"
          />
          <div className="flex items-center gap-sm pr-sm">
            <button
              type="button"
              className="rounded-full p-sm text-on-surface-variant transition-colors hover:bg-ai-accent/5 hover:text-ai-accent"
              aria-label="Voice search (coming soon)"
              title="Voice search coming soon"
            >
              <span className="material-symbols-outlined" aria-hidden>
                mic
              </span>
            </button>
            <button
              type="submit"
              className="flex items-center gap-xs rounded-lg bg-ai-accent px-lg py-md font-label-md text-white shadow-md transition-all hover:bg-ai-accent/90 active:scale-95"
            >
              <span>Get matched</span>
            </button>
          </div>
        </form>
        <div className="mt-lg flex flex-wrap justify-center gap-sm">
          <span className="font-label-sm text-on-surface-variant">Popular searches:</span>
          {POPULAR_SEARCHES.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => goSearch(chip)}
              className="font-label-sm text-primary hover:underline"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
