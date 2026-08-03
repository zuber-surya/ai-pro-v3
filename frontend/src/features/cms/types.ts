import type { CmsPage } from "@/lib/api";

export type HomepageHeroCms = {
  eyebrow?: string;
  headline?: string;
  headlineHighlight?: string;
  subheadline?: string;
  searchPlaceholder?: string;
  popularSearches?: string[];
};

export type HomepageFeaturedCms = {
  title?: string;
  subtitle?: string;
  propertyIds?: string[];
};

export type HomepageJourneyStep = {
  icon: string;
  title: string;
  body: string;
  tone?: "primary" | "ai" | "secondary";
};

export type HomepageTestimonial = {
  quote: string;
  name: string;
  role: string;
  stars?: number;
  avatar?: string;
};

export type HomepageSections = {
  hero?: HomepageHeroCms;
  featured?: HomepageFeaturedCms;
  journey?: { steps?: HomepageJourneyStep[] };
  testimonials?: { items?: HomepageTestimonial[] };
};

export function asHomepageSections(page: CmsPage | null | undefined): HomepageSections {
  if (!page?.sections || typeof page.sections !== "object") return {};
  return page.sections as HomepageSections;
}
