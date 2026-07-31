import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { AppError } from "../middleware/errorHandler.js";
import { toPublicUser, userRepository } from "../repositories/user.repository.js";
import type {
  ListUsersQuery,
  UserCreateInput,
  UserUpdateInput,
} from "../validators/user.validators.js";

const BCRYPT_ROUNDS = 10;
const PRIVILEGED_ROLES: Role[] = ["admin", "super_admin"];

function assertCanAssignRole(actorRole: Role, targetRole: Role): void {
  if (PRIVILEGED_ROLES.includes(targetRole) && actorRole !== "super_admin") {
    throw new AppError("AUTH_FORBIDDEN", "Only Super Admin can assign admin roles", 403);
  }
}

export const userService = {
  async list(query: ListUsersQuery) {
    const { total, rows } = await userRepository.list(query);
    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
    return {
      data: rows.map(toPublicUser),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages,
      },
    };
  },

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError("RESOURCE_NOT_FOUND", "User not found", 404);
    }
    return toPublicUser(user);
  },

  async create(input: UserCreateInput, actorRole: Role) {
    assertCanAssignRole(actorRole, input.role);

    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError("CONFLICT_DUPLICATE_EMAIL", "Email already registered", 409, [
        { field: "email", issue: "duplicate" },
      ]);
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await userRepository.create({
      email: input.email,
      passwordHash,
      role: input.role,
      fullName: input.fullName,
      phone: input.phone,
    });
    return toPublicUser(user);
  },

  async update(id: string, input: UserUpdateInput, actorRole: Role) {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new AppError("RESOURCE_NOT_FOUND", "User not found", 404);
    }

    if (input.role) {
      assertCanAssignRole(actorRole, input.role);
    }

    const user = await userRepository.update(id, {
      fullName: input.fullName,
      phone: input.phone,
      role: input.role,
      isActive: input.isActive,
    });
    return toPublicUser(user);
  },

  async softDelete(id: string) {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new AppError("RESOURCE_NOT_FOUND", "User not found", 404);
    }
    await userRepository.softDelete(id);
  },
};
