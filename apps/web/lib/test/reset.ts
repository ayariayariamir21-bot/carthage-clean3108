import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { hashPassword } from "@/lib/auth/password";
import { users, zones } from "@/db/schema";
import { TEST_USERS } from "./seed";
import { resetRateLimiter } from "@/lib/auth/rate-limiter";

function assertTestEnvironment(databaseUrl: string): void {
  if (!databaseUrl.includes("carthage_clean_test")) {
    throw new Error(
      `resetTestDatabase: DATABASE_URL does not look like a test DB (${databaseUrl}) — refusing to truncate.`,
    );
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(`resetTestDatabase: NODE_ENV is "production" — refusing to truncate.`);
  }
}

export async function resetTestDatabase(databaseUrl?: string): Promise<void> {
  const url = databaseUrl ?? process.env.DATABASE_URL;

  if (!url) {
    throw new Error("resetTestDatabase: DATABASE_URL is not defined");
  }

  assertTestEnvironment(url);

  const pool = new Pool({ connectionString: url });
  const db = drizzle(pool);

  try {
    // Truncate in FK-safe order with CASCADE. RESTART IDENTITY resets sequences if any.
    // Order: dependent tables first, then parents. CASCADE handles remaining FKs.
    await pool.query(`
      TRUNCATE TABLE
        "tour_agents",
        "tours",
        "zone_assignments",
        "sessions",
        "audit_logs",
        "zones",
        "users"
      RESTART IDENTITY CASCADE;
    `);

    // Reseed baseline users
    for (const user of TEST_USERS) {
      const passwordHash = await hashPassword(user.password);
      await db.insert(users).values({
        email: user.email,
        passwordHash,
        role: user.role,
        isActive: user.isActive,
        mustChangePassword: user.mustChangePassword,
      });
    }

    // Seed baseline zone for tours tests (tours require an active zone)
    await db.insert(zones).values({
      name: "Zone Test",
      code: "ZTEST",
      description: "Zone de test E2E",
      isActive: true,
    });

    // Reset in-memory rate limiter for the current process (server process when called via API)
    resetRateLimiter();
  } finally {
    await pool.end();
  }
}

// Helper for API route: resets via direct DB + rate limiter; idempotent
export async function resetTestDatabaseFromApi(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  await resetTestDatabase(url);
}
