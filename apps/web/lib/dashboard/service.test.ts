import { describe, expect, it } from "vitest";
import { getDashboardData } from "./service";
import type { DashboardRepository } from "./repository";

function fakeRepo(overrides: Partial<DashboardRepository> = {}): DashboardRepository {
  return {
    countToursByStatus: async () => ({ planifiée: 1, en_cours: 2, terminée: 3, annulée: 4 }),
    countActiveZones: async () => 5,
    countActiveAgents: async () => 6,
    listToursBetween: async () => [],
    listToursForUserBetween: async () => [],
    ...overrides,
  };
}

describe("getDashboardData", () => {
  it("returns aggregates for an admin", async () => {
    const data = await getDashboardData({ id: "u1", role: "admin" }, fakeRepo());
    expect(data.role).toBe("admin");
    if (data.role === "admin") {
      expect(data.activeZones).toBe(5);
      expect(data.activeAgents).toBe(6);
      expect(data.countsByStatus.terminée).toBe(3);
    }
  });

  it("returns aggregates for a supervisor", async () => {
    const data = await getDashboardData({ id: "u2", role: "supervisor" }, fakeRepo());
    expect(data.role).toBe("supervisor");
  });

  it("returns the agent's tours", async () => {
    const tour = { id: "t1", agentIds: ["u3"] } as never;
    const data = await getDashboardData(
      { id: "u3", role: "agent" },
      fakeRepo({ listToursForUserBetween: async () => [tour] }),
    );
    expect(data.role).toBe("agent");
    if (data.role === "agent") {
      expect(data.myTours).toHaveLength(1);
      expect(data.upcomingCount).toBe(1);
    }
  });
});
