import { describe, expect, it } from "vitest";
import { generateSessionToken, sha256, SESSION_TTL_DAYS } from "./session";

describe("session helpers", () => {
  it("generates a non-empty session token", () => {
    expect(generateSessionToken()).toHaveLength(64);
  });

  it("generates unique tokens", () => {
    expect(generateSessionToken()).not.toBe(generateSessionToken());
  });

  it("hashes tokens deterministically with sha256", () => {
    const token = "abc123";
    expect(sha256(token)).toBe(sha256(token));
    expect(sha256(token)).not.toBe(token);
    expect(sha256(token)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("defines a positive session TTL in days", () => {
    expect(SESSION_TTL_DAYS).toBeGreaterThan(0);
  });
});
