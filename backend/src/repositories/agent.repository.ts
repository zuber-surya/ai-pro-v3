import type { Agent } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export type PublicAgent = {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string | null;
  profileImageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export function toPublicAgent(agent: Agent): PublicAgent {
  return {
    id: agent.id,
    userId: agent.userId,
    name: agent.name,
    email: agent.email,
    phone: agent.phone,
    profileImageUrl: agent.profileImageUrl,
    isActive: agent.isActive,
    createdAt: agent.createdAt.toISOString(),
    updatedAt: agent.updatedAt.toISOString(),
  };
}

export const agentRepository = {
  findById(id: string) {
    return prisma.agent.findUnique({ where: { id } });
  },

  findByEmail(email: string) {
    return prisma.agent.findFirst({
      where: { email: email.toLowerCase() },
    });
  },

  findByUserId(userId: string) {
    return prisma.agent.findUnique({ where: { userId } });
  },

  async list(params: { page: number; pageSize: number }) {
    const [total, rows] = await Promise.all([
      prisma.agent.count(),
      prisma.agent.findMany({
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
    ]);
    return { total, rows };
  },

  create(data: {
    name: string;
    email: string;
    phone?: string;
    userId?: string;
  }) {
    return prisma.agent.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        userId: data.userId,
      },
    });
  },

  update(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string | null;
      userId?: string | null;
      profileImageUrl?: string | null;
      isActive?: boolean;
    },
  ) {
    return prisma.agent.update({
      where: { id },
      data: {
        ...data,
        email: data.email?.toLowerCase(),
      },
    });
  },

  delete(id: string) {
    return prisma.agent.delete({ where: { id } });
  },
};
