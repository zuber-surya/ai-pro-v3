import type { Role, User } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export type PublicUser = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: Role;
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
};
