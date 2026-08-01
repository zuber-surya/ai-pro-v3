import { apiRequest } from "./client";
import { propertyMediaSrc } from "./properties";

export type SearchMatchReason = {
  label: string;
  matched: boolean;
};

export type AiSearchResultItem = {
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
  matchReasons: SearchMatchReason[];
};

export type AiSearchResponse = {
  mode: "ai" | "fallback";
  summary?: string;
  queryInterpretation?: string;
  fallbackReason?: string;
  bannerMessage?: string;
  results: AiSearchResultItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type AiSearchFilters = {
  city?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  minPrice?: number | string;
  maxPrice?: number | string;
  amenities?: string[];
};

export type AiSearchRequest = {
  query: string;
  mode?: "ai" | "fallback";
  filters?: AiSearchFilters;
  page?: number;
  pageSize?: number;
};

export function aiSearch(payload: AiSearchRequest) {
  return apiRequest<AiSearchResponse>("/ai/search", {
    method: "POST",
    body: payload,
  });
}

export function searchSuggest(q: string) {
  return apiRequest<{ suggestions: Array<{ text: string }> }>(
    `/search/suggest?q=${encodeURIComponent(q)}`,
  );
}

export function searchThumbSrc(url: string | null | undefined): string | null {
  return propertyMediaSrc(url);
}
