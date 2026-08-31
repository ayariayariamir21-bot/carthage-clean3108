import { describe, expect, it } from "vitest";
import { canViewTourDetail, filterSortPaginateTours, toToursCsv, type TourQueryRow } from "./query";
import type { TourStatus } from "@/db/schema";

function row(overrides: Partial<TourQueryRow> & { id: string }): TourQueryRow {
  const { id, ...rest } = overrides;
  return {
    id,
    zoneId: "z1",
    zoneName: "Zone Nord",
    date: "2024-01-01",
    startTime: "08:00",
    endTime: "12:00",
    status: "planifiée" as TourStatus,
    notes: null,
    startedAt: null,
    completedAt: null,
    cancellationReason: null,
    createdBy: "creator-1",
    creatorName: "Alice",
    createdAt: new Date(),
    agentCount: 0,
    zoneCode: "ZN",
    agentIds: [],
    agentNames: [],
    agentMatricules: [],
    ...rest,
  };
}

function makeRows(count: number): TourQueryRow[] {
  return Array.from({ length: count }, (_, i) => {
    const creator =
      i % 2 === 0 ? { id: "creator-1", name: "Alice" } : { id: "creator-2", name: "Bob" };
    return row({
      id: `t${i + 1}`,
      date: `2024-01-${String((i % 28) + 1).padStart(2, "0")}`,
      status: (i % 2 === 0 ? "planifiée" : "en_cours") as TourStatus,
      zoneName: i % 2 === 0 ? "Zone Nord" : "Zone Sud",
      createdBy: creator.id,
      creatorName: creator.name,
    });
  });
}

describe("filterSortPaginateTours", () => {
  it("paginates correctly", () => {
    const rows = makeRows(25);
    const p1 = filterSortPaginateTours(rows, { page: 1, pageSize: 10 });
    const p2 = filterSortPaginateTours(rows, { page: 2, pageSize: 10 });
    const p3 = filterSortPaginateTours(rows, { page: 3, pageSize: 10 });
    expect(p1.total).toBe(25);
    expect(p1.rows).toHaveLength(10);
    expect(p3.rows).toHaveLength(5);

    const ids1 = new Set(p1.rows.map((r) => r.id));
    const ids2 = new Set(p2.rows.map((r) => r.id));
    expect([...ids1].some((id) => ids2.has(id))).toBe(false);
  });

  it("clamps out-of-range pages", () => {
    const rows = makeRows(5);
    const result = filterSortPaginateTours(rows, { page: 99, pageSize: 10 });
    expect(result.rows).toHaveLength(5);
  });

  it("sorts by date ascending and descending", () => {
    const rows = makeRows(10);
    const asc = filterSortPaginateTours(rows, { sort: { column: "date", direction: "asc" } });
    const desc = filterSortPaginateTours(rows, { sort: { column: "date", direction: "desc" } });
    expect(asc.rows[0]!.date <= asc.rows[asc.rows.length - 1]!.date).toBe(true);
    expect(desc.rows[0]!.date >= desc.rows[desc.rows.length - 1]!.date).toBe(true);
    expect(desc.rows[0]!.id).not.toBe(asc.rows[0]!.id);
  });

  it("sorts by status and creator", () => {
    const rows = makeRows(10);
    const byStatus = filterSortPaginateTours(rows, {
      sort: { column: "status", direction: "asc" },
    });
    expect(byStatus.rows[0]!.status <= byStatus.rows[byStatus.rows.length - 1]!.status).toBe(true);
    const byCreator = filterSortPaginateTours(rows, {
      sort: { column: "creator", direction: "asc" },
    });
    expect(
      (byCreator.rows[0]!.creatorName ?? "") <=
        (byCreator.rows[byCreator.rows.length - 1]!.creatorName ?? ""),
    ).toBe(true);
  });

  it("filters by status, creator and zone code combined", () => {
    const rows = makeRows(20);
    const result = filterSortPaginateTours(rows, {
      filters: { status: "planifiée", creatorId: "creator-1", zoneCode: "zn" },
    });
    expect(result.total).toBeGreaterThan(0);
    for (const r of result.rows) {
      expect(r.status).toBe("planifiée");
      expect(r.creatorName ?? "").toBe("Alice");
      expect((r.zoneCode ?? "").toLowerCase()).toContain("zn");
    }
  });

  it("filters by date range", () => {
    const rows = makeRows(20);
    const result = filterSortPaginateTours(rows, {
      filters: { dateFrom: "2024-01-05", dateTo: "2024-01-10" },
    });
    for (const r of result.rows) {
      expect(r.date >= "2024-01-05" && r.date <= "2024-01-10").toBe(true);
    }
  });

  it("filters by agent name/matricule", () => {
    const rows = [
      row({ id: "a", agentNames: ["Jean Dupont"], agentMatricules: ["M-1"] }),
      row({ id: "b", agentNames: ["Marie"], agentMatricules: ["M-99"] }),
    ];
    const byName = filterSortPaginateTours(rows, { filters: { agent: "dupont" } });
    expect(byName.rows.map((r) => r.id)).toEqual(["a"]);
    const byMat = filterSortPaginateTours(rows, { filters: { agent: "m-99" } });
    expect(byMat.rows.map((r) => r.id)).toEqual(["b"]);
  });
});

describe("toToursCsv", () => {
  it("produces a header and escapes commas/quotes", () => {
    const rows = [
      row({
        id: "t1",
        zoneName: "Zone, Nord",
        notes: 'Quote "ici"',
        agentNames: ["Jean", "Marie"],
      }),
    ];
    const csv = toToursCsv(rows);
    const lines = csv.split("\r\n");
    expect(lines[0]).toContain("ID");
    expect(lines[0]).toContain("Agents");
    expect(lines[1]).toContain('"Zone, Nord"');
    expect(lines[1]).toContain('"Quote ""ici"""');
    expect(lines[1]).toContain("Jean, Marie");
  });
});

describe("canViewTourDetail", () => {
  it("allows admin and supervisor to see any tour", () => {
    expect(canViewTourDetail({ role: "admin", id: "x" }, { agentIds: [] })).toBe(true);
    expect(canViewTourDetail({ role: "supervisor", id: "x" }, { agentIds: [] })).toBe(true);
  });

  it("allows an assigned agent but denies others", () => {
    expect(canViewTourDetail({ role: "agent", id: "a1" }, { agentIds: ["a1"] })).toBe(true);
    expect(canViewTourDetail({ role: "agent", id: "a2" }, { agentIds: ["a1"] })).toBe(false);
  });
});
