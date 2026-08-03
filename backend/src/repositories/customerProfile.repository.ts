import type { CustomerProfile, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export function asStringArray(value: Prisma.JsonValue | null | undefined): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

export function computeCompletionPct(input: {
  budgetMin: Prisma.Decimal | null;
  budgetMax: Prisma.Decimal | null;
  propertyTypesJson: Prisma.JsonValue | null;
  bedsMin: number | null;
  locationPreferencesJson: Prisma.JsonValue | null;
}): number {
  const total = 5;
  let filled = 0;
  if (input.budgetMin != null) filled += 1;
  if (input.budgetMax != null) filled += 1;
  if (asStringArray(input.propertyTypesJson).length) filled += 1;
  if (input.bedsMin != null) filled += 1;
  if (asStringArray(input.locationPreferencesJson).length) filled += 1;
  return Math.round((filled / total) * 100);
}

export const customerProfileRepository = {
  findByUserId(userId: string) {
    return prisma.customerProfile.findUnique({ where: { userId } });
  },

  upsert(userId: string, data: Prisma.CustomerProfileUncheckedUpdateInput) {
    return prisma.customerProfile.upsert({
      where: { userId },
      create: {
        userId,
        budgetMin: (data.budgetMin as Prisma.Decimal | null | undefined) ?? null,
        budgetMax: (data.budgetMax as Prisma.Decimal | null | undefined) ?? null,
        propertyTypesJson: (data.propertyTypesJson as Prisma.InputJsonValue) ?? [],
        bedsMin: (data.bedsMin as number | null | undefined) ?? null,
        locationPreferencesJson:
          (data.locationPreferencesJson as Prisma.InputJsonValue) ?? [],
        completionPct: (data.completionPct as number | undefined) ?? 0,
      },
      update: data,
    });
  },

  ensure(userId: string): Promise<CustomerProfile> {
    return prisma.customerProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  },
};
