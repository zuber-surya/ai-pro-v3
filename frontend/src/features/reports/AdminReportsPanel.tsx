"use client";

import { useCallback, useEffect, useState } from "react";
import { AppError, getMetricsReports } from "@/lib/api";
import { Button, Input } from "@/components/ui";
import { EmptyState, ErrorState, Loader } from "@/components/states";
import {
  isReportEmpty,
  type MetricsReportData,
  type ReportType,
} from "./types";

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatTrend(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n)}%`;
}

function parseReportData(raw: Record<string, unknown>): MetricsReportData | null {
  if (!raw || typeof raw !== "object") return null;
  const range = raw.range as MetricsReportData["range"] | undefined;
  const kpis = raw.kpis as MetricsReportData["kpis"] | undefined;
  const charts = raw.charts as MetricsReportData["charts"] | undefined;
  if (!range?.from || !range?.to || !kpis || !charts) return null;
  return {
    range,
    kpis,
    charts: {
      leadSources: charts.leadSources ?? [],
      viewsOverTime: charts.viewsOverTime ?? [],
      stageDistribution: charts.stageDistribution ?? [],
    },
    unclaimedLeads: typeof raw.unclaimedLeads === "number" ? raw.unclaimedLeads : 0,
  };
}

function BarRows({
  rows,
  emptyLabel,
}: {
  rows: Array<{ label: string; count: number }>;
  emptyLabel: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (!rows.length) {
    return <p className="text-body-sm text-on-surface-variant">{emptyLabel}</p>;
  }
  return (
    <ul className="space-y-md">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="mb-xs flex items-center justify-between gap-md">
            <span className="truncate font-label-md text-label-md text-on-surface">
              {row.label}
            </span>
            <span className="shrink-0 font-label-sm text-label-sm text-on-surface-variant">
              {row.count}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(4, Math.round((row.count / max) * 100))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function KpiTile({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: number;
}) {
  const up = trend >= 0;
  return (
    <div className="rounded-xl border border-outline-variant bg-white p-lg shadow-sm">
      <p className="font-label-md text-label-md text-on-surface-variant">{label}</p>
      <p className="font-headline-lg mt-xs text-headline-lg text-on-surface">{value}</p>
      <p
        className={`mt-sm font-label-sm text-label-sm ${
          up ? "text-[#00875A]" : "text-error"
        }`}
      >
        {formatTrend(trend)} vs prior period
      </p>
    </div>
  );
}

export function AdminReportsPanel() {
  const [from, setFrom] = useState(isoDaysAgo(29));
  const [to, setTo] = useState(todayIso());
  const [reportType, setReportType] = useState<ReportType>("summary");
  const [data, setData] = useState<MetricsReportData | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMetricsReports({ reportType, from, to });
      const parsed = parseReportData(res.data);
      if (!parsed) {
        setData(null);
        setError("Report payload was incomplete");
        return;
      }
      setData(parsed);
      setGeneratedAt(res.generatedAt);
    } catch (err) {
      setData(null);
      setError(err instanceof AppError ? err.message : "Could not load report");
    } finally {
      setLoading(false);
    }
  }, [from, to, reportType]);

  useEffect(() => {
    void load();
  }, [load]);

  function onExport() {
    if (!data) return;
    const blob = new Blob(
      [
        JSON.stringify(
          { reportType, generatedAt, data },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `propvista-report-${reportType}-${from}-to-${to}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const empty = data ? isReportEmpty(data) : false;

  return (
    <div className="mx-auto max-w-[1400px] space-y-xl px-xl py-xl">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Reports</h1>
          <p className="font-body-md mt-xs text-body-md text-on-surface-variant">
            Org metrics summaries by date range.
          </p>
        </div>
        <Button variant="secondary" onClick={onExport} disabled={!data || loading}>
          Export JSON
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-md rounded-xl border border-outline-variant bg-white p-lg shadow-sm">
        <label className="text-body-sm text-on-surface-variant">
          Report
          <select
            className="mt-xs block w-full min-w-[10rem] rounded-lg border border-outline-variant bg-surface-container-low px-md py-sm text-body-sm text-on-surface"
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            aria-label="Report type"
          >
            <option value="summary">Summary</option>
            <option value="leads">Leads</option>
            <option value="listings">Listings</option>
          </select>
        </label>
        <label className="text-body-sm text-on-surface-variant">
          From
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="text-body-sm text-on-surface-variant">
          To
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <Button variant="secondary" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-xl">
          <Loader label="Loading report" />
        </div>
      ) : error && !data ? (
        <ErrorState title="Report unavailable" message={error} />
      ) : data && empty ? (
        <EmptyState
          title="No data for this range"
          description="Try a wider date range or publish listings and capture leads first."
        />
      ) : data ? (
        <>
          {generatedAt ? (
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Generated {new Date(generatedAt).toLocaleString()} · {data.range.from} →{" "}
              {data.range.to}
              {data.unclaimedLeads > 0
                ? ` · ${data.unclaimedLeads} unclaimed leads`
                : ""}
            </p>
          ) : null}

          <section className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
            {(reportType === "summary" || reportType === "listings") && (
              <KpiTile
                label="Active listings"
                value={data.kpis.activeListings.value.toLocaleString()}
                trend={data.kpis.activeListings.trendPercent}
              />
            )}
            {(reportType === "summary" || reportType === "leads") && (
              <KpiTile
                label="Active leads"
                value={data.kpis.activeLeads.value.toLocaleString()}
                trend={data.kpis.activeLeads.trendPercent}
              />
            )}
            {(reportType === "summary" || reportType === "leads") && (
              <KpiTile
                label="Conversion rate"
                value={`${data.kpis.conversionRate.displayPercent ?? 0}%`}
                trend={data.kpis.conversionRate.trendPercent}
              />
            )}
            {(reportType === "summary" || reportType === "listings") && (
              <KpiTile
                label="Sessions"
                value={data.kpis.sessions.value.toLocaleString()}
                trend={data.kpis.sessions.trendPercent}
              />
            )}
          </section>

          <section className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
            {(reportType === "summary" || reportType === "leads") && (
              <div className="rounded-xl border border-outline-variant bg-white p-lg shadow-sm">
                <h2 className="font-headline-md mb-lg text-headline-md text-on-surface">
                  Lead sources
                </h2>
                <BarRows
                  rows={data.charts.leadSources.map((s) => ({
                    label: s.source,
                    count: s.count,
                  }))}
                  emptyLabel="No lead sources in range."
                />
              </div>
            )}
            {(reportType === "summary" || reportType === "leads") && (
              <div className="rounded-xl border border-outline-variant bg-white p-lg shadow-sm">
                <h2 className="font-headline-md mb-lg text-headline-md text-on-surface">
                  Lead stages
                </h2>
                <BarRows
                  rows={data.charts.stageDistribution.map((s) => ({
                    label: s.stage.replace(/_/g, " "),
                    count: s.count,
                  }))}
                  emptyLabel="No stage data in range."
                />
              </div>
            )}
            {(reportType === "summary" || reportType === "listings") && (
              <div className="rounded-xl border border-outline-variant bg-white p-lg shadow-sm lg:col-span-2">
                <h2 className="font-headline-md mb-lg text-headline-md text-on-surface">
                  Property views over time
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[28rem] text-left">
                    <thead>
                      <tr className="border-b border-outline-variant">
                        <th className="py-sm font-label-md text-label-md text-on-surface-variant">
                          Date
                        </th>
                        <th className="py-sm font-label-md text-label-md text-on-surface-variant">
                          Views
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.charts.viewsOverTime.length === 0 ? (
                        <tr>
                          <td
                            colSpan={2}
                            className="py-md text-body-sm text-on-surface-variant"
                          >
                            No views in range.
                          </td>
                        </tr>
                      ) : (
                        data.charts.viewsOverTime.map((row) => (
                          <tr
                            key={row.date}
                            className="border-b border-outline-variant/60"
                          >
                            <td className="py-sm font-body-sm text-body-sm text-on-surface">
                              {row.date}
                            </td>
                            <td className="py-sm font-body-sm text-body-sm text-on-surface">
                              {row.count}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {error ? <p className="text-body-sm text-error">{error}</p> : null}
        </>
      ) : null}
    </div>
  );
}
