import type { NotificationChannel, NotificationRule } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import type {
  ListNotificationRulesQuery,
  NotificationRuleCreateInput,
  NotificationRuleUpdateInput,
} from "../validators/notificationRule.validators.js";

export type NotificationRuleDto = {
  id: string;
  event: string;
  channels: NotificationChannel[];
  enabled: boolean;
  template?: string | null;
};

function groupRows(rows: NotificationRule[]): NotificationRuleDto[] {
  const byEvent = new Map<string, NotificationRule[]>();
  for (const row of rows) {
    const list = byEvent.get(row.eventType) ?? [];
    list.push(row);
    byEvent.set(row.eventType, list);
  }

  return [...byEvent.entries()].map(([event, eventRows]) => {
    const sorted = [...eventRows].sort((a, b) => a.channel.localeCompare(b.channel));
    const enabledChannels = sorted.filter((r) => r.isEnabled).map((r) => r.channel);
    const anyEnabled = enabledChannels.length > 0;
    return {
      id: sorted[0]!.id,
      event,
      channels: anyEnabled ? enabledChannels : sorted.map((r) => r.channel),
      enabled: anyEnabled,
      template: sorted.find((r) => r.templateKey)?.templateKey ?? null,
    };
  });
}

async function rowsForEvent(eventType: string) {
  return prisma.notificationRule.findMany({
    where: { eventType },
    orderBy: { channel: "asc" },
  });
}

async function ensureDefaults() {
  const count = await prisma.notificationRule.count();
  if (count > 0) return;
  await prisma.notificationRule.createMany({
    data: [
      { eventType: "new_lead", channel: "email", isEnabled: true, templateKey: "new_lead_email" },
      { eventType: "new_lead", channel: "in_app", isEnabled: true, templateKey: "new_lead_in_app" },
    ],
  });
}

export const notificationRuleService = {
  async list(query: ListNotificationRulesQuery) {
    await ensureDefaults();
    const rows = await prisma.notificationRule.findMany({ orderBy: [{ eventType: "asc" }, { channel: "asc" }] });
    const grouped = groupRows(rows);
    const total = grouped.length;
    const start = (query.page - 1) * query.pageSize;
    const data = grouped.slice(start, start + query.pageSize);
    return {
      data,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
    };
  },

  async create(input: NotificationRuleCreateInput, actorUserId: string) {
    const uniqueChannels = [...new Set(input.channels)];
    if (uniqueChannels.some((c) => c !== "email" && c !== "in_app")) {
      throw new AppError("VALIDATION_ERROR", "Only email and in_app channels are allowed", 422);
    }

    const existing = await rowsForEvent(input.event);
    if (existing.length > 0) {
      throw new AppError("CONFLICT_DUPLICATE", "Rule for this event already exists", 409);
    }

    const allChannels: NotificationChannel[] = ["email", "in_app"];
    await prisma.$transaction(
      allChannels.map((channel) =>
        prisma.notificationRule.create({
          data: {
            eventType: input.event,
            channel,
            isEnabled: input.enabled && uniqueChannels.includes(channel),
            templateKey: input.template ?? `new_lead_${channel}`,
            createdBy: actorUserId,
            updatedBy: actorUserId,
          },
        }),
      ),
    );

    return groupRows(await rowsForEvent(input.event))[0]!;
  },

  async update(id: string, input: NotificationRuleUpdateInput, actorUserId: string) {
    const anchor = await prisma.notificationRule.findUnique({ where: { id } });
    if (!anchor) throw new AppError("RESOURCE_NOT_FOUND", "Notification rule not found", 404);

    let rows = await rowsForEvent(anchor.eventType);
    if (rows.length === 0) {
      throw new AppError("RESOURCE_NOT_FOUND", "Notification rule not found", 404);
    }

    if (input.channels) {
      const uniqueChannels = [...new Set(input.channels)];
      const enabled = input.enabled ?? true;
      for (const channel of ["email", "in_app"] as const) {
        const row = rows.find((r) => r.channel === channel);
        const shouldEnable = enabled && uniqueChannels.includes(channel);
        if (row) {
          await prisma.notificationRule.update({
            where: { id: row.id },
            data: {
              isEnabled: shouldEnable,
              templateKey:
                input.template === undefined ? row.templateKey : input.template,
              updatedBy: actorUserId,
            },
          });
        } else {
          await prisma.notificationRule.create({
            data: {
              eventType: anchor.eventType,
              channel,
              isEnabled: shouldEnable,
              templateKey: input.template ?? `new_lead_${channel}`,
              createdBy: actorUserId,
              updatedBy: actorUserId,
            },
          });
        }
      }
    } else {
      for (const row of rows) {
        await prisma.notificationRule.update({
          where: { id: row.id },
          data: {
            ...(input.enabled !== undefined ? { isEnabled: input.enabled } : {}),
            ...(input.template !== undefined ? { templateKey: input.template } : {}),
            updatedBy: actorUserId,
          },
        });
      }
    }

    rows = await rowsForEvent(anchor.eventType);
    return groupRows(rows)[0]!;
  },

  async remove(id: string) {
    const anchor = await prisma.notificationRule.findUnique({ where: { id } });
    if (!anchor) throw new AppError("RESOURCE_NOT_FOUND", "Notification rule not found", 404);
    await prisma.notificationRule.deleteMany({ where: { eventType: anchor.eventType } });
  },

  /** Enabled channels for an event; defaults both on when no rows. */
  async enabledChannels(eventType: string): Promise<NotificationChannel[]> {
    await ensureDefaults();
    const rows = await prisma.notificationRule.findMany({
      where: { eventType, isEnabled: true },
    });
    return rows.map((r) => r.channel);
  },
};
