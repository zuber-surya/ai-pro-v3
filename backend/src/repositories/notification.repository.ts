import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export type NotificationRow = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string | null;
  payloadJson: Prisma.JsonValue | null;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toPublicNotification(row: NotificationRow) {
  return {
    id: row.id,
    channel: "in_app" as const,
    type: row.type,
    title: row.title,
    body: row.body,
    read: row.readAt != null,
    createdAt: row.createdAt.toISOString(),
    payload: row.payloadJson,
  };
}

export const notificationRepository = {
  async listForUser(userId: string, page: number, pageSize: number) {
    const where = { userId };
    const [total, unreadCount, rows] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, readAt: null } }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { total, unreadCount, rows };
  },

  findOwned(id: string, userId: string) {
    return prisma.notification.findFirst({ where: { id, userId } });
  },

  markRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    });
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  },

  createMany(
    rows: Array<{
      userId: string;
      type: string;
      title: string;
      body?: string | null;
      payloadJson?: Prisma.InputJsonValue;
    }>,
  ) {
    if (rows.length === 0) return Promise.resolve({ count: 0 });
    return prisma.notification.createMany({ data: rows });
  },
};
