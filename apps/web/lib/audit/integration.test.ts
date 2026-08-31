import { describe, expect, it, vi } from "vitest";
import { createAgent } from "@/lib/auth/agents";
import type { AuditRepository } from "./log";

describe("audit integration", () => {
  it("records an event when a service performs an audited action", async () => {
    const insertAudit = vi.fn(async () => undefined);
    const audit: AuditRepository = { insertAuditLog: insertAudit, listAuditLogs: vi.fn() };

    const repository = {
      findUserByEmail: async () => undefined,
      insertUser: async () => ({ id: "new-agent", email: "agent@carthage.clean" }),
    } as never;

    const result = await createAgent(
      { name: "Jean", email: "agent@carthage.clean", password: "motdepasse1" },
      { repository, actorId: "admin-1", audit },
    );

    expect(result.ok).toBe(true);
    expect(insertAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "admin-1",
        action: "agent.create",
        entityType: "agent",
        entityId: "new-agent",
      }),
    );
  });
});
