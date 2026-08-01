import type { Prisma, Property, PropertyAmenity, PropertyImage } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { getGeminiClient } from "../integrations/gemini/gemini.client.js";
import { AppError } from "../middleware/errorHandler.js";
import type { AiSearchRequestInput } from "../validators/search.validators.js";

export type SearchFilters = {
  city?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  keywords?: string[];
};

export type MatchReason = { label: string; matched: boolean };

export type SearchResultItem = {
  propertyId: string;
  title: string;
  priceAmount: string;
  priceCurrency: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  city: string | null;
  propertyType: string;
  thumbnailUrl: string | null;
  matchScorePercent: number | null;
  matchReasons: MatchReason[];
};

export type AiSearchResponse = {
  mode: "ai" | "fallback";
  queryInterpretation?: string;
  summary?: string;
  fallbackReason?: string;
  bannerMessage?: string;
  results: SearchResultItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type PropertyRow = Property & {
  amenities?: PropertyAmenity[];
  images?: PropertyImage[];
};

const geminiFilterSchema = zLoose({
  city: "string?",
  propertyType: "string?",
  bedrooms: "number?",
  bathrooms: "number?",
  minPrice: "number?",
  maxPrice: "number?",
  amenities: "string[]?",
  interpretation: "string?",
});

function zLoose(_shape: Record<string, string>) {
  // lightweight runtime normalize — avoid hard crash on partial Gemini JSON
  return {
    parse(raw: unknown): SearchFilters & { interpretation?: string } {
      const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
      const num = (v: unknown) => {
        if (v == null || v === "") return undefined;
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
      };
      const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
      const amenities = Array.isArray(o.amenities)
        ? o.amenities.filter((a): a is string => typeof a === "string" && a.trim().length > 0)
        : undefined;
      return {
        city: str(o.city),
        propertyType: str(o.propertyType),
        bedrooms: num(o.bedrooms),
        bathrooms: num(o.bathrooms),
        minPrice: num(o.minPrice),
        maxPrice: num(o.maxPrice),
        amenities,
        interpretation: str(o.interpretation),
      };
    },
  };
}

function parsePriceToken(raw: string): number | undefined {
  const cleaned = raw.replace(/,/g, "").trim().toLowerCase();
  const m = cleaned.match(/^(\d+(?:\.\d+)?)\s*(cr|crore|lakh|lac|l)?$/i);
  if (!m) {
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : undefined;
  }
  const n = Number(m[1]);
  const unit = (m[2] ?? "").toLowerCase();
  if (unit.startsWith("cr")) return n * 10_000_000;
  if (unit.startsWith("l")) return n * 100_000;
  return n;
}

/** Non-AI heuristic parse for filter-only fallback. */
export function parseFiltersHeuristic(query: string, explicit?: AiSearchRequestInput["filters"]): SearchFilters {
  const q = query.toLowerCase();
  const filters: SearchFilters = { keywords: [] };

  const bhk = q.match(/(\d+)\s*(?:bhk|bed(?:room)?s?)/i);
  if (bhk) filters.bedrooms = Number(bhk[1]);

  if (/\bapartment|flat\b/.test(q)) filters.propertyType = "Apartment";
  else if (/\bvilla\b/.test(q)) filters.propertyType = "Villa";
  else if (/\bplot|land\b/.test(q)) filters.propertyType = "Plot";

  const under = q.match(/(?:under|below|upto|up to|<)\s*(?:rs\.?|inr|₹)?\s*([\d.,]+\s*(?:cr|crore|lakh|lac|l)?)/i);
  if (under?.[1]) filters.maxPrice = parsePriceToken(under[1]);

  const above = q.match(/(?:above|over|>)\s*(?:rs\.?|inr|₹)?\s*([\d.,]+\s*(?:cr|crore|lakh|lac|l)?)/i);
  if (above?.[1]) filters.minPrice = parsePriceToken(above[1]);

  for (const amenity of ["gym", "pool", "parking", "garden", "security", "balcony"]) {
    if (q.includes(amenity)) {
      filters.amenities = filters.amenities ?? [];
      filters.amenities.push(amenity[0]!.toUpperCase() + amenity.slice(1));
    }
  }

  const near = q.match(/near\s+([a-z][a-z\s]{1,40}?)(?:\s+with|\s+under|\s+below|$)/i);
  if (near?.[1]) filters.keywords = [...(filters.keywords ?? []), near[1].trim()];

  // City: last capitalized-ish token heuristics from original query words > 3 chars
  const words = query.split(/[\s,]+/).filter((w) => w.length > 2);
  for (const w of words) {
    if (/^(near|with|under|below|above|bhk|bedroom|bedrooms|apartment|flat|villa)$/i.test(w)) continue;
    if (/^\d/.test(w)) continue;
    if (!filters.city && /^[A-Z][a-z]+/.test(w)) filters.city = w;
  }

  if (explicit?.city) filters.city = explicit.city;
  if (explicit?.propertyType) filters.propertyType = explicit.propertyType;
  if (explicit?.bedrooms != null) filters.bedrooms = explicit.bedrooms;
  if (explicit?.bathrooms != null) filters.bathrooms = explicit.bathrooms;
  if (explicit?.minPrice != null) filters.minPrice = Number(explicit.minPrice);
  if (explicit?.maxPrice != null) filters.maxPrice = Number(explicit.maxPrice);
  if (explicit?.amenities?.length) filters.amenities = explicit.amenities;

  return filters;
}

function buildWhere(filters: SearchFilters): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = { status: "published" };
  const and: Prisma.PropertyWhereInput[] = [];

  if (filters.city) {
    and.push({ city: { contains: filters.city, mode: "insensitive" } });
  }
  if (filters.propertyType) {
    and.push({ propertyType: { contains: filters.propertyType, mode: "insensitive" } });
  }
  if (filters.bedrooms != null) {
    and.push({ bedrooms: { gte: filters.bedrooms } });
  }
  if (filters.bathrooms != null) {
    and.push({ bathrooms: { gte: filters.bathrooms } });
  }
  if (filters.minPrice != null) {
    and.push({ price: { gte: filters.minPrice } });
  }
  if (filters.maxPrice != null) {
    and.push({ price: { lte: filters.maxPrice } });
  }
  if (filters.amenities?.length) {
    for (const name of filters.amenities) {
      and.push({
        amenities: { some: { name: { contains: name, mode: "insensitive" } } },
      });
    }
  }
  if (filters.keywords?.length) {
    for (const kw of filters.keywords) {
      and.push({
        OR: [
          { title: { contains: kw, mode: "insensitive" } },
          { description: { contains: kw, mode: "insensitive" } },
          { addressLine: { contains: kw, mode: "insensitive" } },
          { city: { contains: kw, mode: "insensitive" } },
        ],
      });
    }
  }

  if (and.length) where.AND = and;
  return where;
}

function toResultItem(
  p: PropertyRow,
  score: number | null,
  reasons: MatchReason[],
): SearchResultItem {
  const thumb =
    (p.images ?? []).find((i) => i.kind === "photo")?.url ?? (p.images ?? [])[0]?.url ?? null;
  return {
    propertyId: p.id,
    title: p.title,
    priceAmount: p.price.toFixed(2),
    priceCurrency: p.currency,
    bedrooms: p.bedrooms,
    bathrooms: Number(p.bathrooms),
    areaSqFt: Number(p.areaSqFt),
    city: p.city,
    propertyType: p.propertyType,
    thumbnailUrl: thumb,
    matchScorePercent: score,
    matchReasons: reasons,
  };
}

function heuristicReasons(p: PropertyRow, filters: SearchFilters): MatchReason[] {
  const reasons: MatchReason[] = [];
  if (filters.bedrooms != null) {
    reasons.push({
      label: `${filters.bedrooms}+ bedrooms`,
      matched: p.bedrooms >= filters.bedrooms,
    });
  }
  if (filters.maxPrice != null) {
    reasons.push({
      label: "Within budget",
      matched: Number(p.price) <= filters.maxPrice,
    });
  }
  if (filters.city) {
    reasons.push({
      label: `In ${filters.city}`,
      matched: (p.city ?? "").toLowerCase().includes(filters.city.toLowerCase()),
    });
  }
  if (filters.propertyType) {
    reasons.push({
      label: filters.propertyType,
      matched: p.propertyType.toLowerCase().includes(filters.propertyType.toLowerCase()),
    });
  }
  for (const a of filters.amenities ?? []) {
    reasons.push({
      label: a,
      matched: (p.amenities ?? []).some((x) => x.name.toLowerCase().includes(a.toLowerCase())),
    });
  }
  return reasons;
}

function heuristicScore(reasons: MatchReason[]): number | null {
  if (!reasons.length) return null;
  const matched = reasons.filter((r) => r.matched).length;
  return Math.round((matched / reasons.length) * 100);
}

async function loadCandidates(filters: SearchFilters, take: number): Promise<PropertyRow[]> {
  return prisma.property.findMany({
    where: buildWhere(filters),
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    take,
    include: {
      amenities: true,
      images: {
        where: { kind: "photo" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 1,
      },
    },
  });
}

async function parseFiltersWithGemini(
  query: string,
  explicit?: AiSearchRequestInput["filters"],
): Promise<SearchFilters & { interpretation?: string }> {
  const client = getGeminiClient();
  const raw = await client.generateJson<unknown>({
    system:
      "You extract real-estate search filters from a natural language query. Return JSON only. Do not invent cities that are not implied. Prices in INR numbers.",
    prompt: `Extract filters as JSON with keys: city, propertyType, bedrooms, bathrooms, minPrice, maxPrice, amenities (string[]), interpretation (string).
Query: ${JSON.stringify(query)}
Explicit filters override when present: ${JSON.stringify(explicit ?? {})}`,
  });
  const parsed = geminiFilterSchema.parse(raw);
  // Prefer Gemini-extracted filters; apply explicit overrides; do not keep heuristic
  // "near X" keywords that would over-constrain AND filters.
  const explicitOnly = parseFiltersHeuristic("", explicit);
  return {
    ...explicitOnly,
    city: parsed.city ?? explicitOnly.city,
    propertyType: parsed.propertyType ?? explicitOnly.propertyType,
    bedrooms: parsed.bedrooms ?? explicitOnly.bedrooms,
    bathrooms: parsed.bathrooms ?? explicitOnly.bathrooms,
    minPrice: parsed.minPrice ?? explicitOnly.minPrice,
    maxPrice: parsed.maxPrice ?? explicitOnly.maxPrice,
    amenities: parsed.amenities?.length ? parsed.amenities : explicitOnly.amenities,
    interpretation: parsed.interpretation ?? query,
  };
}

async function rankWithGemini(
  query: string,
  rows: PropertyRow[],
): Promise<Map<string, { score: number; reasons: MatchReason[] }>> {
  const map = new Map<string, { score: number; reasons: MatchReason[] }>();
  if (!rows.length) return map;

  const inventory = rows.map((p) => ({
    propertyId: p.id,
    title: p.title,
    city: p.city,
    propertyType: p.propertyType,
    bedrooms: p.bedrooms,
    bathrooms: Number(p.bathrooms),
    price: Number(p.price),
    amenities: (p.amenities ?? []).map((a) => a.name),
  }));

  const client = getGeminiClient();
  const raw = await client.generateJson<{
    rankings?: Array<{
      propertyId?: string;
      score?: number;
      reasons?: Array<{ label?: string; matched?: boolean }>;
    }>;
  }>({
    system:
      "You rank ONLY the provided property inventory for the user query. Never invent propertyIds. Return JSON { rankings: [{ propertyId, score 0-100, reasons: [{label, matched}] }] }.",
    prompt: `Query: ${JSON.stringify(query)}
Inventory:
${JSON.stringify(inventory)}`,
  });

  const allowed = new Set(rows.map((r) => r.id));
  for (const item of raw.rankings ?? []) {
    if (!item.propertyId || !allowed.has(item.propertyId)) continue;
    const score = Math.max(0, Math.min(100, Number(item.score) || 0));
    const reasons = (item.reasons ?? [])
      .filter((r) => typeof r.label === "string" && r.label.trim())
      .map((r) => ({ label: String(r.label), matched: Boolean(r.matched) }));
    map.set(item.propertyId, { score, reasons });
  }
  return map;
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const start = (page - 1) * pageSize;
  return {
    slice: items.slice(start, start + pageSize),
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

async function filterOnlySearch(
  query: string,
  input: AiSearchRequestInput,
  fallbackReason?: string,
): Promise<AiSearchResponse> {
  const filters = parseFiltersHeuristic(query, input.filters);
  const rows = await loadCandidates(filters, 100);
  const ranked = rows.map((p) => {
    const reasons = heuristicReasons(p, filters);
    return toResultItem(p, heuristicScore(reasons), reasons);
  });
  const { slice, meta } = paginate(ranked, input.page, input.pageSize);
  return {
    mode: "fallback",
    fallbackReason,
    bannerMessage: fallbackReason
      ? "AI ranking is temporarily unavailable. Showing filter-matched listings."
      : undefined,
    queryInterpretation: query,
    summary: `Filter matches for “${query}”`,
    results: slice,
    meta,
  };
}

export const searchService = {
  async aiSearch(input: AiSearchRequestInput): Promise<AiSearchResponse> {
    const query = input.query.trim();
    if (!query) {
      throw new AppError("VALIDATION_ERROR", "Query is required", 422, [
        { field: "query", issue: "required" },
      ]);
    }

    if (input.mode === "fallback") {
      return filterOnlySearch(query, input);
    }

    try {
      const filters = await parseFiltersWithGemini(query, input.filters);
      const rows = await loadCandidates(filters, 40);
      const rankings = await rankWithGemini(query, rows);

      const scored = rows
        .map((p) => {
          const rank = rankings.get(p.id);
          if (rank) return toResultItem(p, rank.score, rank.reasons);
          const reasons = heuristicReasons(p, filters);
          return toResultItem(p, heuristicScore(reasons), reasons);
        })
        .sort((a, b) => (b.matchScorePercent ?? 0) - (a.matchScorePercent ?? 0));

      const { slice, meta } = paginate(scored, input.page, input.pageSize);
      return {
        mode: "ai",
        queryInterpretation: filters.interpretation ?? query,
        summary: `AI matches for “${query}”`,
        results: slice,
        meta,
      };
    } catch (err) {
      if (err instanceof AppError && (err.code === "AI_TIMEOUT" || err.code === "AI_UNAVAILABLE")) {
        return filterOnlySearch(query, input, err.code);
      }
      throw err;
    }
  },

  async suggest(q: string) {
    const term = q.trim();
    const rows = await prisma.property.findMany({
      where: {
        status: "published",
        OR: [
          { title: { contains: term, mode: "insensitive" } },
          { city: { contains: term, mode: "insensitive" } },
          { propertyType: { contains: term, mode: "insensitive" } },
        ],
      },
      select: { title: true, city: true, propertyType: true },
      take: 8,
      orderBy: { publishedAt: "desc" },
    });

    const suggestions = new Set<string>();
    for (const r of rows) {
      if (r.city) suggestions.add(r.city);
      suggestions.add(r.title);
      suggestions.add(r.propertyType);
    }
    return {
      suggestions: Array.from(suggestions)
        .filter((s) => s.toLowerCase().includes(term.toLowerCase()))
        .slice(0, 8)
        .map((text) => ({ text })),
    };
  },
};
