import { describe, expect, it } from "vitest";
import { canViewTourDetail, csvEscape, toToursCsv, type TourQueryRow } from "./query";

function row(overrides: Partial<TourQueryRow> & { id: string }): TourQueryRow {
  const { id, ...rest } = overrides;
  return {
    id,
    zoneId: "z1",
    zoneName: "Zone Nord",
    date: "2024-01-01",
    startTime: "08:00",
    endTime: "12:00",
    status: "planifiée",
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

describe("csvEscape", () => {
  it("escapes formula injection prefixes", () => {
    expect(csvEscape("=SUM(A1:A2)")).toBe("'=SUM(A1:A2)");
    expect(csvEscape("+123")).toBe("'+123");
    expect(csvEscape("-123")).toBe("'-123");
    expect(csvEscape("@cmd")).toBe("'@cmd");
    expect(csvEscape("\t=SUM(A1)")).toBe("'\t=SUM(A1)");
    expect(csvEscape("\r=EVIL")).toBe('"\r=EVIL"');
  });

  it("preserves normal text", () => {
    expect(csvEscape("normal text")).toBe("normal text");
    expect(csvEscape("Zone Nord")).toBe("Zone Nord");
  });

  it("escapes quotes, commas, and newlines", () => {
    expect(csvEscape('Quote "ici"')).toBe('"Quote ""ici"""');
    expect(csvEscape("Zone, Nord")).toBe('"Zone, Nord"');
    expect(csvEscape("line1\nline2")).toBe('"line1\nline2"');
    expect(csvEscape("line1\rline2")).toBe('"line1\rline2"');
    expect(csvEscape("line1\r\nline2")).toBe('"line1\r\nline2"');
  });

  it("escapes formula prefix combined with quotes/commas", () => {
    expect(csvEscape('=SUM("A1")')).toBe('"\'=SUM(""A1"")"');
    expect(csvEscape("=A1,B2")).toBe('"\'=A1,B2"');
    expect(csvEscape("=A1\nB2")).toBe('"\'=A1\nB2"');
  });

  it("handles null and undefined", () => {
    expect(csvEscape(null)).toBe("");
    expect(csvEscape(undefined)).toBe("");
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

  it("neutralizes formula injection in user-controlled fields", () => {
    const rows = [
      row({
        id: "t1",
        zoneName: "=SUM(A1:A2)",
        notes: "+EVIL",
        agentNames: ["@cmd"],
        cancellationReason: "-INJECT",
      }),
    ];
    const csv = toToursCsv(rows);
    const lines = csv.split("\r\n");
    expect(lines[1]).toContain("'=SUM(A1:A2)");
    expect(lines[1]).toContain("'+EVIL");
    expect(lines[1]).toContain("'@cmd");
    expect(lines[1]).toContain("'-INJECT");
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
