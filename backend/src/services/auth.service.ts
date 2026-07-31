import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { User } from "@prisma/client";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  generateRefreshTokenRaw,
  hashToken,
  refreshTokenRepository,
} from "../repositories/refreshToken.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import type { LoginInput, RegisterInput } from "../validators/auth.validators.js";

const ACCESS_TTL_SEC = 60 * 15; // 15 minutes
const REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const BCRYPT_ROUNDS = 10;

function requireJwtSecrets(): { access: string; refresh: string } {
  const access = env.JWT_ACCESS_SECRET;
  const refresh = env.JWT_REFRESH_SECRET;
  if (!access || !refresh) {
    throw new AppError("INTERNAL_ERROR", "JWT secrets are not configured", 500);
  }
  return { access, refresh };
}

function signAccessToken(user: User): string {
  const { access } = requireJwtSecrets();
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    access,
    { expiresIn: ACCESS_TTL_SEC },
  );
}

async function issueTokenPair(user: User) {
  const accessToken = signAccessToken(user);
  const refreshToken = generateRefreshTokenRaw();
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
  await refreshTokenRepository.create({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt,
  });

  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer" as const,
    expiresIn: ACCESS_TTL_SEC,
  };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError("CONFLICT_DUPLICATE_EMAIL", "Email already registered", 409, [
        { field: "email", issue: "duplicate" },
      ]);
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await userRepository.createCustomer({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone,
    });

    return issueTokenPair(user);
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !user.isActive || user.deletedAt) {
      throw new AppError("AUTH_INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new AppError("AUTH_INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    return issueTokenPair(user);
  },
};
