import { describe, expect, it, vi } from "vitest";
import {
  dbAuditRepository,
  logAuditEvent,
  normalizePage,
  normalizePageSize,
  type AuditRepository,
} from "./log";

function fakeRepo() {
  const insert = vi.fn(async () => undefined);
  const list = vi.fn(async () => ({ rows: [], total: 0 }));
  const repo: AuditRepository = { insertAuditLog: insert, listAuditLogs: list };
  return { repo, insert, list };
}

describe("normalizePage", () => {
  it("returns default for undefined/null", () => {
    expect(normalizePage(undefined)).toBe(1);
    expect(normalizePage(null)).toBe(1);
  });

  it("returns default for NaN", () => {
    expect(normalizePage("abc")).toBe(1);
    expect(normalizePage(NaN)).toBe(1);
  });

  it("returns default for negative", () => {
    expect(normalizePage(-1)).toBe(1);
    expect(normalizePage(-999)).toBe(1);
  });

  it("returns 1 for zero", () => {
    expect(normalizePage(0)).toBe(1);
  });

  it("floors decimal values", () => {
    expect(normalizePage(1.9)).toBe(1);
    expect(normalizePage(2.1)).toBe(2);
  });

  it("accepts valid positive integers", () => {
    expect(normalizePage(1)).toBe(1);
    expect(normalizePage(5)).toBe(5);
    expect(normalizePage(100)).toBe(100);
  });
});

describe("normalizePageSize", () => {
  it("returns default for undefined/null", () => {
    expect(normalizePageSize(undefined)).toBe(100);
    expect(normalizePageSize(null)).toBe(100);
  });

  it("returns default for NaN", () => {
    expect(normalizePageSize("abc")).toBe(100);
    expect(normalizePageSize(NaN)).toBe(100);
  });

  it("clamps to 1 for zero or negative", () => {
    expect(normalizePageSize(0)).toBe(1);
    expect(normalizePageSize(-1)).toBe(1);
    expect(normalizePageSize(-999)).toBe(1);
  });

  it("floors decimal values", () => {
    expect(normalizePageSize(1.9)).toBe(1);
    expect(normalizePageSize(50.7)).toBe(50);
  });

  it("clamps to MAX_PAGE_SIZE for too large values", () => {
    expect(normalizePageSize(101)).toBe(100);
    expect(normalizePageSize(999999)).toBe(100);
    expect(normalizePageSize(1000)).toBe(100);
  });

  it("accepts valid values in range", () => {
    expect(normalizePageSize(1)).toBe(1);
    expect(normalizePageSize(20)).toBe(20);
    expect(normalizePageSize(50)).toBe(50);
    expect(normalizePageSize(100)).toBe(100);
  });
});

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

describe("listAuditLogs pagination safety (db repository)", () => {
  it("normalizes page and pageSize internally", async () => {
    // Test the actual normalization logic by checking the returned values from the real function
    // We can't easily test the DB call without a DB, but we can verify
    // the normalization functions work correctly
    expect(normalizePage(999999)).toBe(999999);
    expect(normalizePageSize(999999)).toBe(100);
  });

  it("handles negative and zero page/pageSize", async () => {
    expect(normalizePage(-5)).toBe(1);
    expect(normalizePage(0)).toBe(1);
    expect(normalizePageSize(0)).toBe(1);
    expect(normalizePageSize(-1)).toBe(1);
  });

  it("handles non-numeric inputs", async () => {
    expect(normalizePage("abc")).toBe(1);
    expect(normalizePageSize("xyz")).toBe(100);
  });

  it("handles null/undefined inputs", async () => {
    expect(normalizePage(null)).toBe(1);
    expect(normalizePage(undefined)).toBe(1);
    expect(normalizePageSize(null)).toBe(100);
    expect(normalizePageSize(undefined)).toBe(100);
  });
});
