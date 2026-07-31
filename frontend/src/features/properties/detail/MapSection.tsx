"use client";

import { useEffect, useRef, useState } from "react";
import type { PropertyLandmark } from "@/lib/api";

export type MapSectionProps = {
  lat: number | null | undefined;
  lng: number | null | undefined;
  title: string;
  landmarks: PropertyLandmark[];
};

export function MapSection({ lat, lng, title, landmarks }: MapSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (lat == null || lng == null || !containerRef.current) return;

    let cancelled = false;
    let map: import("leaflet").Map | null = null;

    (async () => {
      try {
        const L = (await import("leaflet")).default;
        // Leaflet CSS — loaded only on client after dynamic import
        // @ts-expect-error CSS side-effect import has no types
        await import("leaflet/dist/leaflet.css");
        if (cancelled || !containerRef.current) return;

        map = L.map(containerRef.current, {
          scrollWheelZoom: false,
        }).setView([lat, lng], 14);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        L.circleMarker([lat, lng], {
          radius: 10,
          color: "#003d9b",
          fillColor: "#0052cc",
          fillOpacity: 0.9,
          weight: 2,
        })
          .addTo(map)
          .bindPopup(title);

        for (const landmark of landmarks) {
          if (landmark.lat == null || landmark.lng == null) continue;
          L.circleMarker([landmark.lat, landmark.lng], {
            radius: 6,
            color: "#873da6",
            fillColor: "#de8ffd",
            fillOpacity: 0.9,
            weight: 1,
          })
            .addTo(map)
            .bindPopup(
              landmark.category
                ? `${landmark.name} (${landmark.category})`
                : landmark.name,
            );
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
      map = null;
    };
  }, [lat, lng, title, landmarks]);

  if (lat == null || lng == null) {
    return (
      <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-low text-on-surface-variant">
        <span className="material-symbols-outlined mb-md text-4xl text-outline" aria-hidden>
          map
        </span>
        <p className="font-body-md">Map location not set for this listing</p>
      </div>
    );
  }

  if (failed) {
    return (
      <div
        className="flex h-80 flex-col items-center justify-center rounded-xl border border-outline-variant bg-surface-container-low text-on-surface-variant"
        role="status"
      >
        <p className="font-body-md">Map could not be loaded. Address and landmarks remain available below.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-80 w-full rounded-xl shadow-level-1"
      role="img"
      aria-label={`Map for ${title}`}
    />
  );
}
