import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createZone,
  deleteZone,
  normalizeCode,
  setZoneActive,
  updateZone,
  type ZoneRepository,
} from "./service";
import { logAuditEvent } from "@/lib/audit/log";

vi.mock("@/lib/audit/log", () => ({
  logAuditEvent: vi.fn(),
}));

function makeRepo(overrides: Partial<ZoneRepository> = {}): {
  repo: ZoneRepository;
  inserted: unknown[];
  updated: Array<{ id: string; data: unknown }>;
  actives: Array<{ id: string; value: boolean }>;
  deleted: string[];
  tourCounts: Map<string, number>;
  auditEvents: Array<{
    actorId: string | null;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: unknown;
  }>;
} {
  const inserted: unknown[] = [];
  const updated: Array<{ id: string; data: unknown }> = [];
  const actives: Array<{ id: string; value: boolean }> = [];
  const deleted: string[] = [];
  const tourCounts = new Map<string, number>();
  const auditEvents: Array<{
    actorId: string | null;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: unknown;
  }> = [];
  return {
    inserted,
    updated,
    actives,
    deleted,
    tourCounts,
    auditEvents,
    repo: {
      listZones: async () => [],
      findZoneById: async () => ({
        id: "z1",
        name: "Nord",
        code: "Z01",
        description: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findZoneByCode: async () => undefined,
      findZoneByCodeExcluding: async () => undefined,
      insertZone: async (data) => {
        inserted.push(data);
        return { id: "new-id", code: data.code };
      },
      updateZone: async (id, data) => {
        updated.push({ id, data });
      },
      setActive: async (id, value) => {
        actives.push({ id, value });
      },
      deleteZone: async (id) => {
        deleted.push(id);
      },
      countToursByZone: async (zoneId) => tourCounts.get(zoneId) ?? 0,
      ...overrides,
    },
  };
}

describe("normalizeCode", () => {
  it("trims and uppercases", () => {
    expect(normalizeCode("  z01 ")).toBe("Z01");
  });
});

describe("createZone", () => {
  it("creates a zone with a normalized unique code", async () => {
    const { repo, inserted } = makeRepo();
    const result = await createZone(
      { name: "Zone Nord", code: " z01 ", description: "Quartier nord" },
      { repository: repo },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.zone.code).toBe("Z01");
    }
    expect(inserted).toHaveLength(1);
    const data = inserted[0] as { name: string; code: string; description: string | null };
    expect(data).toEqual({ name: "Zone Nord", code: "Z01", description: "Quartier nord" });
  });

  it("rejects empty name or code", async () => {
    const { repo } = makeRepo();
    expect((await createZone({ name: "", code: "Z01" }, { repository: repo })).ok).toBe(false);
    expect((await createZone({ name: "X", code: "  " }, { repository: repo })).ok).toBe(false);
  });

  it("rejects a duplicate code", async () => {
    const { repo } = makeRepo({ findZoneByCode: async () => ({ id: "existing" }) });
    const result = await createZone({ name: "X", code: "Z01" }, { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("code_taken");
    }
  });

  it("rejects name exceeding max length", async () => {
    const { repo } = makeRepo();
    const longName = "A".repeat(101);
    const result = await createZone({ name: longName, code: "Z01" }, { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("name_too_long");
    }
  });

  it("rejects code exceeding max length after normalization", async () => {
    const { repo } = makeRepo();
    const longCode = "A".repeat(21);
    const result = await createZone({ name: "X", code: longCode }, { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("code_too_long");
    }
  });

  it("rejects description exceeding max length", async () => {
    const { repo } = makeRepo();
    const longDesc = "A".repeat(501);
    const result = await createZone(
      { name: "X", code: "Z01", description: longDesc },
      { repository: repo },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("description_too_long");
    }
  });

  it("accepts name at exactly max length", async () => {
    const { repo } = makeRepo();
    const maxName = "A".repeat(100);
    const result = await createZone({ name: maxName, code: "Z01" }, { repository: repo });
    expect(result.ok).toBe(true);
  });

  it("accepts code at exactly max length", async () => {
    const { repo } = makeRepo();
    const maxCode = "A".repeat(20);
    const result = await createZone({ name: "X", code: maxCode }, { repository: repo });
    expect(result.ok).toBe(true);
  });

  it("accepts description at exactly max length", async () => {
    const { repo } = makeRepo();
    const maxDesc = "A".repeat(500);
    const result = await createZone(
      { name: "X", code: "Z01", description: maxDesc },
      { repository: repo },
    );
    expect(result.ok).toBe(true);
  });

  it("accepts Unicode characters in name", async () => {
    const { repo } = makeRepo();
    const unicodeName = "Zone 北京 東京";
    const result = await createZone({ name: unicodeName, code: "Z01" }, { repository: repo });
    expect(result.ok).toBe(true);
  });
});

describe("updateZone", () => {
  it("updates provided fields", async () => {
    const { repo, updated } = makeRepo();
    const result = await updateZone(
      "z1",
      { name: "Nord Modifié", description: "Desc" },
      { repository: repo },
    );
    expect(result.ok).toBe(true);
    expect(updated).toEqual([
      { id: "z1", data: { name: "Nord Modifié", code: "Z01", description: "Desc" } },
    ]);
  });

  it("rejects a code already used by another zone", async () => {
    const { repo } = makeRepo({ findZoneByCodeExcluding: async () => ({ id: "other" }) });
    const result = await updateZone("z1", { code: "Z02" }, { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("code_taken");
    }
  });

  it("returns not_found for an unknown zone", async () => {
    const { repo } = makeRepo({ findZoneById: async () => undefined });
    const result = await updateZone("missing", { name: "X" }, { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("not_found");
    }
  });

  it("rejects name exceeding max length on update", async () => {
    const { repo } = makeRepo();
    const longName = "A".repeat(101);
    const result = await updateZone("z1", { name: longName }, { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("name_too_long");
    }
  });

  it("rejects code exceeding max length on update", async () => {
    const { repo } = makeRepo();
    const longCode = "A".repeat(21);
    const result = await updateZone("z1", { code: longCode }, { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("code_too_long");
    }
  });

  it("rejects description exceeding max length on update", async () => {
    const { repo } = makeRepo();
    const longDesc = "A".repeat(501);
    const result = await updateZone("z1", { description: longDesc }, { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("description_too_long");
    }
  });

  it("accepts name at exactly max length on update", async () => {
    const { repo } = makeRepo();
    const maxName = "A".repeat(100);
    const result = await updateZone("z1", { name: maxName }, { repository: repo });
    expect(result.ok).toBe(true);
  });

  it("accepts code at exactly max length on update", async () => {
    const { repo } = makeRepo();
    const maxCode = "A".repeat(20);
    const result = await updateZone("z1", { code: maxCode }, { repository: repo });
    expect(result.ok).toBe(true);
  });

  it("accepts description at exactly max length on update", async () => {
    const { repo } = makeRepo();
    const maxDesc = "A".repeat(500);
    const result = await updateZone("z1", { description: maxDesc }, { repository: repo });
    expect(result.ok).toBe(true);
  });
});

describe("setZoneActive", () => {
  it("activates and deactivates", async () => {
    const { repo, actives } = makeRepo();
    expect((await setZoneActive("z1", false, { repository: repo })).ok).toBe(true);
    expect((await setZoneActive("z1", true, { repository: repo })).ok).toBe(true);
    expect(actives).toEqual([
      { id: "z1", value: false },
      { id: "z1", value: true },
    ]);
  });

  it("returns not_found for an unknown zone", async () => {
    const { repo } = makeRepo({ findZoneById: async () => undefined });
    const result = await setZoneActive("missing", false, { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("not_found");
    }
  });
});

describe("deleteZone", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes an existing zone", async () => {
    const { repo, deleted } = makeRepo();
    const result = await deleteZone("z1", { repository: repo, actorId: "admin-1" });
    expect(result.ok).toBe(true);
    expect(deleted).toEqual(["z1"]);
    expect(logAuditEvent).toHaveBeenCalledWith("admin-1", "zone.delete", "zone", "z1", {
      name: "Nord",
      code: "Z01",
    });
  });

  it("returns not_found for an unknown zone", async () => {
    const { repo } = makeRepo({ findZoneById: async () => undefined });
    const result = await deleteZone("missing", { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("not_found");
    }
    expect(logAuditEvent).not.toHaveBeenCalled();
  });

  it("returns has_tours when zone has dependent tours", async () => {
    const { repo, tourCounts } = makeRepo();
    tourCounts.set("z1", 3);
    const result = await deleteZone("z1", { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("has_tours");
    }
    expect(logAuditEvent).not.toHaveBeenCalled();
  });

  it("deletes zone with zero tours", async () => {
    const { repo, deleted, tourCounts } = makeRepo();
    tourCounts.set("z1", 0);
    const result = await deleteZone("z1", { repository: repo, actorId: "admin-1" });
    expect(result.ok).toBe(true);
    expect(deleted).toEqual(["z1"]);
    expect(logAuditEvent).toHaveBeenCalledWith("admin-1", "zone.delete", "zone", "z1", {
      name: "Nord",
      code: "Z01",
    });
  });

  it("returns foreign_key on FK constraint violation", async () => {
    const { repo } = makeRepo({
      deleteZone: async () => {
        throw new Error("foreign key constraint violated");
      },
    });
    const result = await deleteZone("z1", { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("foreign_key");
    }
    expect(logAuditEvent).not.toHaveBeenCalled();
  });
});
