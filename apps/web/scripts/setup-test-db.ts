import "./load-env";

// Set DATABASE_URL before importing any modules that use the database
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://carthage:carthage@localhost:5432/carthage_clean_test";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { hashPassword } from "@/lib/auth/password";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TEST_USERS } from "@/lib/test/seed";

async function setupTestDatabase() {
  // Connect to the default postgres database to create the role and database
  const adminPool = new Pool({
    connectionString: "postgresql://postgres:postgres@localhost:5432/postgres",
  });

  const adminClient = await adminPool.connect();

  try {
    // Create the carthage role if it doesn't exist
    await adminClient.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'carthage') THEN
          CREATE ROLE carthage WITH LOGIN PASSWORD 'carthage';
        END IF;
      END;
      $$;
    `);
    console.log("✓ Role 'carthage' ensured");

    // Create the test database if it doesn't exist
    const dbCheck = await adminClient.query(`
      SELECT 1 FROM pg_database WHERE datname = 'carthage_clean_test'
    `);

    if (dbCheck.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE carthage_clean_test OWNER carthage`);
      console.log("✓ Database 'carthage_clean_test' created");
    } else {
      console.log("✓ Database 'carthage_clean_test' already exists");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("Could not create role/database (may already exist):", message);
  } finally {
    adminClient.release();
    await adminPool.end();
  }

  // Wait a moment for database to be fully ready
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const databaseUrl =
    process.env.DATABASE_URL || "postgresql://carthage:carthage@localhost:5432/carthage_clean_test";

  // Run migrations
  console.log("Running migrations...");
  const migrationPool = new Pool({ connectionString: databaseUrl });
  const drizzleDb = drizzle(migrationPool);

  await migrate(drizzleDb, { migrationsFolder: "./db/migrations" });
  console.log("✓ Migrations completed");

  // Use drizzleDb for bootstrapping (same pool)
  console.log("Bootstrapping test users...");

  for (const user of TEST_USERS) {
    // Check if user already exists
    const existing = await drizzleDb
      .select()
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1);

    if (existing.length === 0) {
      const passwordHash = await hashPassword(user.password);
      await drizzleDb.insert(users).values({
        email: user.email,
        passwordHash,
        role: user.role,
        isActive: user.isActive,
        mustChangePassword: user.mustChangePassword,
      });
      console.log(`✓ Created ${user.role} user: ${user.email}`);
    } else {
      // Update password to match test expectations
      const passwordHash = await hashPassword(user.password);
      await drizzleDb
        .update(users)
        .set({
          passwordHash,
          mustChangePassword: user.mustChangePassword,
          isActive: user.isActive,
          role: user.role,
        })
        .where(eq(users.email, user.email));
      console.log(`✓ Updated ${user.role} user: ${user.email}`);
    }
  }

  await migrationPool.end();
  console.log("✓ Test users setup complete");
  console.log("✓ Test database setup complete");
}

setupTestDatabase().catch((error) => {
  console.error("Failed to setup test database:", error);
  process.exit(1);
});
