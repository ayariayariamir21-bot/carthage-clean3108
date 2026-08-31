import { describe, expect, it } from "vitest";
import { formatDateFr, formatDateTimeFr } from "./format";

describe("French date formatting", () => {
  it("formats a date as dd/mm/yyyy", () => {
    expect(formatDateFr(new Date(2026, 2, 4))).toBe("04/03/2026");
    expect(formatDateFr("2026-03-04")).toBe("04/03/2026");
  });

  it("formats a datetime with hours and minutes", () => {
    const out = formatDateTimeFr(new Date(2026, 2, 4, 13, 45));
    expect(out).toMatch(/04\/03\/2026/);
    expect(out).toMatch(/13:45/);
  });

  it("falls back to the raw value on invalid input", () => {
    expect(formatDateFr("not-a-date")).toBe("not-a-date");
  });
});
