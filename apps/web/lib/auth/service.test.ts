import { describe, expect, it, beforeEach } from "vitest";
import { hashPassword } from "./password";
import { login, logout, type AuthRepository } from "./service";
import { sha256 } from "./session";
import { resetRateLimiter } from "./rate-limiter";

const FIXED_NOW = new Date("2026-08-29T12:00:00Z");

beforeEach(() => {
  resetRateLimiter();
});

async function makeRepo(overrides: Partial<AuthRepository> = {}): Promise<AuthRepository> {
  const passwordHash = await hashPassword("correct-pass");
  return {
    findUserByEmail: async () => ({
      id: "e4db0d17-a30a-4c1b-bf3b-0b2b9d3f7c11",
      email: "admin@carthage.tn",
      passwordHash,
      isActive: true,
      mustChangePassword: false,
    }),
    findUserById: async () => ({
      id: "e4db0d17-a30a-4c1b-bf3b-0b2b9d3f7c11",
      email: "admin@carthage.tn",
      passwordHash,
      isActive: true,
      mustChangePassword: false,
    }),
    createSession: async () => ({}),
    updateUserMustChangePassword: async () => {},
    deleteSessions: async () => {},
    deleteSession: async () => {},
    ...overrides,
  };
}

describe("login service", () => {
  it("returns a token and creates a session for valid credentials", async () => {
    const created: Array<{ tokenHash: string; userId: string; expiresAt: Date }> = [];
    const repo = await makeRepo({
      createSession: async (data) => {
        created.push(data);
        return [data];
      },
    });

    const result = await login("Admin@Carthage.TN ", "correct-pass", {
      repository: repo,
      now: () => FIXED_NOW,
      ttlMs: 30 * 24 * 60 * 60 * 1000,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user.email).toBe("admin@carthage.tn");
      expect(result.token).toHaveLength(64);
      expect(created).toHaveLength(1);
      expect(created[0]?.tokenHash).toBe(sha256(result.token));
      expect(created[0]?.userId).toBe("e4db0d17-a30a-4c1b-bf3b-0b2b9d3f7c11");
      expect(created[0]?.expiresAt.toISOString()).toBe("2026-09-28T12:00:00.000Z");
    }
  });

  it("normalizes the email to lowercase and trims whitespace", async () => {
    let lookup: string | undefined;
    const repo = await makeRepo({
      findUserByEmail: async (email) => {
        lookup = email;
        return undefined;
      },
    });

    await login("  ADMIN@carthage.tn  ", "correct-pass", { repository: repo });

    expect(lookup).toBe("admin@carthage.tn");
  });

  it("rejects an unknown email without creating a session", async () => {
    const created: unknown[] = [];
    const repo = await makeRepo({
      findUserByEmail: async () => undefined,
      createSession: async (data) => {
        created.push(data);
        return [];
      },
    });

    const result = await login("nobody@example.com", "correct-pass", { repository: repo });

    expect(result.ok).toBe(false);
    expect(created).toHaveLength(0);
  });

  it("rejects a wrong password without creating a session", async () => {
    const created: unknown[] = [];
    const repo = await makeRepo({
      createSession: async (data) => {
        created.push(data);
        return [];
      },
    });

    const result = await login("admin@carthage.tn", "wrong-pass", { repository: repo });

    expect(result.ok).toBe(false);
    expect(created).toHaveLength(0);
  });

  it("returns the same generic error for unknown email and wrong password", async () => {
    const unknown = await login("nobody@example.com", "x", {
      repository: await makeRepo({ findUserByEmail: async () => undefined }),
    });
    const wrong = await login("admin@carthage.tn", "x", { repository: await makeRepo() });

    expect(unknown.ok).toBe(false);
    expect(wrong.ok).toBe(false);
    if (!unknown.ok && !wrong.ok) {
      expect(unknown.error).toBe(wrong.error);
    }
  });

  it("rejects a disabled account without creating a session", async () => {
    const created: unknown[] = [];
    const disabledHash = await hashPassword("correct-pass");
    const repo = await makeRepo({
      findUserByEmail: async () => ({
        id: "e4db0d17-a30a-4c1b-bf3b-0b2b9d3f7c11",
        email: "admin@carthage.tn",
        passwordHash: disabledHash,
        isActive: false,
        mustChangePassword: false,
      }),
      createSession: async (data) => {
        created.push(data);
        return [];
      },
    });

    const result = await login("admin@carthage.tn", "correct-pass", {
      repository: repo,
      rateLimiterOptions: { maxAttempts: 100, windowMs: 60_000 },
    });

    expect(result.ok).toBe(false);
    expect(created).toHaveLength(0);
    if (!result.ok) {
      expect(result.error).toBe("Identifiants invalides.");
    }
  });
});

describe("logout", () => {
  it("deletes the session by token hash", async () => {
    const deleted: string[] = [];
    const repo = await makeRepo({
      deleteSession: async (tokenHash) => {
        deleted.push(tokenHash);
      },
    });

    const token = "test-token-123";
    await logout(token, { repository: repo });

    expect(deleted).toHaveLength(1);
    expect(deleted[0]).toBe(sha256(token));
  });

  it("handles logout with non-existent session gracefully", async () => {
    const repo = await makeRepo({
      deleteSession: async () => {},
    });

    await expect(logout("non-existent-token", { repository: repo })).resolves.toBeUndefined();
  });
});

describe("login rate limiting", () => {
  const rateLimitOptions = { maxAttempts: 3, windowMs: 60_000 };

  it("allows requests within limit", async () => {
    const repo = await makeRepo({
      findUserByEmail: async () => undefined,
    });

    const result1 = await login("test@example.com", "wrong", {
      repository: repo,
      rateLimiterOptions: rateLimitOptions,
    });
    const result2 = await login("test@example.com", "wrong", {
      repository: repo,
      rateLimiterOptions: rateLimitOptions,
    });
    const result3 = await login("test@example.com", "wrong", {
      repository: repo,
      rateLimiterOptions: rateLimitOptions,
    });

    expect(result1.ok).toBe(false);
    expect(result2.ok).toBe(false);
    expect(result3.ok).toBe(false);
  });

  it("blocks requests exceeding limit", async () => {
    const repo = await makeRepo({
      findUserByEmail: async () => undefined,
    });

    await login("test2@example.com", "wrong", {
      repository: repo,
      rateLimiterOptions: rateLimitOptions,
    });
    await login("test2@example.com", "wrong", {
      repository: repo,
      rateLimiterOptions: rateLimitOptions,
    });
    await login("test2@example.com", "wrong", {
      repository: repo,
      rateLimiterOptions: rateLimitOptions,
    });
    const result = await login("test2@example.com", "wrong", {
      repository: repo,
      rateLimiterOptions: rateLimitOptions,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.rateLimited).toBe(true);
      expect(result.retryAfterMs).toBeGreaterThan(0);
      expect(result.error).toBe("Identifiants invalides.");
    }
  });

  it("uses separate limits per email", async () => {
    const repo = await makeRepo({
      findUserByEmail: async () => undefined,
    });

    await login("a@example.com", "wrong", {
      repository: repo,
      rateLimiterOptions: rateLimitOptions,
    });
    await login("a@example.com", "wrong", {
      repository: repo,
      rateLimiterOptions: rateLimitOptions,
    });
    await login("a@example.com", "wrong", {
      repository: repo,
      rateLimiterOptions: rateLimitOptions,
    });

    const resultB = await login("b@example.com", "wrong", {
      repository: repo,
      rateLimiterOptions: rateLimitOptions,
    });

    expect(resultB.ok).toBe(false);
    if (!resultB.ok) {
      expect(resultB.rateLimited).toBeFalsy();
    }
  });

  it("resets limit after successful login", async () => {
    const passwordHash = await hashPassword("correct-pass");
    const repo = await makeRepo({
      findUserByEmail: async () => ({
        id: "e4db0d17-a30a-4c1b-bf3b-0b2b9d3f7c11",
        email: "admin@carthage.tn",
        passwordHash,
        isActive: true,
        mustChangePassword: false,
      }),
      createSession: async () => ({}),
    });

    await login("reset@example.com", "wrong", {
      repository: repo,
      rateLimiterOptions: { maxAttempts: 5, windowMs: 60_000 },
    });
    await login("reset@example.com", "wrong", {
      repository: repo,
      rateLimiterOptions: { maxAttempts: 5, windowMs: 60_000 },
    });

    const successResult = await login("reset@example.com", "correct-pass", {
      repository: repo,
      rateLimiterOptions: { maxAttempts: 5, windowMs: 60_000 },
    });

    expect(successResult.ok).toBe(true);

    const afterSuccess = await login("reset@example.com", "wrong", {
      repository: repo,
      rateLimiterOptions: { maxAttempts: 5, windowMs: 60_000 },
    });
    if (!afterSuccess.ok) {
      expect(afterSuccess.rateLimited).toBeFalsy();
    }
  });
});
