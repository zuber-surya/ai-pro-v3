import { apiRequest } from "./client";

export type MetricsKpi = {
  value: number;
  trendPercent: number;
  displayPercent?: number;
};

export type MetricsDashboard = {
  range: { from: string; to: string };
  generatedAt: string;
  scope: "agent" | "org";
  kpis: {
    activeListings: MetricsKpi;
    activeLeads: MetricsKpi;
    conversionRate: MetricsKpi;
    sessions: MetricsKpi;
  };
  charts: {
    leadSources: Array<{ source: string; count: number }>;
    viewsOverTime: Array<{ date: string; count: number }>;
    stageDistribution: Array<{ stage: string; count: number }>;
  };
  unclaimedLeads: number;
  featuredListing: {
    id: string;
    title: string;
    price: string;
    currency: string;
    city: string | null;
    bedrooms: number;
    bathrooms: number;
    coverImageUrl: string | null;
    featured: boolean;
  } | null;
  agentLeaderboard: Array<{
    id: string;
    name: string;
    profileImageUrl: string | null;
    volume: number;
    listingCount: number;
  }>;
  activity: Array<{
    id: string;
    type: "lead" | "property" | "system";
    title: string;
    body: string;
    createdAt: string;
    href?: string;
  }>;
};

export type MetricsReport = {
  reportType: string;
  generatedAt: string;
  data: Record<string, unknown>;
};

export function getMetricsDashboard(params?: {
  from?: string;
  to?: string;
  activityType?: "all" | "lead" | "property" | "system";
}) {
  const q = new URLSearchParams();
  if (params?.from) q.set("from", params.from);
  if (params?.to) q.set("to", params.to);
  if (params?.activityType) q.set("activityType", params.activityType);
  const qs = q.toString();
  return apiRequest<MetricsDashboard>(`/metrics/dashboard${qs ? `?${qs}` : ""}`);
}

export function getMetricsReports(params: {
  reportType: string;
  from?: string;
  to?: string;
}) {
  const q = new URLSearchParams({ reportType: params.reportType });
  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  return apiRequest<MetricsReport>(`/metrics/reports?${q.toString()}`);
}
