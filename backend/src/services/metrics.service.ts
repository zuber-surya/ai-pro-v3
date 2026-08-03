import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import type { AuthUser } from "../middleware/requireAuth.middleware.js";
import { agentRepository } from "../repositories/agent.repository.js";
import type {
  MetricsDashboardQuery,
  MetricsReportsQuery,
} from "../validators/metrics.validators.js";

function startOfDay(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

function endOfDay(isoDate: string): Date {
  return new Date(`${isoDate}T23:59:59.999Z`);
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function defaultRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 29);
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

function priorRange(from: string, to: string): { from: string; to: string } {
  const fromD = startOfDay(from);
  const toD = endOfDay(to);
  const days = Math.max(1, Math.round((toD.getTime() - fromD.getTime()) / 86_400_000) + 1);
  const prevTo = new Date(fromD);
  prevTo.setUTCDate(prevTo.getUTCDate() - 1);
  const prevFrom = new Date(prevTo);
  prevFrom.setUTCDate(prevFrom.getUTCDate() - (days - 1));
  return { from: toIsoDate(prevFrom), to: toIsoDate(prevTo) };
}

function trendPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

async function resolveAgentId(actor: AuthUser): Promise<string | undefined> {
  if (actor.role === "admin" || actor.role === "super_admin") return undefined;
  if (actor.role === "agent") {
    const agent = await agentRepository.findByUserId(actor.id);
    if (!agent) throw new AppError("AUTH_FORBIDDEN", "No agent profile linked", 403);
    return agent.id;
  }
  throw new AppError("AUTH_FORBIDDEN", "Insufficient permissions", 403);
}

export const metricsService = {
  async recordPropertyView(input: {
    propertyId: string;
    viewerUserId?: string | null;
    sessionId?: string | null;
  }) {
    await prisma.$transaction([
      prisma.propertyViewEvent.create({
        data: {
          propertyId: input.propertyId,
          viewerUserId: input.viewerUserId ?? null,
          sessionId: input.sessionId ?? null,
        },
      }),
      prisma.property.update({
        where: { id: input.propertyId },
        data: { viewsCount: { increment: 1 } },
      }),
    ]);
  },

  async getDashboard(query: MetricsDashboardQuery, actor: AuthUser) {
    const range = {
      from: query.from ?? defaultRange().from,
      to: query.to ?? defaultRange().to,
    };
    if (startOfDay(range.from) > endOfDay(range.to)) {
      throw new AppError("VALIDATION_ERROR", "from must be on or before to", 400);
    }

    const agentId = await resolveAgentId(actor);
    const propertyWhere = agentId ? { agentId } : {};
    const leadWhere = agentId ? { assigneeAgentId: agentId } : {};
    const prev = priorRange(range.from, range.to);

    const [
      activeListings,
      prevListings,
      activeLeads,
      prevLeads,
      wonLeads,
      totalLeadsInRange,
      prevWon,
      prevTotalLeads,
      sessionsCount,
      prevSessions,
      leadSources,
      stageDistribution,
      viewsByDay,
      recentLeads,
      recentProperties,
    ] = await Promise.all([
      prisma.property.count({
        where: { ...propertyWhere, status: "published" },
      }),
      prisma.property.count({
        where: {
          ...propertyWhere,
          status: "published",
          publishedAt: { lte: endOfDay(prev.to) },
        },
      }),
      prisma.lead.count({
        where: {
          ...leadWhere,
          stage: { notIn: ["won", "lost"] },
        },
      }),
      prisma.lead.count({
        where: {
          ...leadWhere,
          stage: { notIn: ["won", "lost"] },
          createdAt: { lte: endOfDay(prev.to) },
        },
      }),
      prisma.lead.count({
        where: {
          ...leadWhere,
          stage: "won",
          updatedAt: { gte: startOfDay(range.from), lte: endOfDay(range.to) },
        },
      }),
      prisma.lead.count({
        where: {
          ...leadWhere,
          createdAt: { gte: startOfDay(range.from), lte: endOfDay(range.to) },
        },
      }),
      prisma.lead.count({
        where: {
          ...leadWhere,
          stage: "won",
          updatedAt: { gte: startOfDay(prev.from), lte: endOfDay(prev.to) },
        },
      }),
      prisma.lead.count({
        where: {
          ...leadWhere,
          createdAt: { gte: startOfDay(prev.from), lte: endOfDay(prev.to) },
        },
      }),
      prisma.propertyViewEvent.count({
        where: {
          viewedAt: { gte: startOfDay(range.from), lte: endOfDay(range.to) },
          ...(agentId ? { property: { agentId } } : {}),
        },
      }),
      prisma.propertyViewEvent.count({
        where: {
          viewedAt: { gte: startOfDay(prev.from), lte: endOfDay(prev.to) },
          ...(agentId ? { property: { agentId } } : {}),
        },
      }),
      prisma.lead.groupBy({
        by: ["source"],
        where: {
          ...leadWhere,
          createdAt: { gte: startOfDay(range.from), lte: endOfDay(range.to) },
        },
        _count: { _all: true },
        orderBy: { _count: { source: "desc" } },
        take: 8,
      }),
      prisma.lead.groupBy({
        by: ["stage"],
        where: leadWhere,
        _count: { _all: true },
      }),
      prisma.propertyViewEvent.findMany({
        where: {
          viewedAt: { gte: startOfDay(range.from), lte: endOfDay(range.to) },
          ...(agentId ? { property: { agentId } } : {}),
        },
        select: { viewedAt: true },
      }),
      prisma.lead.findMany({
        where: {
          ...leadWhere,
          createdAt: { gte: startOfDay(range.from), lte: endOfDay(range.to) },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          name: true,
          source: true,
          stage: true,
          createdAt: true,
        },
      }),
      prisma.property.findMany({
        where: {
          ...propertyWhere,
          updatedAt: { gte: startOfDay(range.from), lte: endOfDay(range.to) },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: { id: true, title: true, status: true, updatedAt: true, price: true },
      }),
    ]);

    const conversionRate =
      totalLeadsInRange > 0 ? Number((wonLeads / totalLeadsInRange).toFixed(4)) : 0;
    const prevConversion =
      prevTotalLeads > 0 ? Number((prevWon / prevTotalLeads).toFixed(4)) : 0;

    const viewsSeriesMap = new Map<string, number>();
    for (const v of viewsByDay) {
      const key = toIsoDate(v.viewedAt);
      viewsSeriesMap.set(key, (viewsSeriesMap.get(key) ?? 0) + 1);
    }
    const viewsOverTime: Array<{ date: string; count: number }> = [];
    {
      const cursor = startOfDay(range.from);
      const end = startOfDay(range.to);
      while (cursor <= end) {
        const key = toIsoDate(cursor);
        viewsOverTime.push({ date: key, count: viewsSeriesMap.get(key) ?? 0 });
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
    }

    const unclaimedLeads = await prisma.lead.count({
      where: {
        ...leadWhere,
        assigneeAgentId: null,
        stage: { in: ["new", "contacted"] },
      },
    });

    const [featured, agents] = await Promise.all([
      prisma.property.findFirst({
        where: {
          ...propertyWhere,
          status: "published",
          featured: true,
        },
        orderBy: { publishedAt: "desc" },
        include: {
          images: {
            where: { kind: "photo" },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            take: 1,
          },
        },
      }),
      prisma.agent.findMany({
        where: { isActive: true },
        take: 8,
        include: {
          properties: {
            where: { status: "published" },
            select: { price: true },
          },
        },
      }),
    ]);

    const leaderboard = agents
      .map((a) => {
        const volume = a.properties.reduce((sum, p) => sum + Number(p.price), 0);
        return {
          id: a.id,
          name: a.name,
          profileImageUrl: a.profileImageUrl,
          volume,
          listingCount: a.properties.length,
        };
      })
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);

    type ActivityItem = {
      id: string;
      type: "lead" | "property" | "system";
      title: string;
      body: string;
      createdAt: string;
      href?: string;
    };

    const activity: ActivityItem[] = [];
    for (const lead of recentLeads) {
      activity.push({
        id: `lead-${lead.id}`,
        type: "lead",
        title: `New Lead: ${lead.name}`,
        body: `via ${lead.source} · ${lead.stage}`,
        createdAt: lead.createdAt.toISOString(),
        href: `/admin/leads`,
      });
    }
    for (const p of recentProperties) {
      activity.push({
        id: `property-${p.id}`,
        type: "property",
        title: "Property Updated",
        body: `${p.title} · ${p.status}`,
        createdAt: p.updatedAt.toISOString(),
        href: `/properties/${p.id}/edit`,
      });
    }
    activity.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    const activityType = query.activityType ?? "all";
    const filteredActivity =
      activityType === "all" ? activity : activity.filter((a) => a.type === activityType);

    const cover = featured?.images[0]?.url ?? null;

    return {
      range,
      generatedAt: new Date().toISOString(),
      scope: agentId ? "agent" : "org",
      kpis: {
        activeListings: {
          value: activeListings,
          trendPercent: trendPercent(activeListings, prevListings),
        },
        activeLeads: {
          value: activeLeads,
          trendPercent: trendPercent(activeLeads, prevLeads),
        },
        conversionRate: {
          value: conversionRate,
          displayPercent: Number((conversionRate * 100).toFixed(1)),
          trendPercent: trendPercent(conversionRate * 100, prevConversion * 100),
        },
        sessions: {
          value: sessionsCount,
          trendPercent: trendPercent(sessionsCount, prevSessions),
        },
      },
      charts: {
        leadSources: leadSources.map((row) => ({
          source: row.source,
          count: row._count._all,
        })),
        viewsOverTime,
        stageDistribution: stageDistribution.map((row) => ({
          stage: row.stage,
          count: row._count._all,
        })),
      },
      unclaimedLeads,
      featuredListing: featured
        ? {
            id: featured.id,
            title: featured.title,
            price: featured.price.toFixed(2),
            currency: featured.currency,
            city: featured.city,
            bedrooms: featured.bedrooms,
            bathrooms: Number(featured.bathrooms),
            coverImageUrl: cover,
            featured: featured.featured,
          }
        : null,
      agentLeaderboard: leaderboard,
      activity: filteredActivity.slice(0, 25),
    };
  },

  async getReports(query: MetricsReportsQuery, actor: AuthUser) {
    if (actor.role !== "admin" && actor.role !== "super_admin") {
      throw new AppError("AUTH_FORBIDDEN", "Reports require admin", 403);
    }
    const dash = await this.getDashboard(
      { from: query.from, to: query.to, activityType: "all" },
      actor,
    );
    return {
      reportType: query.reportType,
      generatedAt: new Date().toISOString(),
      data: {
        range: dash.range,
        kpis: dash.kpis,
        charts: dash.charts,
        unclaimedLeads: dash.unclaimedLeads,
      },
    };
  },
};
