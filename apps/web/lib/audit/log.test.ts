import { describe, expect, it, vi } from "vitest";
import { dbAuditRepository, logAuditEvent, type AuditRepository } from "./log";

function fakeRepo() {
  const insert = vi.fn(async () => undefined);
  const list = vi.fn(async () => ({ rows: [], total: 0 }));
  const repo: AuditRepository = { insertAuditLog: insert, listAuditLogs: list };
  return { repo, insert, list };
}

describe("logAuditEvent", () => {
  it("maps arguments and calls insertAuditLog", async () => {
    const { repo, insert } = fakeRepo();
    await logAuditEvent("u1", "agent.create", "agent", "a1", { email: "a@b.c" }, repo);

    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith({
      userId: "u1",
      action: "agent.create",
      entityType: "agent",
      entityId: "a1",
      metadata: { email: "a@b.c" },
    });
  });

  it("defaults entityId and metadata to null", async () => {
    const { repo, insert } = fakeRepo();
    await logAuditEvent(null, "auth.login", "user", null, undefined, repo);
    expect(insert).toHaveBeenCalledWith({
      userId: null,
      action: "auth.login",
      entityType: "user",
      entityId: null,
      metadata: null,
    });
  });

  it("is non-blocking when the repository throws", async () => {
    const repo: AuditRepository = {
      async insertAuditLog() {
        throw new Error("boom");
      },
      async listAuditLogs() {
        return { rows: [], total: 0 };
      },
    };
    await expect(logAuditEvent("u", "x", "y", null, undefined, repo)).resolves.toBeUndefined();
  });

  it("exposes a db-backed repository", () => {
    expect(typeof dbAuditRepository.insertAuditLog).toBe("function");
    expect(typeof dbAuditRepository.listAuditLogs).toBe("function");
  });
});
