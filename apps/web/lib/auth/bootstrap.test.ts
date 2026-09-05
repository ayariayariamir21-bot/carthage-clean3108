import { describe, expect, it } from "vitest";
import { bootstrapAdmin, type BootstrapRepository } from "./bootstrap";

function makeRepo(overrides: Partial<BootstrapRepository> = {}): {
  repo: BootstrapRepository;
  calls: { created: unknown[] };
} {
  const calls = { created: [] as unknown[] };
  return {
    calls,
    repo: {
      findAdmin: async () => undefined,
      createUser: async (data) => {
        calls.created.push(data);
        return { id: "new-admin-id", email: data.email };
      },
      ...overrides,
    },
  };
}

describe("bootstrapAdmin", () => {
  it("creates an admin with role 'admin', hashed password, and mustChangePassword flag when none exists", async () => {
    const { repo, calls } = makeRepo();
    const hashes: string[] = [];

    const result = await bootstrapAdmin(
      { email: "Admin@Carthage.TN " },
      {
        repository: repo,
        hash: async (pw) => {
          hashes.push(pw);
          return `hashed(${pw})`;
        },
      },
    );

    expect(result.created).toBe(true);
    if (result.created) {
      expect(result.user.email).toBe("admin@carthage.tn");
      expect(typeof result.initialPassword).toBe("string");
      expect(result.initialPassword.length).toBeGreaterThanOrEqual(20);
    }
    expect(calls.created).toHaveLength(1);
    const created = calls.created[0] as {
      email: string;
      passwordHash: string;
      role: string;
      mustChangePassword: boolean;
    };
    expect(created.email).toBe("admin@carthage.tn");
    expect(created.role).toBe("admin");
    expect(created.mustChangePassword).toBe(true);
    expect(created.passwordHash).toBe(`hashed(${hashes[0]})`);
    expect(hashes).toHaveLength(1);
  });

  it("does nothing when an admin already exists", async () => {
    const { repo, calls } = makeRepo({
      findAdmin: async () => ({ id: "existing", role: "admin" }),
    });

    const result = await bootstrapAdmin({ email: "admin@carthage.tn" }, { repository: repo });

    expect(result.created).toBe(false);
    if (!result.created) {
      expect(result.reason).toBe("admin_exists");
    }
    expect(calls.created).toHaveLength(0);
  });
});
