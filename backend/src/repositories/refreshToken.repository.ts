import { createHash, randomBytes } from "node:crypto";
import { prisma } from "../lib/prisma.js";

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function generateRefreshTokenRaw(): string {
  return randomBytes(48).toString("base64url");
}

export const refreshTokenRepository = {
  create(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    return prisma.refreshToken.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
    });
  },

  findValidByHash(tokenHash: string) {
    return prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  },

  revoke(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  },
};
