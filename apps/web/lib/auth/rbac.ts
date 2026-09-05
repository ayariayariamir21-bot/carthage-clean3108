export const ROLES = ["admin", "supervisor", "agent"] as const;

export type Role = (typeof ROLES)[number];

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  mustChangePassword?: boolean;
}

export type AccessDecision =
  { ok: true; user: AuthUser } | { ok: false; reason: "unauthenticated" | "forbidden" };

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function hasRole(user: AuthUser | null, required: Role = "admin"): boolean {
  return user !== null && user.role === required;
}

export function authorize(user: AuthUser | null, required: Role = "admin"): AccessDecision {
  if (!user) {
    return { ok: false, reason: "unauthenticated" };
  }
  if (user.role !== required) {
    return { ok: false, reason: "forbidden" };
  }
  return { ok: true, user };
}
