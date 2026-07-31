import { z } from "zod";

export const ASSIGNABLE_ROLES = ["customer", "agent", "admin", "super_admin"] as const;

export const userCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(ASSIGNABLE_ROLES),
  fullName: z.string().min(1).max(200).optional(),
  phone: z.string().max(40).optional(),
});

export const userUpdateSchema = z
  .object({
    fullName: z.string().min(1).max(200).optional(),
    phone: z.string().max(40).nullable().optional(),
    role: z.enum(ASSIGNABLE_ROLES).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field required" });

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
