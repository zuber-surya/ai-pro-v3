"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { getAccessToken, getCurrentUser } from "@/lib/auth";
import { searchThumbSrc, type AiSearchResultItem } from "@/lib/api";

function formatPrice(amount: string, currency: string) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return `${currency} ${amount}`;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function SearchResultCard({
  item,
  view,
  showMatch = true,
}: {
  item: AiSearchResultItem;
  view: "grid" | "list";
  /** Hide match % / reasons in filter-fallback mode (SCR-SEARCH-FB). */
  showMatch?: boolean;
}) {
  const router = useRouter();
  const thumb = searchThumbSrc(item.thumbnailUrl);
  const reasons = showMatch ? (item.matchReasons?.slice(0, 3) ?? []) : [];
  const score = showMatch ? item.matchScorePercent : null;

  function onFavorite(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!getAccessToken() && !getCurrentUser()) {
      router.push(`/login?next=${encodeURIComponent(`/properties/${item.propertyId}`)}`);
      return;
    }
    // Favorites API lands in FEAT-06-01
    window.alert("Favorites will be available soon.");
  }

  if (view === "list") {
    return (
      <Link
        href={`/properties/${item.propertyId}`}
        className="group flex flex-col overflow-hidden rounded-xl border border-transparent bg-surface-container-lowest shadow-level-1 transition-all duration-300 hover:border-primary/20 sm:flex-row"
      >
        <div className="relative h-48 w-full flex-shrink-0 overflow-hidden sm:h-auto sm:w-64">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full min-h-48 items-center justify-center bg-surface-container-high text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl" aria-hidden>
                image
              </span>
            </div>
          )}
          {score != null ? (
            <div className="absolute bottom-md left-md flex items-center gap-xs rounded-full bg-secondary/90 px-3 py-1 text-label-sm text-white backdrop-blur-sm">
              <span className="material-symbols-outlined text-[14px]" aria-hidden>
                auto_awesome
              </span>
              {score}% Match
            </div>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-sm p-lg">
          <div className="flex items-start justify-between gap-md">
            <div>
              <h4 className="font-headline-md text-[20px] text-on-surface">
                {formatPrice(item.priceAmount, item.priceCurrency)}
              </h4>
              <p className="mt-xs font-body-md text-on-surface">{item.title}</p>
              <p className="text-body-sm text-on-surface-variant line-clamp-1">
                {[item.city, item.propertyType].filter(Boolean).join(" · ")}
              </p>
            </div>
            <button
              type="button"
              aria-label="Save favorite"
              onClick={onFavorite}
              className="rounded-full bg-surface-container-low p-2 text-on-surface-variant transition-colors hover:text-error"
            >
              <span className="material-symbols-outlined" aria-hidden>
                favorite
              </span>
            </button>
          </div>
          <div className="mt-base flex items-center gap-md border-t border-outline-variant/30 pt-md">
            <span className="flex items-center gap-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]" aria-hidden>
                bed
              </span>
              <span className="text-label-md">{item.bedrooms}</span>
            </span>
            <span className="flex items-center gap-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]" aria-hidden>
                bathtub
              </span>
              <span className="text-label-md">{item.bathrooms}</span>
            </span>
            <span className="flex items-center gap-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]" aria-hidden>
                square_foot
              </span>
              <span className="text-label-md">{item.areaSqFt.toLocaleString()} sqft</span>
            </span>
          </div>
          {reasons.length > 0 ? (
            <ul className="mt-sm space-y-xs">
              {reasons.map((r) => (
                <li
                  key={r.label}
                  className="flex items-center gap-xs text-label-sm text-on-surface-variant"
                >
                  <span
                    className={`material-symbols-outlined text-[16px] ${r.matched ? "text-primary" : "text-outline"}`}
                    aria-hidden
                  >
                    {r.matched ? "check_circle" : "cancel"}
                  </span>
                  {r.label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/properties/${item.propertyId}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-transparent bg-surface-container-lowest shadow-level-1 transition-all duration-300 hover:border-primary/20"
    >
      <div className="relative h-56 w-full overflow-hidden">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-surface-container-high text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl" aria-hidden>
              image
            </span>
          </div>
        )}
        <div className="absolute right-md top-md">
          <button
            type="button"
            aria-label="Save favorite"
            onClick={onFavorite}
            className="rounded-full bg-surface-container-lowest/80 p-2 text-on-surface-variant shadow-sm backdrop-blur-sm transition-colors hover:text-error"
          >
            <span className="material-symbols-outlined" aria-hidden>
              favorite
            </span>
          </button>
        </div>
        {score != null ? (
          <div className="absolute bottom-md left-md flex items-center gap-xs rounded-full bg-secondary/90 px-3 py-1 text-label-sm text-white backdrop-blur-sm">
            <span className="material-symbols-outlined text-[14px]" aria-hidden>
              auto_awesome
            </span>
            {score}% Match
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-sm p-lg">
        <div className="flex items-start justify-between">
          <h4 className="font-headline-md text-[20px] text-on-surface">
            {formatPrice(item.priceAmount, item.priceCurrency)}
          </h4>
          <span className="rounded bg-primary-container/10 px-2 py-0.5 text-label-sm uppercase text-primary">
            {item.propertyType}
          </span>
        </div>
        <p className="font-body-sm text-on-surface line-clamp-1">{item.title}</p>
        <p className="text-body-sm text-on-surface-variant line-clamp-1">{item.city ?? "—"}</p>
        <div className="mt-base flex items-center gap-md border-t border-outline-variant/30 pt-md">
          <span className="flex items-center gap-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]" aria-hidden>
              bed
            </span>
            <span className="text-label-md">{item.bedrooms}</span>
          </span>
          <span className="flex items-center gap-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]" aria-hidden>
              bathtub
            </span>
            <span className="text-label-md">{item.bathrooms}</span>
          </span>
          <span className="flex items-center gap-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]" aria-hidden>
              square_foot
            </span>
            <span className="text-label-md">{item.areaSqFt.toLocaleString()} sqft</span>
          </span>
        </div>
        {reasons.length > 0 ? (
          <ul className="space-y-xs pt-xs">
            {reasons.map((r) => (
              <li
                key={r.label}
                className="flex items-center gap-xs text-label-sm text-on-surface-variant"
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${r.matched ? "text-primary" : "text-outline"}`}
                  aria-hidden
                >
                  {r.matched ? "check_circle" : "cancel"}
                </span>
                {r.label}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Link>
  );
}
