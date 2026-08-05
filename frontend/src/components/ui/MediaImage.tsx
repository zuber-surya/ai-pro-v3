"use client";

import { useState } from "react";
import { propertyMediaSrc } from "@/lib/api/properties";
import { stockPropertyCover } from "@/lib/media/stock";

type MediaImageProps = {
  src?: string | null;
  /** Stable seed (property id) so the same listing keeps the same stock cover. */
  seed?: string | number;
  alt: string;
  className?: string;
};

/** Property image with design stock fallback when URL is missing or fails to load. */
export function MediaImage({ src, seed, alt, className }: MediaImageProps) {
  const [broken, setBroken] = useState(false);
  const resolved = broken ? stockPropertyCover(seed) : propertyMediaSrc(src, seed);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      className={className}
      onError={() => setBroken(true)}
    />
  );
}
