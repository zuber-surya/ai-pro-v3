/** Design-reference stock images (copied under `public/assets/stock/`). */

export const STOCK_PROPERTY_COVERS = [
  "/assets/stock/property-1.jpg",
  "/assets/stock/property-2.jpg",
  "/assets/stock/property-3.jpg",
] as const;

export const STOCK_AVATARS = [
  "/assets/stock/avatar-1.jpg",
  "/assets/stock/avatar-2.jpg",
  "/assets/stock/avatar-3.jpg",
] as const;

function pickStock(list: readonly string[], seed?: string | number): string {
  if (seed === undefined || seed === null || seed === "") return list[0]!;
  const s = String(seed);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return list[h % list.length]!;
}

export function stockPropertyCover(seed?: string | number): string {
  return pickStock(STOCK_PROPERTY_COVERS, seed);
}

export function stockAvatar(seed?: string | number): string {
  return pickStock(STOCK_AVATARS, seed);
}

/** Resolve API upload paths; keep `/assets/*` on the frontend origin. */
export function resolveMediaUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/assets/")) {
    return url;
  }
  // Lazy import avoided — caller passes api host base
  return url;
}
