import { Prisma } from "@prisma/client";
import { AppError } from "../middleware/errorHandler.js";
import type { AuthUser } from "../middleware/requireAuth.middleware.js";
import {
  asStringArray,
  computeCompletionPct,
  customerProfileRepository,
} from "../repositories/customerProfile.repository.js";
import { favoriteRepository, toFavoriteItem } from "../repositories/favorite.repository.js";
import { prisma } from "../lib/prisma.js";
import { toPublicProperty, type PropertyWithRelations } from "../repositories/property.repository.js";
import type {
  CustomerProfileUpdateInput,
  ListInquiriesQuery,
} from "../validators/customer.validators.js";

function toMoney(value: string | number | null | undefined): Prisma.Decimal | null {
  if (value === null || value === undefined || value === "") return null;
  try {
    return new Prisma.Decimal(value);
  } catch {
    throw new AppError("VALIDATION_ERROR", "Invalid budget value", 422, [
      { field: "preferences.budget", issue: "must be a number" },
    ]);
  }
}

function stageLabel(stage: string): string {
  const map: Record<string, string> = {
    new: "Inquiry Sent",
    contacted: "Contacted",
    qualified: "Qualified",
    visit_scheduled: "Visit Scheduled",
    negotiation: "Negotiation",
    won: "Won",
    lost: "Lost",
  };
  return map[stage] ?? stage;
}

export const customerService = {
  async getDashboard(actor: AuthUser) {
    const email = actor.email.toLowerCase();
    const [user, favoritesCount, savedSearchesCount, inquiriesCount, recentFavs] =
      await Promise.all([
        prisma.user.findUnique({ where: { id: actor.id } }),
        prisma.favorite.count({ where: { userId: actor.id } }),
        prisma.savedSearch.count({ where: { userId: actor.id } }),
        prisma.lead.count({
          where: {
            OR: [{ customerUserId: actor.id }, { email }],
          },
        }),
        favoriteRepository.list(actor.id, 1, 3),
      ]);

    return {
      favoritesCount,
      inquiriesCount,
      savedSearchesCount,
      recentProperties: recentFavs.rows.map((r) => toFavoriteItem(r).property),
      welcomeName: user?.fullName?.split(" ")[0] || "there",
    };
  },

  async getProfile(actor: AuthUser) {
    const user = await prisma.user.findUnique({ where: { id: actor.id } });
    if (!user) throw new AppError("RESOURCE_NOT_FOUND", "User not found", 404);
    const profile = await customerProfileRepository.ensure(actor.id);
    return {
      fullName: user.fullName ?? "",
      email: user.email,
      phone: user.phone,
      preferences: {
        budgetMin: profile.budgetMin?.toFixed(2) ?? null,
        budgetMax: profile.budgetMax?.toFixed(2) ?? null,
        propertyTypes: asStringArray(profile.propertyTypesJson),
        bedsMin: profile.bedsMin,
        locations: asStringArray(profile.locationPreferencesJson),
        completionPct: profile.completionPct,
      },
    };
  },

  async updateProfile(input: CustomerProfileUpdateInput, actor: AuthUser) {
    if (input.fullName !== undefined || input.phone !== undefined) {
      await prisma.user.update({
        where: { id: actor.id },
        data: {
          ...(input.fullName !== undefined ? { fullName: input.fullName.trim() } : {}),
          ...(input.phone !== undefined
            ? { phone: input.phone === null ? null : input.phone.trim() || null }
            : {}),
        },
      });
    }

    if (input.preferences) {
      const existing = await customerProfileRepository.ensure(actor.id);
      const budgetMin =
        input.preferences.budgetMin !== undefined
          ? toMoney(input.preferences.budgetMin)
          : existing.budgetMin;
      const budgetMax =
        input.preferences.budgetMax !== undefined
          ? toMoney(input.preferences.budgetMax)
          : existing.budgetMax;
      if (budgetMin != null && budgetMax != null && budgetMin.gt(budgetMax)) {
        throw new AppError("VALIDATION_ERROR", "budgetMin cannot exceed budgetMax", 422, [
          { field: "preferences.budgetMin", issue: "must be <= budgetMax" },
        ]);
      }
      const propertyTypesJson =
        input.preferences.propertyTypes !== undefined
          ? input.preferences.propertyTypes
          : existing.propertyTypesJson;
      const bedsMin =
        input.preferences.bedsMin !== undefined
          ? input.preferences.bedsMin
          : existing.bedsMin;
      const locationPreferencesJson =
        input.preferences.locations !== undefined
          ? input.preferences.locations
          : existing.locationPreferencesJson;

      const completionPct = computeCompletionPct({
        budgetMin,
        budgetMax,
        propertyTypesJson: propertyTypesJson as Prisma.JsonValue,
        bedsMin,
        locationPreferencesJson: locationPreferencesJson as Prisma.JsonValue,
      });

      await customerProfileRepository.upsert(actor.id, {
        budgetMin,
        budgetMax,
        propertyTypesJson: propertyTypesJson as Prisma.InputJsonValue,
        bedsMin,
        locationPreferencesJson: locationPreferencesJson as Prisma.InputJsonValue,
        completionPct,
      });
    }

    return this.getProfile(actor);
  },

  async listInquiries(query: ListInquiriesQuery, actor: AuthUser) {
    const email = actor.email.toLowerCase();
    const where: Prisma.LeadWhereInput = {
      OR: [{ customerUserId: actor.id }, { email }],
    };
    const [total, rows] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          property: {
            include: {
              images: {
                where: { kind: "photo" },
                orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
                take: 1,
              },
              amenities: true,
            },
          },
        },
      }),
    ]);

    return {
      data: rows.map((lead) => ({
        id: lead.id,
        propertyId: lead.propertyId,
        propertyTitle: lead.property?.title ?? null,
        property: lead.property
          ? toPublicProperty(lead.property as PropertyWithRelations)
          : null,
        status: stageLabel(lead.stage),
        stage: lead.stage,
        message: lead.message,
        source: lead.source,
        createdAt: lead.createdAt.toISOString(),
      })),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
    };
  },
};
