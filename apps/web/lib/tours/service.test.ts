import { describe, expect, it, vi } from "vitest";
import {
  createTour,
  isTodayOrFuture,
  parseDateOnly,
  type CreateTourInput,
  type TourRepository,
} from "./service";

function makeRepo(overrides: Partial<TourRepository> = {}) {
  const calls = { insertTourWithAgents: vi.fn(async () => ({ id: "tour-1" })) };
  const repo: TourRepository = {
    findZone: overrides.findZone ?? vi.fn(async () => undefined),
    findUserById: overrides.findUserById ?? vi.fn(async () => undefined),
    insertTourWithAgents: overrides.insertTourWithAgents ?? calls.insertTourWithAgents,
    listTours: overrides.listTours ?? vi.fn(async () => []),
    findTour: overrides.findTour ?? vi.fn(async () => undefined),
    findTourAgent: overrides.findTourAgent ?? vi.fn(async () => undefined),
    updateTour: overrides.updateTour ?? vi.fn(async () => {}),
    listTourIdsByUser: overrides.listTourIdsByUser ?? vi.fn(async () => []),
    queryTours: overrides.queryTours ?? vi.fn(async () => ({ rows: [], total: 0 })),
    getTourById: overrides.getTourById ?? vi.fn(async () => undefined),
    listCreators: overrides.listCreators ?? vi.fn(async () => []),
  };
  return { repo, calls };
}

const ADMIN = { id: "admin-1", isActive: true, role: "admin" as const };
const SUPERVISOR = { id: "sup-1", isActive: true, role: "supervisor" as const };
const AGENT = { id: "agent-1", isActive: true, role: "agent" as const };
const INACTIVE_AGENT = { id: "agent-2", isActive: false, role: "agent" as const };
const ACTIVE_ZONE = { id: "zone-1", isActive: true, name: "Zone Nord" };
const INACTIVE_ZONE = { id: "zone-2", isActive: false, name: "Zone Sud" };

const VALID_INPUT: CreateTourInput = {
  zoneId: "zone-1",
  date: "2099-01-15",
  startTime: "08:00",
  endTime: "12:00",
  agentIds: ["agent-1"],
  notes: "Tournée matinale",
  createdBy: "admin-1",
};

describe("parseDateOnly / isTodayOrFuture", () => {
  it("parses a valid YYYY-MM-DD date", () => {
    expect(parseDateOnly("2020-03-09")).toBe("2020-03-09");
    expect(parseDateOnly("09/03/2020")).toBeNull();
    expect(parseDateOnly("")).toBeNull();
  });

  it("validates calendar dates correctly", () => {
    expect(parseDateOnly("2026-02-28")).toBe("2026-02-28");
    expect(parseDateOnly("2026-02-29")).toBeNull();
    expect(parseDateOnly("2026-02-31")).toBeNull();
    expect(parseDateOnly("2024-02-29")).toBe("2024-02-29");
    expect(parseDateOnly("2024-02-30")).toBeNull();
    expect(parseDateOnly("2026-04-31")).toBeNull();
    expect(parseDateOnly("2026-06-31")).toBeNull();
    expect(parseDateOnly("2026-09-31")).toBeNull();
    expect(parseDateOnly("2026-11-31")).toBeNull();
    expect(parseDateOnly("2026-00-15")).toBeNull();
    expect(parseDateOnly("2026-13-15")).toBeNull();
    expect(parseDateOnly("2026-01-00")).toBeNull();
    expect(parseDateOnly("2026-01-32")).toBeNull();
    expect(parseDateOnly("0000-01-01")).toBeNull();
    expect(parseDateOnly("10000-01-01")).toBeNull();
  });

  it("detects today or future", () => {
    const future = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10);
    expect(isTodayOrFuture(future)).toBe(true);
    expect(isTodayOrFuture("2000-01-01")).toBe(false);
  });
});

describe("createTour", () => {
  it("creates a valid tour with its agent team", async () => {
    const findUserById = vi.fn(async (id: string) => {
      if (id === "admin-1") return ADMIN;
      if (id === "agent-1") return AGENT;
      return undefined;
    });
    const { repo, calls } = makeRepo({
      findZone: vi.fn(async () => ACTIVE_ZONE),
      findUserById,
    });

    const result = await createTour(VALID_INPUT, repo);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.tour.id).toBe("tour-1");
    }
    expect(calls.insertTourWithAgents).toHaveBeenCalledWith(
      expect.objectContaining({
        zoneId: "zone-1",
        date: "2099-01-15",
        startTime: "08:00",
        endTime: "12:00",
        status: "planifiée",
        notes: "Tournée matinale",
        createdBy: "admin-1",
      }),
      ["agent-1"],
    );
  });

  it("allows a supervisor to create a tour", async () => {
    const findUserById = vi.fn(async (id: string) => {
      if (id === "sup-1") return SUPERVISOR;
      if (id === "agent-1") return AGENT;
      return undefined;
    });
    const { repo, calls } = makeRepo({
      findZone: vi.fn(async () => ACTIVE_ZONE),
      findUserById,
    });

    const result = await createTour({ ...VALID_INPUT, createdBy: "sup-1" }, repo);

    expect(result.ok).toBe(true);
    expect(calls.insertTourWithAgents).toHaveBeenCalled();
  });

  it("rejects an unknown creator", async () => {
    const { repo } = makeRepo({ findUserById: vi.fn(async () => undefined) });
    const result = await createTour(VALID_INPUT, repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("user_not_found");
  });

  it("rejects a creator without permission (agent role)", async () => {
    const findUserById = vi.fn(async (id: string) => {
      if (id === "agent-1") return AGENT;
      return AGENT;
    });
    const { repo } = makeRepo({
      findZone: vi.fn(async () => ACTIVE_ZONE),
      findUserById,
    });
    const result = await createTour({ ...VALID_INPUT, createdBy: "agent-1" }, repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("permission_denied");
  });

  it("rejects a missing zone", async () => {
    const findUserById = vi.fn(async (id: string) =>
      id === "admin-1" ? ADMIN : id === "agent-1" ? AGENT : undefined,
    );
    const { repo } = makeRepo({
      findZone: vi.fn(async () => undefined),
      findUserById,
    });
    const result = await createTour(VALID_INPUT, repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("zone_not_found");
  });

  it("rejects an inactive zone", async () => {
    const findUserById = vi.fn(async (id: string) =>
      id === "admin-1" ? ADMIN : id === "agent-1" ? AGENT : undefined,
    );
    const { repo } = makeRepo({
      findZone: vi.fn(async () => INACTIVE_ZONE),
      findUserById,
    });
    const result = await createTour(VALID_INPUT, repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("zone_inactive");
  });

  it("rejects a past date", async () => {
    const findUserById = vi.fn(async (id: string) =>
      id === "admin-1" ? ADMIN : id === "agent-1" ? AGENT : undefined,
    );
    const { repo } = makeRepo({
      findZone: vi.fn(async () => ACTIVE_ZONE),
      findUserById,
    });
    const result = await createTour({ ...VALID_INPUT, date: "2000-01-01" }, repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("date_invalid");
  });

  it("rejects end time not after start time", async () => {
    const findUserById = vi.fn(async (id: string) =>
      id === "admin-1" ? ADMIN : id === "agent-1" ? AGENT : undefined,
    );
    const { repo } = makeRepo({
      findZone: vi.fn(async () => ACTIVE_ZONE),
      findUserById,
    });
    const result = await createTour({ ...VALID_INPUT, startTime: "12:00", endTime: "12:00" }, repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("time_invalid");
  });

  it("rejects no agents", async () => {
    const findUserById = vi.fn(async (id: string) => (id === "admin-1" ? ADMIN : undefined));
    const { repo } = makeRepo({
      findZone: vi.fn(async () => ACTIVE_ZONE),
      findUserById,
    });
    const result = await createTour({ ...VALID_INPUT, agentIds: [] }, repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("agents_required");
  });

  it("rejects an inactive agent", async () => {
    const findUserById = vi.fn(async (id: string) =>
      id === "admin-1" ? ADMIN : id === "agent-2" ? INACTIVE_AGENT : undefined,
    );
    const { repo } = makeRepo({
      findZone: vi.fn(async () => ACTIVE_ZONE),
      findUserById,
    });
    const result = await createTour({ ...VALID_INPUT, agentIds: ["agent-2"] }, repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("agent_invalid");
  });

  it("rejects a non-agent user", async () => {
    const findUserById = vi.fn(async (id: string) =>
      id === "admin-1" ? ADMIN : id === "sup-1" ? SUPERVISOR : undefined,
    );
    const { repo } = makeRepo({
      findZone: vi.fn(async () => ACTIVE_ZONE),
      findUserById,
    });
    const result = await createTour({ ...VALID_INPUT, agentIds: ["sup-1"] }, repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("agent_invalid");
  });

  it("deduplicates agents", async () => {
    const findUserById = vi.fn(async (id: string) => {
      if (id === "admin-1") return ADMIN;
      if (id === "agent-1") return AGENT;
      return undefined;
    });
    const { repo, calls } = makeRepo({
      findZone: vi.fn(async () => ACTIVE_ZONE),
      findUserById,
    });
    const result = await createTour({ ...VALID_INPUT, agentIds: ["agent-1", "agent-1"] }, repo);
    expect(result.ok).toBe(true);
    expect(calls.insertTourWithAgents).toHaveBeenCalledWith(expect.anything(), ["agent-1"]);
  });
});
