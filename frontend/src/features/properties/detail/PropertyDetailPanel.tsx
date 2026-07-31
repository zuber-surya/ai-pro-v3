"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  AppError,
  getProperty,
  getSimilarProperties,
  propertyMediaSrc,
  type Property,
  type PropertyDetail,
  type PropertyLandmark,
} from "@/lib/api";
import { Skeleton } from "@/components/states/Skeleton";
import { ErrorState } from "@/components/states/ErrorState";

const MapSection = dynamic(
  () => import("./MapSection").then((m) => ({ default: m.MapSection })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-80 w-full rounded-xl" />,
  },
);

function formatPrice(price: string, currency: string) {
  const n = Number(price);
  if (!Number.isFinite(n)) return `${currency} ${price}`;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${price}`;
  }
}

function formatAddress(p: PropertyDetail) {
  return [p.address.line, p.address.city, p.address.region].filter(Boolean).join(", ");
}

function amenityIcon(name: string): string {
  const key = name.toLowerCase();
  if (key.includes("pool")) return "pool";
  if (key.includes("gym") || key.includes("fitness")) return "fitness_center";
  if (key.includes("park")) return "local_parking";
  if (key.includes("secur")) return "security";
  if (key.includes("garden")) return "yard";
  if (key.includes("elevator") || key.includes("lift")) return "elevator";
  if (key.includes("pet")) return "pets";
  if (key.includes("power") || key.includes("backup")) return "bolt";
  if (key.includes("club")) return "villa";
  if (key.includes("balcon")) return "balcony";
  return "check_circle";
}

function landmarkCategoryIcon(category: string | null): string {
  const key = (category ?? "").toLowerCase();
  if (key.includes("school")) return "school";
  if (key.includes("park")) return "forest";
  if (key.includes("transit") || key.includes("metro") || key.includes("train")) return "train";
  return "place";
}

function formatDistance(meters: number | null): string {
  if (meters == null) return "";
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function groupLandmarks(landmarks: PropertyLandmark[]) {
  const groups = new Map<string, PropertyLandmark[]>();
  for (const landmark of landmarks) {
    const key = landmark.category?.trim() || "Nearby";
    const list = groups.get(key) ?? [];
    list.push(landmark);
    groups.set(key, list);
  }
  return Array.from(groups.entries());
}

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden>
      {name}
    </span>
  );
}

export function PropertyDetailPanel({ propertyId }: { propertyId: string }) {
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [similar, setSimilar] = useState<Property[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "notFound" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);
    setGalleryIndex(0);

    (async () => {
      try {
        const [detail, similarRes] = await Promise.all([
          getProperty(propertyId),
          getSimilarProperties(propertyId, { page: 1, pageSize: 6 }).catch(() => ({
            data: [] as Property[],
            meta: { page: 1, pageSize: 6, total: 0, totalPages: 1 },
          })),
        ]);
        if (cancelled) return;
        setProperty(detail);
        setSimilar(similarRes.data);
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        if (e instanceof AppError && e.status === 404) {
          setStatus("notFound");
          return;
        }
        setError(e instanceof Error ? e.message : "Failed to load property");
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  const photos = useMemo(
    () => (property?.images ?? []).filter((img) => img.kind === "photo"),
    [property],
  );
  const floorplans = useMemo(
    () => (property?.images ?? []).filter((img) => img.kind === "floorplan"),
    [property],
  );
  const activePhoto = photos[galleryIndex] ?? photos[0];
  const activeSrc = propertyMediaSrc(activePhoto?.url);

  if (status === "loading") {
    return (
      <main className="mx-auto max-w-container-max px-lg py-xl" aria-busy>
        <Skeleton className="mb-xl aspect-[21/9] w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-xl lg:grid-cols-12">
          <div className="space-y-lg lg:col-span-8">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (status === "notFound") {
    return (
      <main className="mx-auto max-w-container-max px-lg py-xl">
        <ErrorState
          title="Property not found"
          message="This listing is unavailable or no longer published."
        />
        <Link href="/" className="mt-lg inline-block font-label-md text-primary">
          Back to home
        </Link>
      </main>
    );
  }

  if (status === "error" || !property) {
    return (
      <main className="mx-auto max-w-container-max px-lg py-xl">
        <ErrorState title="Unable to load property" message={error ?? "Please try again."} />
      </main>
    );
  }

  const description = property.description?.trim() ?? "";
  const shortDesc = description.length > 320 && !descExpanded;
  const shownDesc = shortDesc ? `${description.slice(0, 320)}…` : description;

  return (
    <>
      <main className="mx-auto max-w-container-max px-lg py-xl">
        <section className="mb-xl" aria-label="Photo gallery">
          <div className="relative aspect-[21/9] overflow-hidden rounded-xl bg-surface-container-high shadow-level-1">
            {activeSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeSrc}
                alt={activePhoto?.caption || property.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-on-surface-variant">
                <Icon name="image" className="mb-md text-4xl" />
                <p className="font-body-md">No photos yet</p>
              </div>
            )}
            {photos.length > 1 ? (
              <>
                <div className="absolute inset-y-0 left-4 flex items-center">
                  <button
                    type="button"
                    aria-label="Previous photo"
                    className="rounded-full bg-white/90 p-md text-primary shadow-md transition-colors hover:bg-white"
                    onClick={() =>
                      setGalleryIndex((i) => (i - 1 + photos.length) % photos.length)
                    }
                  >
                    <Icon name="chevron_left" />
                  </button>
                </div>
                <div className="absolute inset-y-0 right-4 flex items-center">
                  <button
                    type="button"
                    aria-label="Next photo"
                    className="rounded-full bg-white/90 p-md text-primary shadow-md transition-colors hover:bg-white"
                    onClick={() => setGalleryIndex((i) => (i + 1) % photos.length)}
                  >
                    <Icon name="chevron_right" />
                  </button>
                </div>
              </>
            ) : null}
            {photos.length > 0 ? (
              <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-md py-xs font-label-sm text-white backdrop-blur-md">
                {galleryIndex + 1} / {photos.length} Photos
              </div>
            ) : null}
          </div>
          {photos.length > 1 ? (
            <div className="mt-md flex gap-md overflow-x-auto pb-xs">
              {photos.map((img, idx) => {
                const src = propertyMediaSrc(img.url);
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setGalleryIndex(idx)}
                    className={[
                      "h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg",
                      idx === galleryIndex
                        ? "ring-2 ring-primary"
                        : "opacity-70 transition-opacity hover:opacity-100",
                    ].join(" ")}
                    aria-label={`Show photo ${idx + 1}`}
                    aria-current={idx === galleryIndex}
                  >
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </section>

        <div className="grid grid-cols-1 gap-xl lg:grid-cols-12">
          <div className="space-y-xl lg:col-span-8">
            <section>
              <div className="mb-md flex items-start justify-between gap-lg">
                <div>
                  <h1 className="mb-xs font-headline-lg text-headline-lg text-on-surface">
                    {property.title}
                  </h1>
                  <p className="flex items-center gap-xs font-body-md text-on-surface-variant">
                    <Icon name="location_on" className="text-sm" />
                    {formatAddress(property)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-headline-lg text-headline-lg text-primary">
                    {formatPrice(property.price, property.currency)}
                  </div>
                  <div className="font-label-md text-on-surface-variant">
                    {property.propertyType}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-lg rounded-xl border border-outline-variant bg-surface-container-low p-lg">
                <div className="flex items-center gap-md">
                  <div className="rounded-lg bg-primary-container/20 p-sm">
                    <Icon name="bed" className="text-primary" />
                  </div>
                  <div>
                    <div className="font-headline-md text-headline-md leading-tight">
                      {property.bedrooms}
                    </div>
                    <div className="font-label-sm uppercase tracking-wider text-on-surface-variant">
                      Bedrooms
                    </div>
                  </div>
                </div>
                <div className="hidden h-12 w-px self-center bg-outline-variant sm:block" />
                <div className="flex items-center gap-md">
                  <div className="rounded-lg bg-primary-container/20 p-sm">
                    <Icon name="bathtub" className="text-primary" />
                  </div>
                  <div>
                    <div className="font-headline-md text-headline-md leading-tight">
                      {property.bathrooms}
                    </div>
                    <div className="font-label-sm uppercase tracking-wider text-on-surface-variant">
                      Bathrooms
                    </div>
                  </div>
                </div>
                <div className="hidden h-12 w-px self-center bg-outline-variant sm:block" />
                <div className="flex items-center gap-md">
                  <div className="rounded-lg bg-primary-container/20 p-sm">
                    <Icon name="square_foot" className="text-primary" />
                  </div>
                  <div>
                    <div className="font-headline-md text-headline-md leading-tight">
                      {property.areaSqFt.toLocaleString()}
                    </div>
                    <div className="font-label-sm uppercase tracking-wider text-on-surface-variant">
                      Sq Ft
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {description ? (
              <section>
                <h2 className="mb-md font-headline-md text-headline-md">Property Description</h2>
                <div className="space-y-md font-body-md leading-relaxed text-on-surface-variant">
                  <p className="whitespace-pre-wrap">{shownDesc}</p>
                </div>
                {description.length > 320 ? (
                  <button
                    type="button"
                    className="mt-md flex items-center gap-xs font-label-md text-primary"
                    onClick={() => setDescExpanded((v) => !v)}
                  >
                    {descExpanded ? "Show less" : "Read more"}
                    <Icon name={descExpanded ? "expand_less" : "expand_more"} className="text-sm" />
                  </button>
                ) : null}
              </section>
            ) : null}

            {property.amenities.length > 0 ? (
              <section>
                <h2 className="mb-md font-headline-md text-headline-md">Amenities</h2>
                <div className="flex flex-wrap gap-md">
                  {property.amenities.map((name) => (
                    <div
                      key={name}
                      className="flex items-center gap-xs rounded-lg border border-outline-variant bg-surface-container-highest px-md py-sm"
                    >
                      <Icon name={amenityIcon(name)} className="text-primary" />
                      <span className="font-body-sm">{name}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <h2 className="mb-md font-headline-md text-headline-md">Floor Plan</h2>
              {floorplans[0] && propertyMediaSrc(floorplans[0].url) ? (
                <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={propertyMediaSrc(floorplans[0].url)!}
                    alt={floorplans[0].caption || "Floor plan"}
                    className="max-h-[28rem] w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low">
                  <Icon name="architecture" className="mb-md text-4xl text-outline" />
                  <p className="font-body-md text-on-surface-variant">
                    Floor plan not available for this listing
                  </p>
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-md font-headline-md text-headline-md">Location & Nearby</h2>
              <div className="mb-lg overflow-hidden rounded-xl">
                <MapSection
                  lat={property.lat}
                  lng={property.lng}
                  title={property.title}
                  landmarks={property.landmarks ?? []}
                />
              </div>
              {(property.landmarks ?? []).length > 0 ? (
                <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
                  {groupLandmarks(property.landmarks).map(([category, items]) => (
                    <div key={category} className="space-y-sm">
                      <div className="mb-xs flex items-center gap-xs font-label-md text-primary">
                        <Icon name={landmarkCategoryIcon(category)} className="text-sm" />
                        {category}
                      </div>
                      <ul className="space-y-xs text-body-sm text-on-surface-variant">
                        {items.map((item) => (
                          <li key={item.id} className="flex justify-between gap-md">
                            <span>{item.name}</span>
                            <span>{formatDistance(item.distanceM)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          </div>

          <aside className="space-y-lg lg:col-span-4">
            <div className="sticky top-24 space-y-lg">
              {property.agent ? (
                <div className="rounded-xl border border-outline-variant bg-white p-lg shadow-level-1">
                  <div className="mb-lg flex items-center gap-md">
                    <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-primary-container bg-surface-container">
                      {propertyMediaSrc(property.agent.profileImageUrl) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={propertyMediaSrc(property.agent.profileImageUrl)!}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-primary">
                          <Icon name="person" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-headline-md text-headline-md leading-tight">
                        {property.agent.name}
                      </h3>
                      <p className="font-label-sm text-on-surface-variant">Listing agent</p>
                    </div>
                  </div>
                  <div className="mb-lg space-y-md">
                    {property.agent.phone ? (
                      <div className="flex items-center gap-md text-on-surface-variant">
                        <Icon name="phone" className="text-primary" />
                        <a href={`tel:${property.agent.phone}`} className="font-body-sm">
                          {property.agent.phone}
                        </a>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-md text-on-surface-variant">
                      <Icon name="mail" className="text-primary" />
                      <a href={`mailto:${property.agent.email}`} className="font-body-sm">
                        {property.agent.email}
                      </a>
                    </div>
                  </div>
                  <a
                    href={`mailto:${property.agent.email}?subject=${encodeURIComponent(`Inquiry: ${property.title}`)}`}
                    className="flex w-full items-center justify-center gap-sm rounded-lg bg-primary py-md font-label-md text-white shadow-sm transition-all hover:opacity-90"
                  >
                    <Icon name="chat_bubble" /> Message Agent
                  </a>
                </div>
              ) : null}

              <div className="space-y-md">
                <h3 className="font-label-md uppercase tracking-widest text-on-surface-variant">
                  Similar Properties
                </h3>
                {similar.length === 0 ? (
                  <p className="font-body-sm text-on-surface-variant">No similar listings yet.</p>
                ) : (
                  similar.map((item) => {
                    const cover = propertyMediaSrc(item.coverImageUrl);
                    return (
                      <Link
                        key={item.id}
                        href={`/properties/${item.id}`}
                        className="group block overflow-hidden rounded-xl border border-outline-variant bg-white transition-all hover:shadow-level-2"
                      >
                        <div className="relative h-32 bg-surface-container-high">
                          {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cover}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                          <div className="absolute right-2 top-2 rounded bg-white/90 px-sm py-xs font-label-sm text-primary">
                            {formatPrice(item.price, item.currency)}
                          </div>
                        </div>
                        <div className="p-md">
                          <h4 className="truncate font-label-md font-bold text-on-surface">
                            {item.title}
                          </h4>
                          <p className="text-body-sm text-on-surface-variant">
                            {item.bedrooms} Bed • {item.areaSqFt.toLocaleString()} Sq Ft
                          </p>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 bg-white px-lg py-md shadow-[0_-4px_24px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="mx-auto flex max-w-container-max gap-md">
          <button
            type="button"
            disabled
            title="Available in a later sprint"
            className="flex-1 rounded-lg border border-primary py-md font-label-md text-primary opacity-60"
          >
            Request Callback
          </button>
          <button
            type="button"
            disabled
            title="Available in a later sprint"
            className="flex-1 rounded-lg bg-primary py-md font-label-md text-white opacity-60 shadow-sm"
          >
            Schedule Visit
          </button>
        </div>
      </div>
    </>
  );
}
