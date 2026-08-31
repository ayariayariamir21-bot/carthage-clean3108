import { describe, expect, it } from "vitest";
import type { Role } from "@/lib/auth/rbac";
import {
  assignByIdentifier,
  assignUserToZone,
  setAssignmentActive,
  type AssignmentRepository,
} from "./assignments";

function user(role: Role, isActive = true): { id: string; role: Role; isActive: boolean } {
  return { id: `user-${role}`, role, isActive };
}

function makeRepo(overrides: Partial<AssignmentRepository> = {}): {
  repo: AssignmentRepository;
  inserted: unknown[];
  actives: Array<{ id: string; value: boolean }>;
} {
  const inserted: unknown[] = [];
  const actives: Array<{ id: string; value: boolean }> = [];
  return {
    inserted,
    actives,
    repo: {
      findZone: async () => ({ id: "z1" }),
      findUserById: async (id) =>
        id.startsWith("user-") ? user(id.replace("user-", "") as Role) : undefined,
      findUserByIdentifier: async (identifier) => {
        const norm = identifier.trim().toLowerCase();
        if (norm === "admin@carthage.tn") return user("admin");
        if (norm === "agent@carthage.tn") return user("agent");
        return undefined;
      },
      findActiveAssignment: async () => undefined,
      insertAssignment: async (data) => {
        inserted.push(data);
        return { id: "a1" };
      },
      listAssignments: async () => [],
      findAssignment: async () => ({ id: "a1", isActive: true }),
      setAssignmentActive: async (id, value) => {
        actives.push({ id, value });
      },
      ...overrides,
    },
  };
}

describe("assignUserToZone", () => {
  it("assigns an agent to a zone", async () => {
    const { repo, inserted } = makeRepo();
    const result = await assignUserToZone("z1", "user-agent", { repository: repo });
    expect(result.ok).toBe(true);
    expect(inserted).toHaveLength(1);
    const data = inserted[0] as {
      zoneId: string;
      userId: string;
      isActive: boolean;
      assignedAt: Date;
    };
    expect(data).toEqual(
      expect.objectContaining({ zoneId: "z1", userId: "user-agent", isActive: true }),
    );
  });

  it("rejects an unknown zone", async () => {
    const { repo } = makeRepo({ findZone: async () => undefined });
    const result = await assignUserToZone("missing", "user-agent", { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("zone_not_found");
  });

  it("rejects an unknown or inactive user", async () => {
    const { repo } = makeRepo({ findUserById: async () => undefined });
    expect((await assignUserToZone("z1", "x", { repository: repo })).ok).toBe(false);

    const { repo: repoInactive } = makeRepo({
      findUserById: async () => user("agent", false),
    });
    const inactiveResult = await assignUserToZone("z1", "user-agent", { repository: repoInactive });
    expect(inactiveResult.ok).toBe(false);
    if (!inactiveResult.ok) expect(inactiveResult.error).toBe("user_not_found");
  });

  it("rejects a role incompatible (admin)", async () => {
    const { repo } = makeRepo({ findUserById: async () => user("admin") });
    const result = await assignUserToZone("z1", "user-admin", { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("role_invalid");
  });

  it("rejects a duplicate active assignment", async () => {
    const { repo } = makeRepo({ findActiveAssignment: async () => ({ id: "existing" }) });
    const result = await assignUserToZone("z1", "user-agent", { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("duplicate");
  });
});

describe("assignByIdentifier", () => {
  it("resolves an email then assigns", async () => {
    const { repo, inserted } = makeRepo();
    const result = await assignByIdentifier("z1", "agent@CARTHAGE.tn", { repository: repo });
    expect(result.ok).toBe(true);
    expect(inserted).toHaveLength(1);
  });

  it("returns user_not_found for an unknown identifier", async () => {
    const { repo } = makeRepo();
    const result = await assignByIdentifier("z1", "nobody@carthage.tn", { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("user_not_found");
  });
});

describe("setAssignmentActive", () => {
  it("deactivates an assignment", async () => {
    const { repo, actives } = makeRepo();
    const result = await setAssignmentActive("a1", false, { repository: repo });
    expect(result.ok).toBe(true);
    expect(actives).toEqual([{ id: "a1", value: false }]);
  });

  it("returns not_found for an unknown assignment", async () => {
    const { repo } = makeRepo({ findAssignment: async () => undefined });
    const result = await setAssignmentActive("missing", false, { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("not_found");
  });
});
