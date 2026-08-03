import type { MetricsKpi } from "@/lib/api";

export type ReportType = "summary" | "leads" | "listings";

export type MetricsReportData = {
  range: { from: string; to: string };
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
};

export function isReportEmpty(data: MetricsReportData): boolean {
  const { kpis, charts } = data;
  const kpiZero =
    kpis.activeListings.value === 0 &&
    kpis.activeLeads.value === 0 &&
    (kpis.conversionRate.displayPercent ?? 0) === 0 &&
    kpis.sessions.value === 0;
  const chartsEmpty =
    charts.leadSources.every((s) => s.count === 0) &&
    charts.viewsOverTime.every((v) => v.count === 0) &&
    charts.stageDistribution.every((s) => s.count === 0);
  return kpiZero && chartsEmpty;
}
