import type { Role, User } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export type PublicUser = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
    });
  },

  findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
  },

  createCustomer(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    phone?: string;
  }) {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        role: "customer",
      },
    });
  },

  create(data: {
    email: string;
    passwordHash: string;
    role: Role;
    fullName?: string;
    phone?: string;
  }) {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role,
        fullName: data.fullName,
        phone: data.phone,
      },
    });
  },

  async list(params: { page: number; pageSize: number }) {
    const where = { deletedAt: null };
    const [total, rows] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
    ]);
    return { total, rows };
  },

  update(
    id: string,
    data: {
      fullName?: string | null;
      phone?: string | null;
      role?: Role;
      isActive?: boolean;
    },
  ) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  },
};
