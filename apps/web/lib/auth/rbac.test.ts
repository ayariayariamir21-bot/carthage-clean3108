import { describe, expect, it } from "vitest";
import { authorize, hasRole, isRole, type AuthUser, type Role } from "./rbac";

const admin: AuthUser = { id: "u-1", email: "admin@carthage.tn", role: "admin" };
const supervisor: AuthUser = { id: "u-2", email: "sup@carthage.tn", role: "supervisor" };
const agent: AuthUser = { id: "u-3", email: "agent@carthage.tn", role: "agent" };

describe("isRole", () => {
  it("recognizes valid roles", () => {
    expect(isRole("admin")).toBe(true);
    expect(isRole("supervisor")).toBe(true);
    expect(isRole("agent")).toBe(true);
  });

  it("rejects invalid or non-string values", () => {
    expect(isRole("root")).toBe(false);
    expect(isRole("")).toBe(false);
    expect(isRole(null)).toBe(false);
    expect(isRole(42)).toBe(false);
  });
});

describe("hasRole", () => {
  it("returns true only when the user has the exact required role", () => {
    expect(hasRole(admin, "admin")).toBe(true);
    expect(hasRole(supervisor, "admin")).toBe(false);
    expect(hasRole(agent, "admin")).toBe(false);
  });

  it("returns false for a null user", () => {
    expect(hasRole(null, "admin")).toBe(false);
  });

  it("defaults the required role to admin", () => {
    expect(hasRole(admin)).toBe(true);
    expect(hasRole(supervisor)).toBe(false);
  });
});

describe("authorize", () => {
  it("rejects a null user as unauthenticated", () => {
    const result = authorize(null, "admin");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("unauthenticated");
    }
  });

  it("rejects a user with the wrong role as forbidden", () => {
    const result = authorize(supervisor, "admin");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("forbidden");
    }
  });

  it("rejects a user with a lower role when admin is required", () => {
    const result = authorize(agent, "admin");
    expect(result.ok).toBe(false);
  });

  it("allows the correct role", () => {
    const result = authorize(admin, "admin");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user).toBe(admin);
    }
  });

  it("supports requiring non-admin roles", () => {
    expect(authorize(supervisor, "supervisor").ok).toBe(true);
    expect(authorize(agent, "agent").ok).toBe(true);
    expect(authorize(admin, "supervisor").ok).toBe(false);
  });

  it("defaults the required role to admin", () => {
    expect(authorize(admin).ok).toBe(true);
    expect(authorize(supervisor).ok).toBe(false);
  });
});

const _role: Role = "admin";
void _role;
