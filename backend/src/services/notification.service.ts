import { prisma } from "../lib/prisma.js";
import { getEmailClient } from "../integrations/email/email.client.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  notificationRepository,
  toPublicNotification,
} from "../repositories/notification.repository.js";
import type { ListNotificationsQuery } from "../validators/notification.validators.js";
import { notificationRuleService } from "./notificationRule.service.js";

type NewLeadNotifyInput = {
  id: string;
  name: string;
  email: string;
  source: string;
  propertyId: string | null;
  assigneeAgentId: string | null;
};

async function resolveRecipients(lead: NewLeadNotifyInput) {
  const userIds = new Set<string>();
  const emails = new Set<string>();

  if (lead.assigneeAgentId) {
    const agent = await prisma.agent.findUnique({
      where: { id: lead.assigneeAgentId },
      select: { userId: true, email: true },
    });
    if (agent?.userId) userIds.add(agent.userId);
    if (agent?.email) emails.add(agent.email.trim().toLowerCase());
  }

  if (userIds.size === 0) {
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ["admin", "super_admin"] },
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, email: true },
    });
    for (const admin of admins) {
      userIds.add(admin.id);
      emails.add(admin.email.trim().toLowerCase());
    }
  } else {
    const users = await prisma.user.findMany({
      where: { id: { in: [...userIds] } },
      select: { email: true },
    });
    for (const u of users) emails.add(u.email.trim().toLowerCase());
  }

  return { userIds: [...userIds], emails: [...emails] };
}

export const notificationService = {
  async list(userId: string, query: ListNotificationsQuery) {
    const { total, unreadCount, rows } = await notificationRepository.listForUser(
      userId,
      query.page,
      query.pageSize,
    );
    return {
      data: rows.map(toPublicNotification),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
        unreadCount,
      },
    };
  },

  async markRead(id: string, userId: string) {
    const existing = await notificationRepository.findOwned(id, userId);
    if (!existing) throw new AppError("RESOURCE_NOT_FOUND", "Notification not found", 404);
    if (!existing.readAt) {
      await notificationRepository.markRead(id, userId);
      const updated = await notificationRepository.findOwned(id, userId);
      return toPublicNotification(updated!);
    }
    return toPublicNotification(existing);
  },

  async markAllRead(userId: string) {
    await notificationRepository.markAllRead(userId);
    return { message: "All notifications marked read" };
  },

  /** Dispatch new-lead in-app/email per admin notification rules. */
  async notifyNewLead(lead: NewLeadNotifyInput) {
    const channels = await notificationRuleService.enabledChannels("new_lead");
    if (channels.length === 0) return;

    const { userIds, emails } = await resolveRecipients(lead);
    if (userIds.length === 0 && emails.length === 0) return;

    const title = "New lead received";
    const body = `${lead.name} (${lead.email}) via ${lead.source}`;
    const payloadJson = {
      leadId: lead.id,
      propertyId: lead.propertyId,
      source: lead.source,
    };

    if (channels.includes("in_app") && userIds.length > 0) {
      await notificationRepository.createMany(
        userIds.map((userId) => ({
          userId,
          type: "new_lead",
          title,
          body,
          payloadJson,
        })),
      );
    }

    if (channels.includes("email") && emails.length > 0) {
      try {
        await getEmailClient().send({
          to: emails,
          subject: `[PropVista] ${title}`,
          text: [
            title,
            "",
            body,
            "",
            `Lead ID: ${lead.id}`,
            lead.propertyId ? `Property ID: ${lead.propertyId}` : null,
            `Source: ${lead.source}`,
          ]
            .filter(Boolean)
            .join("\n"),
          headers: { "X-PropVista-Event": "new_lead" },
        });
      } catch (err) {
        console.error("[email] new_lead send failed", err);
      }
    }
  },
};
