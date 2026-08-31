import { describe, expect, it } from "vitest";
import {
  createZone,
  deleteZone,
  normalizeCode,
  setZoneActive,
  updateZone,
  type ZoneRepository,
} from "./service";

function makeRepo(overrides: Partial<ZoneRepository> = {}): {
  repo: ZoneRepository;
  inserted: unknown[];
  updated: Array<{ id: string; data: unknown }>;
  actives: Array<{ id: string; value: boolean }>;
  deleted: string[];
} {
  const inserted: unknown[] = [];
  const updated: Array<{ id: string; data: unknown }> = [];
  const actives: Array<{ id: string; value: boolean }> = [];
  const deleted: string[] = [];
  return {
    inserted,
    updated,
    actives,
    deleted,
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
  it("deletes an existing zone", async () => {
    const { repo, deleted } = makeRepo();
    const result = await deleteZone("z1", { repository: repo });
    expect(result.ok).toBe(true);
    expect(deleted).toEqual(["z1"]);
  });

  it("returns not_found for an unknown zone", async () => {
    const { repo } = makeRepo({ findZoneById: async () => undefined });
    const result = await deleteZone("missing", { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("not_found");
    }
  });
});
