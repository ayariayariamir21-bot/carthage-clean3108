import { describe, expect, it, vi } from "vitest";
import { cancelTour, completeTour, startTour, type WorkflowResult } from "./workflow";
import type { TourRepository } from "./service";

function makeRepo(overrides: Partial<TourRepository> = {}) {
  const repo: TourRepository = {
    findZone: overrides.findZone ?? vi.fn(async () => undefined),
    findUserById: overrides.findUserById ?? vi.fn(async () => undefined),
    insertTourWithAgents: overrides.insertTourWithAgents ?? vi.fn(async () => ({ id: "t1" })),
    listTours: overrides.listTours ?? vi.fn(async () => []),
    findTour: overrides.findTour ?? vi.fn(async () => undefined),
    findTourAgent: overrides.findTourAgent ?? vi.fn(async () => undefined),
    updateTour: overrides.updateTour ?? vi.fn(async () => {}),
    listTourIdsByUser: overrides.listTourIdsByUser ?? vi.fn(async () => []),
    queryTours: overrides.queryTours ?? vi.fn(async () => ({ rows: [], total: 0 })),
    getTourById: overrides.getTourById ?? vi.fn(async () => undefined),
    listCreators: overrides.listCreators ?? vi.fn(async () => []),
  };
  return repo;
}

const ADMIN = { id: "admin-1", isActive: true, role: "admin" as const };
const SUPERVISOR = { id: "sup-1", isActive: true, role: "supervisor" as const };
const AGENT_ASSIGNED = { id: "agent-1", isActive: true, role: "agent" as const };
const AGENT_OTHER = { id: "agent-2", isActive: true, role: "agent" as const };

const TODAY = new Date().toISOString().slice(0, 10);
const FUTURE = "2099-01-01";

function tour(status: "planifiée" | "en_cours" | "terminée" | "annulée", date = TODAY) {
  return { id: "tour-1", date, status };
}

async function assertOk(r: WorkflowResult) {
  expect(r.ok).toBe(true);
}

describe("startTour", () => {
  it("demarre une tournee planifiee pour un admin (date aujourd'hui)", async () => {
    const repo = makeRepo({
      findTour: vi.fn(async () => tour("planifiée", TODAY)),
      findUserById: vi.fn(async () => ADMIN),
      updateTour: vi.fn(async () => {}),
    });
    const result = await startTour("tour-1", "admin-1", repo);
    await assertOk(result);
    expect(repo.updateTour).toHaveBeenCalledWith("tour-1", {
      status: "en_cours",
      startedAt: expect.any(Date),
    });
  });

  it("refuse le demarrage par un agent non assigne", async () => {
    const repo = makeRepo({
      findTour: vi.fn(async () => tour("planifiée", TODAY)),
      findUserById: vi.fn(async () => AGENT_OTHER),
      findTourAgent: vi.fn(async () => undefined),
    });
    const result = await startTour("tour-1", "agent-2", repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("permission_denied");
  });

  it("autorise le demarrage par un agent assigne", async () => {
    const repo = makeRepo({
      findTour: vi.fn(async () => tour("planifiée", TODAY)),
      findUserById: vi.fn(async () => AGENT_ASSIGNED),
      findTourAgent: vi.fn(async () => ({ tourId: "tour-1", userId: "agent-1" })),
      updateTour: vi.fn(async () => {}),
    });
    const result = await startTour("tour-1", "agent-1", repo);
    await assertOk(result);
  });

  it("refuse le demarrage d'une tournee deja en cours", async () => {
    const repo = makeRepo({
      findTour: vi.fn(async () => tour("en_cours", TODAY)),
      findUserById: vi.fn(async () => ADMIN),
    });
    const result = await startTour("tour-1", "admin-1", repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid_status_transition");
  });

  it("refuse le demarrage d'une tournee future", async () => {
    const repo = makeRepo({
      findTour: vi.fn(async () => tour("planifiée", FUTURE)),
      findUserById: vi.fn(async () => ADMIN),
    });
    const result = await startTour("tour-1", "admin-1", repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("tour_not_today");
  });

  it("refuse une tournee introuvable", async () => {
    const repo = makeRepo({
      findTour: vi.fn(async () => undefined),
      findUserById: vi.fn(async () => ADMIN),
    });
    const result = await startTour("tour-x", "admin-1", repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("tour_not_found");
  });
});

describe("completeTour", () => {
  it("termine une tournee en cours (admin)", async () => {
    const repo = makeRepo({
      findTour: vi.fn(async () => tour("en_cours", TODAY)),
      findUserById: vi.fn(async () => ADMIN),
      updateTour: vi.fn(async () => {}),
    });
    const result = await completeTour("tour-1", "admin-1", repo);
    await assertOk(result);
    expect(repo.updateTour).toHaveBeenCalledWith("tour-1", {
      status: "terminée",
      completedAt: expect.any(Date),
    });
  });

  it("autorise un agent assigne a terminer", async () => {
    const repo = makeRepo({
      findTour: vi.fn(async () => tour("en_cours", TODAY)),
      findUserById: vi.fn(async () => AGENT_ASSIGNED),
      findTourAgent: vi.fn(async () => ({ tourId: "tour-1", userId: "agent-1" })),
      updateTour: vi.fn(async () => {}),
    });
    const result = await completeTour("tour-1", "agent-1", repo);
    await assertOk(result);
  });

  it("refuse un agent non assigne", async () => {
    const repo = makeRepo({
      findTour: vi.fn(async () => tour("en_cours", TODAY)),
      findUserById: vi.fn(async () => AGENT_OTHER),
      findTourAgent: vi.fn(async () => undefined),
    });
    const result = await completeTour("tour-1", "agent-2", repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("permission_denied");
  });

  it("refuse de terminer une tournee planifiee", async () => {
    const repo = makeRepo({
      findTour: vi.fn(async () => tour("planifiée", TODAY)),
      findUserById: vi.fn(async () => ADMIN),
    });
    const result = await completeTour("tour-1", "admin-1", repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid_status_transition");
  });
});

describe("cancelTour", () => {
  it("annule une tournee planifiee avec raison (supervisor)", async () => {
    const repo = makeRepo({
      findTour: vi.fn(async () => tour("planifiée", TODAY)),
      findUserById: vi.fn(async () => SUPERVISOR),
      updateTour: vi.fn(async () => {}),
    });
    const result = await cancelTour("tour-1", "sup-1", "Pluie", repo);
    await assertOk(result);
    expect(repo.updateTour).toHaveBeenCalledWith("tour-1", {
      status: "annulée",
      cancellationReason: "Pluie",
    });
  });

  it("refuse l'annulation sans raison", async () => {
    const repo = makeRepo({
      findTour: vi.fn(async () => tour("planifiée", TODAY)),
      findUserById: vi.fn(async () => ADMIN),
    });
    const result = await cancelTour("tour-1", "admin-1", "   ", repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("reason_required");
  });

  it("refuse l'annulation par un agent", async () => {
    const repo = makeRepo({
      findTour: vi.fn(async () => tour("planifiée", TODAY)),
      findUserById: vi.fn(async () => AGENT_OTHER),
    });
    const result = await cancelTour("tour-1", "agent-2", "raison", repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("permission_denied");
  });

  it("refuse l'annulation d'une tournee terminee", async () => {
    const repo = makeRepo({
      findTour: vi.fn(async () => tour("terminée", TODAY)),
      findUserById: vi.fn(async () => ADMIN),
    });
    const result = await cancelTour("tour-1", "admin-1", "raison", repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid_status_transition");
  });
});
