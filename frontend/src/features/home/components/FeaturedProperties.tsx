"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getFeaturedProperties,
  propertyMediaSrc,
  type Property,
} from "@/lib/api";
import { Loader } from "@/components/states";

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

export function FeaturedProperties() {
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getFeaturedProperties({ page: 1, pageSize: 8 })
      .then((res) => {
        if (!cancelled) {
          setItems(res.data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Could not load featured properties.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-container-max px-xl py-xl">
      <div className="mb-xl flex items-end justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Curated matches for you
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Properties that align with your lifestyle profile.
          </p>
        </div>
        <Link
          href="/search"
          className="flex items-center gap-xs font-label-md text-primary hover:underline"
        >
          View all <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-xl">
          <Loader />
        </div>
      ) : error ? (
        <p className="font-body-md text-error">{error}</p>
      ) : items.length === 0 ? (
        <p className="font-body-md text-on-surface-variant">
          No featured listings yet.{" "}
          <Link href="/search" className="text-primary hover:underline">
            Browse all properties
          </Link>
          .
        </p>
      ) : (
        <div className="no-scrollbar -mx-xl flex gap-lg overflow-x-auto px-xl pb-lg">
          {items.map((p) => {
            const cover = propertyMediaSrc(p.coverImageUrl);
            const location = [p.address.city, p.address.region].filter(Boolean).join(", ");
            return (
              <Link
                key={p.id}
                href={`/properties/${p.id}`}
                className="group min-w-[320px] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative h-64">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface-container text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl" aria-hidden>
                        apartment
                      </span>
                    </div>
                  )}
                  <span className="absolute bottom-md left-md flex items-center gap-xs rounded-full bg-ai-accent/90 px-sm py-1 text-label-sm text-white backdrop-blur-sm">
                    <span className="material-symbols-outlined text-[14px]" aria-hidden>
                      bolt
                    </span>
                    Featured
                  </span>
                </div>
                <div className="p-lg">
                  <div className="mb-xs flex items-start justify-between gap-sm">
                    <h3 className="font-headline-md text-[20px] text-on-surface">{p.title}</h3>
                    <span className="shrink-0 font-bold text-primary">
                      {formatPrice(p.price, p.currency)}
                    </span>
                  </div>
                  <p className="font-body-sm mb-md flex items-center gap-xs text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]" aria-hidden>
                      location_on
                    </span>
                    {location || p.address.line}
                  </p>
                  <div className="flex items-center gap-md border-t border-outline-variant pt-md">
                    <div className="flex items-center gap-xs font-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]" aria-hidden>
                        bed
                      </span>
                      {p.bedrooms} BHK
                    </div>
                    <div className="flex items-center gap-xs font-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]" aria-hidden>
                        bathtub
                      </span>
                      {p.bathrooms} Bath
                    </div>
                    <div className="flex items-center gap-xs font-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]" aria-hidden>
                        square_foot
                      </span>
                      {p.areaSqFt.toLocaleString("en-IN")} sq.ft
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
