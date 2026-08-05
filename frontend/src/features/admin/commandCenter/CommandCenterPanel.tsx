"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  getMetricsDashboard,
  getMetricsReports,
  agentImageSrc,
  type MetricsDashboard,
  AppError,
} from "@/lib/api";
import { Button, Input, MediaImage } from "@/components/ui";
import { ErrorState, Loader } from "@/components/states";

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatTrend(n: number) {
  return `${Math.abs(n)}%`;
}

function formatInrCompact(amount: number) {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)} Cr`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)} L`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(diff / 60_000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString();
}

function KpiCard({
  label,
  value,
  trend,
  icon,
  iconTone,
}: {
  label: string;
  value: string;
  trend: number;
  icon: string;
  iconTone: string;
}) {
  const up = trend >= 0;
  return (
    <div className="rounded-xl border border-outline-variant bg-white p-lg shadow-[0px_2px_4px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-md">
      <div className="mb-md flex items-start justify-between">
        <span className={`rounded-lg p-sm ${iconTone}`}>
          <span className="material-symbols-outlined" aria-hidden>
            {icon}
          </span>
        </span>
        <span
          className={`flex items-center font-label-sm text-label-sm ${
            up ? "text-[#00875A]" : "text-error"
          }`}
        >
          <span className="material-symbols-outlined text-sm" aria-hidden>
            {up ? "trending_up" : "trending_down"}
          </span>
          {formatTrend(trend)}
        </span>
      </div>
      <p className="font-label-md text-label-md text-on-surface-variant">{label}</p>
      <h3 className="font-headline-lg mt-xs text-headline-lg text-on-surface">{value}</h3>
    </div>
  );
}

function VerticalBarChart({ items }: { items: Array<{ label: string; count: number }> }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, [items]);

  if (!items.length) {
    return <p className="text-body-sm text-on-surface-variant">No leads in this range.</p>;
  }
  return (
    <div className="flex h-48 flex-1 items-end justify-between gap-md">
      {items.slice(0, 6).map((item, index) => {
        const pct = Math.max(12, Math.round((item.count / max) * 100));
        const secondary = index % 3 === 2;
        return (
          <div key={item.label} className="flex h-full w-full flex-col items-center justify-end gap-sm">
            <span className="font-label-sm text-[10px] text-on-surface">{item.count}</span>
            <div
              className={`chart-bar w-full max-w-[3rem] rounded-t-lg transition-all duration-1000 ease-in-out ${
                secondary
                  ? "bg-secondary-container/40 hover:bg-secondary-container/60"
                  : "bg-primary-container/40 hover:bg-primary-container/60"
              }`}
              style={{ height: ready ? `${pct}%` : "0%" }}
              title={`${item.label}: ${item.count}`}
            />
            <span className="max-w-full truncate text-center text-[10px] font-label-sm text-on-surface-variant">
              {item.label.replace(/_/g, " ")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function smoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;
  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]!;
    const p1 = points[i + 1]!;
    const cx = (p0.x + p1.x) / 2;
    d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

function LineChart({ points }: { points: Array<{ date: string; count: number }> }) {
  const max = Math.max(1, ...points.map((p) => p.count));
  const w = 400;
  const h = 150;
  const gradId = useId().replace(/:/g, "");
  if (!points.length) {
    return <p className="text-body-sm text-on-surface-variant">No views in range.</p>;
  }
  const plotted = points.map((p, i) => ({
    x: (i / Math.max(points.length - 1, 1)) * w,
    y: h - 16 - (p.count / max) * (h - 28),
    date: p.date,
    count: p.count,
  }));
  const line = smoothPath(plotted);
  const area = `${line} L ${w},${h} L 0,${h} Z`;
  const ticks = [
    plotted[0],
    plotted[Math.floor(plotted.length / 3)],
    plotted[Math.floor((plotted.length * 2) / 3)],
    plotted[plotted.length - 1],
  ].filter(Boolean);
  return (
    <div className="relative flex h-48 items-center justify-center">
      <svg className="h-full w-full text-primary" viewBox={`0 0 ${w} ${h}`} fill="none">
        <defs>
          <linearGradient id={gradId} x1="240" x2="240" y1="0" y2="150" gradientUnits="userSpaceOnUse">
            <stop stopColor="currentColor" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradId})`} fillOpacity="0.12" />
        <path
          d={line}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {plotted
          .filter((_, i) => i === 0 || i === plotted.length - 1 || i % Math.ceil(plotted.length / 4) === 0)
          .map((p) => (
            <circle
              key={`${p.date}-${p.x}`}
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill="currentColor"
              className="text-primary"
            />
          ))}
      </svg>
      <div className="absolute right-0 bottom-0 left-0 flex justify-between px-xs text-[10px] font-label-sm text-on-surface-variant">
        {ticks.map((t) => (
          <span key={`${t!.date}-${t!.x}`}>{t!.date.slice(5)}</span>
        ))}
      </div>
    </div>
  );
}

export function CommandCenterPanel() {
  const [from, setFrom] = useState(isoDaysAgo(29));
  const [to, setTo] = useState(todayIso());
  const [activityType, setActivityType] = useState<"all" | "lead" | "property" | "system">(
    "all",
  );
  const [data, setData] = useState<MetricsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getMetricsDashboard({ from, to, activityType }));
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Could not load metrics");
    } finally {
      setLoading(false);
    }
  }, [from, to, activityType]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onDownloadReport() {
    try {
      const report = await getMetricsReports({ reportType: "summary", from, to });
      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `propvista-metrics-${from}-to-${to}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Report download failed");
    }
  }

  const stageItems = useMemo(
    () =>
      (data?.charts.stageDistribution ?? []).map((s) => ({
        label: s.stage.replace(/_/g, " "),
        count: s.count,
      })),
    [data],
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-xl px-xl py-xl">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg tracking-tight text-on-surface">
            Performance Overview
          </h1>
          <p className="font-body-md mt-xs text-body-md text-on-surface-variant">
            Real-time insights for your real estate ecosystem.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-md">
          <Button variant="secondary" onClick={() => void onDownloadReport()} disabled={loading}>
            Download Report
          </Button>
          <Button variant="ai" onClick={() => void load()} disabled={loading}>
            <span className="material-symbols-outlined text-sm" aria-hidden>
              auto_awesome
            </span>
            AI Insights
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-md">
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
          <Loader />
        </div>
      ) : error && !data ? (
        <ErrorState title="Metrics unavailable" message={error} />
      ) : data ? (
        <>
          <section className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Total Listings"
              value={data.kpis.activeListings.value.toLocaleString()}
              trend={data.kpis.activeListings.trendPercent}
              icon="domain"
              iconTone="bg-primary-fixed text-primary"
            />
            <KpiCard
              label="Active Leads"
              value={data.kpis.activeLeads.value.toLocaleString()}
              trend={data.kpis.activeLeads.trendPercent}
              icon="group_add"
              iconTone="bg-secondary-fixed text-secondary"
            />
            <KpiCard
              label="Conversion Rate"
              value={`${data.kpis.conversionRate.displayPercent ?? 0}%`}
              trend={data.kpis.conversionRate.trendPercent}
              icon="handshake"
              iconTone="bg-tertiary-fixed text-tertiary"
            />
            <KpiCard
              label="Sessions"
              value={data.kpis.sessions.value.toLocaleString()}
              trend={data.kpis.sessions.trendPercent}
              icon="visibility"
              iconTone="bg-surface-container-highest text-on-surface"
            />
          </section>

          {data.unclaimedLeads > 0 ? (
            <section className="relative flex flex-wrap items-center justify-between gap-lg overflow-hidden rounded-xl border border-error/20 bg-error-container/20 p-lg">
              <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-error/5 blur-3xl" />
              <div className="relative z-10 flex items-center gap-xl">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-error text-on-error shadow-lg">
                  <span className="material-symbols-outlined animate-pulse text-4xl" aria-hidden>
                    priority_high
                  </span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-xs">
                    <h2 className="font-headline-lg text-headline-lg text-on-error-container">
                      {data.unclaimedLeads} Unclaimed Leads
                    </h2>
                    <span className="rounded-full bg-error px-2 py-0.5 font-label-sm text-label-sm text-on-error">
                      High Priority
                    </span>
                  </div>
                  <p className="font-body-md mt-xs max-w-xl text-body-md text-on-error-container opacity-80">
                    Urgent response needed. These potential clients have been waiting for over 4
                    hours. Distribute them to agents immediately to maintain conversion health.
                  </p>
                </div>
              </div>
              <Link
                href="/admin/leads"
                className="relative z-10 rounded-lg bg-error px-lg py-md font-label-md text-label-md text-on-error shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                Distribute Leads Now
              </Link>
            </section>
          ) : null}

          <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
            <div className="space-y-gutter lg:col-span-8">
              <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
                <div className="flex flex-col rounded-xl border border-outline-variant bg-white p-lg shadow-sm">
                  <h2 className="font-label-md mb-lg text-label-md text-on-surface">
                    Lead source breakdown
                  </h2>
                  <VerticalBarChart
                    items={data.charts.leadSources.map((s) => ({
                      label: s.source,
                      count: s.count,
                    }))}
                  />
                </div>
                <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-white p-lg shadow-sm">
                  <h2 className="font-label-md mb-lg text-label-md text-on-surface">
                    Property views over time
                  </h2>
                  <LineChart points={data.charts.viewsOverTime} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
                {data.featuredListing ? (
                  <Link
                    href={`/properties/${data.featuredListing.id}`}
                    className="group overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <MediaImage
                        src={data.featuredListing.coverImageUrl}
                        seed={data.featuredListing.id}
                        alt={data.featuredListing.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 font-label-md text-label-md text-primary backdrop-blur">
                        {formatInrCompact(Number(data.featuredListing.price))}
                      </div>
                    </div>
                    <div className="p-lg">
                      <h3 className="font-headline-md text-headline-md text-on-surface">
                        {data.featuredListing.title}
                      </h3>
                      <p className="font-body-sm mb-md text-body-sm text-on-surface-variant">
                        {[data.featuredListing.city, `${data.featuredListing.bedrooms} BD`, `${data.featuredListing.bathrooms} BA`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      <div className="flex gap-2">
                        <span className="rounded-full bg-surface-container px-3 py-1 font-label-sm text-label-sm text-on-surface-variant">
                          New Listing
                        </span>
                        <span className="flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1 font-label-sm text-label-sm text-secondary">
                          <span className="material-symbols-outlined text-sm" aria-hidden>
                            auto_awesome
                          </span>
                          AI Boosted
                        </span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="rounded-xl border border-outline-variant bg-white p-lg text-body-sm text-on-surface-variant">
                    No featured listing yet.
                  </div>
                )}

                <div className="flex flex-col items-center justify-center rounded-xl border border-secondary/15 bg-secondary/5 p-lg text-center">
                  <div className="mb-md flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10">
                    <span className="material-symbols-outlined text-4xl text-secondary" aria-hidden>
                      add_business
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Expand Inventory
                  </h3>
                  <p className="font-body-sm mt-sm px-md text-body-sm text-on-surface-variant">
                    Automate your listing ingestion from multiple MLS platforms using our
                    intelligent sync engine.
                  </p>
                  <Link
                    href="/properties/bulk"
                    className="mt-lg rounded-lg bg-primary px-xl py-md font-label-md text-label-md text-on-primary shadow-sm transition-all hover:shadow-md"
                  >
                    Connect New Source
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-outline-variant bg-white p-lg shadow-sm">
                <h2 className="font-label-md mb-lg text-label-md text-on-surface">
                  Lead stage distribution
                </h2>
                <VerticalBarChart items={stageItems} />
              </div>
            </div>

            <div className="flex flex-col gap-gutter lg:col-span-4">
              <div className="flex h-full flex-col rounded-xl border border-outline-variant bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-outline-variant p-lg">
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    Recent Activity
                  </h2>
                  <select
                    className="rounded-lg border border-outline-variant bg-surface-container-low px-sm py-xs text-body-sm"
                    value={activityType}
                    onChange={(e) =>
                      setActivityType(e.target.value as typeof activityType)
                    }
                    aria-label="Filter activity"
                  >
                    <option value="all">All</option>
                    <option value="lead">Leads</option>
                    <option value="property">Properties</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div className="flex-1 space-y-lg overflow-y-auto px-lg py-md">
                  {data.activity.length === 0 ? (
                    <p className="text-body-sm text-on-surface-variant">No activity in range.</p>
                  ) : (
                    data.activity.map((item) => (
                      <div key={item.id} className="group flex gap-md">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                              item.type === "lead"
                                ? "border-primary/10 bg-primary-container/10"
                                : "border-outline-variant bg-surface-container-highest"
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-xl ${
                                item.type === "lead" ? "text-primary" : "text-on-surface"
                              }`}
                              aria-hidden
                            >
                              {item.type === "lead" ? "person_add" : "edit_calendar"}
                            </span>
                          </div>
                          <div className="mt-lg h-full w-[2px] bg-outline-variant/30" />
                        </div>
                        <div className="flex-1 pb-lg">
                          <div className="flex items-start justify-between gap-sm">
                            <p className="font-label-md text-label-md text-on-surface">
                              {item.title}
                            </p>
                            <span className="shrink-0 font-label-sm text-label-sm text-on-surface-variant opacity-60">
                              {relativeTime(item.createdAt)}
                            </span>
                          </div>
                          <p className="font-body-sm mt-xs text-body-sm text-on-surface-variant">
                            {item.body}
                          </p>
                          {item.type === "lead" ? (
                            <div className="mt-md flex flex-col gap-md">
                              <div className="flex gap-md">
                                <Link
                                  href={item.href ?? "/admin/leads"}
                                  className="font-label-sm text-label-sm text-primary hover:underline"
                                >
                                  View Profile
                                </Link>
                                <Link
                                  href="/admin/leads"
                                  className="font-label-sm text-label-sm text-on-surface-variant hover:underline"
                                >
                                  Assign Agent
                                </Link>
                              </div>
                              <Link
                                href={item.href ?? "/admin/leads"}
                                className="w-full rounded-lg bg-secondary px-md py-sm text-center font-label-md text-label-md text-sm text-on-secondary"
                              >
                                Join Conversation
                              </Link>
                            </div>
                          ) : item.href ? (
                            <Link
                              href={item.href}
                              className="mt-md inline-block font-label-sm text-label-sm text-primary hover:underline"
                            >
                              Open listing
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-outline-variant p-lg text-center">
                  <button
                    type="button"
                    className="font-label-md text-label-md text-primary hover:underline"
                    onClick={() => void load()}
                  >
                    See All Activity
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-inverse-surface p-lg shadow-lg">
                <div className="relative z-10">
                  <h2 className="font-headline-md text-headline-md text-white">
                    Agent Leaderboard
                  </h2>
                  <p className="font-body-sm mt-xs mb-lg text-body-sm text-white/60">
                    Top performers this week
                  </p>
                  <div className="space-y-md">
                    {(data.agentLeaderboard ?? []).length === 0 ? (
                      <p className="text-body-sm text-white/60">No agent volume yet.</p>
                    ) : (
                      data.agentLeaderboard.map((agent) => {
                        const img = agentImageSrc(agent.profileImageUrl, agent.id);
                        return (
                          <div key={agent.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-md">
                              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img} alt="" className="h-full w-full object-cover" />
                              </div>
                              <span className="font-label-md text-label-md text-white">
                                {agent.name}
                              </span>
                            </div>
                            <span className="font-label-md text-label-md text-white">
                              {formatInrCompact(agent.volume)}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <Link
                    href="/admin/agents"
                    className="mt-lg inline-block font-label-md text-label-md text-white/80 hover:text-white hover:underline"
                  >
                    View All Rankings
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {error ? <p className="text-body-sm text-error">{error}</p> : null}
        </>
      ) : null}
    </div>
  );
}
