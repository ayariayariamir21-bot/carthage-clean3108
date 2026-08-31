import { describe, expect, it } from "vitest";
import {
  createAgent,
  isValidEmail,
  isValidPhone,
  parseHireDate,
  setAgentActive,
  setAgentMainZone,
  updateAgent,
  type AgentRepository,
} from "./agents";

const AGENT_RECORD = {
  id: "a1",
  name: "Jean",
  email: "jean@carthage.tn",
  matricule: null,
  isActive: true,
  role: "agent" as const,
  phone: null,
  hireDate: null,
  team: null,
  notes: null,
  defaultZoneId: null,
  defaultZoneName: null,
};

function makeRepo(overrides: Partial<AgentRepository> = {}): {
  repo: AgentRepository;
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
      listAgents: async () => [],
      listUsers: async () => [],
      findAgentById: async () => AGENT_RECORD,
      findUserByEmail: async () => undefined,
      findUserByEmailExcluding: async () => undefined,
      findZone: async () => ({ id: "z1", isActive: true }),
      insertUser: async (data) => {
        inserted.push(data);
        return { id: "new-id", email: data.email };
      },
      updateUser: async (id, data) => {
        updated.push({ id, data });
      },
      setActive: async (id, value) => {
        actives.push({ id, value });
      },
      deleteSessions: async (userId) => {
        deleted.push(userId);
      },
      ...overrides,
    },
  };
}

describe("validators", () => {
  it("isValidEmail accepts valid and rejects invalid", () => {
    expect(isValidEmail("agent@carthage.tn")).toBe(true);
    expect(isValidEmail("agent")).toBe(false);
  });

  it("isValidPhone accepts valid and rejects invalid", () => {
    expect(isValidPhone("+216 12 345 678")).toBe(true);
    expect(isValidPhone("12")).toBe(false);
    expect(isValidPhone("abc")).toBe(false);
  });

  it("parseHireDate parses a valid date and returns null on empty/invalid", () => {
    expect(parseHireDate("2020-01-15")).toBe("2020-01-15");
    expect(parseHireDate("")).toBeNull();
    expect(parseHireDate("not-a-date")).toBeNull();
  });
});

describe("createAgent", () => {
  it("creates an agent with profile fields and a hashed password", async () => {
    const { repo, inserted } = makeRepo();
    const result = await createAgent(
      {
        name: "Jean Agent",
        email: " Jean@Carthage.tn ",
        password: "Temp1234",
        matricule: " M-01 ",
        phone: " +216 12 345 678 ",
        hireDate: "2020-01-15",
        team: " Nord ",
        notes: "Bon agent",
      },
      { repository: repo, hash: async (pw) => `hashed(${pw})` },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user.email).toBe("jean@carthage.tn");
    }
    expect(inserted).toHaveLength(1);
    const data = inserted[0] as {
      email: string;
      name: string;
      matricule: string | null;
      role: string;
      isActive: boolean;
      passwordHash: string;
      phone: string | null;
      hireDate: Date | null;
      team: string | null;
      notes: string | null;
      defaultZoneId: string | null;
    };
    expect(data).toEqual(
      expect.objectContaining({
        name: "Jean Agent",
        email: "jean@carthage.tn",
        matricule: "M-01",
        role: "agent",
        isActive: true,
        passwordHash: "hashed(Temp1234)",
        phone: "+216 12 345 678",
        hireDate: expect.any(String),
        team: "Nord",
        notes: "Bon agent",
        defaultZoneId: null,
      }),
    );
  });

  it("rejects invalid input (empty name, bad email, short password, bad phone, bad date)", async () => {
    const { repo } = makeRepo();
    expect(
      (await createAgent({ name: "", email: "x@y.tn", password: "Temp1234" }, { repository: repo }))
        .ok,
    ).toBe(false);
    expect(
      (
        await createAgent(
          { name: "Jean", email: "bad", password: "Temp1234" },
          { repository: repo },
        )
      ).ok,
    ).toBe(false);
    expect(
      (
        await createAgent(
          { name: "Jean", email: "x@y.tn", password: "short" },
          { repository: repo },
        )
      ).ok,
    ).toBe(false);
    expect(
      (
        await createAgent(
          { name: "Jean", email: "x@y.tn", password: "Temp1234", phone: "123" },
          { repository: repo },
        )
      ).ok,
    ).toBe(false);
    expect(
      (
        await createAgent(
          { name: "Jean", email: "x@y.tn", password: "Temp1234", hireDate: "nope" },
          { repository: repo },
        )
      ).ok,
    ).toBe(false);
  });

  it("rejects a duplicate email", async () => {
    const { repo } = makeRepo({ findUserByEmail: async () => ({ id: "existing" }) });
    const result = await createAgent(
      { name: "Jean", email: "jean@carthage.tn", password: "Temp1234" },
      { repository: repo },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("email_taken");
    }
  });
});

describe("updateAgent", () => {
  it("updates provided profile fields", async () => {
    const { repo, updated } = makeRepo();
    const result = await updateAgent(
      "a1",
      { name: "Jean Neuf", email: "jean.neuf@carthage.tn", phone: "+216 99 999 999", team: "Sud" },
      { repository: repo },
    );
    expect(result.ok).toBe(true);
    expect(updated[0]).toEqual(
      expect.objectContaining({
        id: "a1",
        data: expect.objectContaining({
          name: "Jean Neuf",
          email: "jean.neuf@carthage.tn",
          matricule: null,
          phone: "+216 99 999 999",
          team: "Sud",
        }),
      }),
    );
  });

  it("returns not_found for an unknown agent", async () => {
    const { repo } = makeRepo({ findAgentById: async () => undefined });
    const result = await updateAgent("missing", { name: "X" }, { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("not_found");
    }
  });

  it("rejects an email already used by another agent", async () => {
    const { repo } = makeRepo({ findUserByEmailExcluding: async () => ({ id: "other" }) });
    const result = await updateAgent("a1", { email: "other@carthage.tn" }, { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("email_taken");
    }
  });

  it("rejects an invalid phone on update", async () => {
    const { repo } = makeRepo();
    const result = await updateAgent("a1", { phone: "12" }, { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("invalid");
    }
  });
});

describe("setAgentActive", () => {
  it("deactivates an agent and invalidates its sessions", async () => {
    const { repo, actives, deleted } = makeRepo();
    const result = await setAgentActive("a1", false, { repository: repo });
    expect(result.ok).toBe(true);
    expect(actives).toEqual([{ id: "a1", value: false }]);
    expect(deleted).toEqual(["a1"]);
  });

  it("reactivates an agent without touching sessions", async () => {
    const { repo, actives, deleted } = makeRepo();
    const result = await setAgentActive("a1", true, { repository: repo });
    expect(result.ok).toBe(true);
    expect(actives).toEqual([{ id: "a1", value: true }]);
    expect(deleted).toHaveLength(0);
  });

  it("returns not_found for an unknown agent", async () => {
    const { repo } = makeRepo({ findAgentById: async () => undefined });
    const result = await setAgentActive("missing", false, { repository: repo });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("not_found");
    }
  });
});

describe("setAgentMainZone", () => {
  it("assigns a valid active zone to an active agent", async () => {
    const { repo, updated } = makeRepo();
    const result = await setAgentMainZone("a1", "z1", { repository: repo });
    expect(result.ok).toBe(true);
    expect(updated[0]).toEqual({ id: "a1", data: { defaultZoneId: "z1" } });
  });

  it("replaces the main zone when changed", async () => {
    const { repo, updated } = makeRepo();
    expect((await setAgentMainZone("a1", "z1", { repository: repo })).ok).toBe(true);
    expect((await setAgentMainZone("a1", "z2", { repository: repo })).ok).toBe(true);
    expect(updated).toHaveLength(2);
    expect(updated[1]).toEqual({ id: "a1", data: { defaultZoneId: "z2" } });
  });

  it("rejects an unknown user, an inactive user and a non-agent", async () => {
    const r1 = await setAgentMainZone("a1", "z1", {
      repository: makeRepo({ findAgentById: async () => undefined }).repo,
    });
    expect(r1.ok).toBe(false);
    const r2 = await setAgentMainZone("a1", "z1", {
      repository: makeRepo({ findAgentById: async () => ({ ...AGENT_RECORD, isActive: false }) })
        .repo,
    });
    expect(r2.ok).toBe(false);
    const r3 = await setAgentMainZone("a1", "z1", {
      repository: makeRepo({ findAgentById: async () => ({ ...AGENT_RECORD, role: "supervisor" }) })
        .repo,
    });
    expect(r3.ok).toBe(false);
  });

  it("rejects an unknown or inactive zone", async () => {
    const rZoneMissing = await setAgentMainZone("a1", "z1", {
      repository: makeRepo({ findZone: async () => undefined }).repo,
    });
    expect(rZoneMissing.ok).toBe(false);
    const rZoneInactive = await setAgentMainZone("a1", "z1", {
      repository: makeRepo({ findZone: async () => ({ id: "z1", isActive: false }) }).repo,
    });
    expect(rZoneInactive.ok).toBe(false);
  });
});
