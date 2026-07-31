export const ROLES = ["customer", "agent", "admin", "super_admin"] as const;
export type Role = (typeof ROLES)[number];

/** Guest = unauthenticated; not stored on User.role */
export type AccessRole = Role | "guest";
