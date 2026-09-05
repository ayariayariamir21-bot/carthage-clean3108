import { Pool, PoolConfig } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

let pool: Pool | null = null;

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL n'est pas définie. Veuillez configurer la variable d'environnement DATABASE_URL dans votre fichier .env ou votre environnement d'exécution.",
    );
  }
  return url;
}

function getPoolConfig(): PoolConfig {
  const databaseUrl = getDatabaseUrl();
  const isProduction = process.env.NODE_ENV === "production";
  const isTest = process.env.NODE_ENV === "test";

  const baseConfig: PoolConfig = {
    connectionString: databaseUrl,
    max: isProduction ? 20 : isTest ? 5 : 10,
    idleTimeoutMillis: isProduction ? 30000 : 10000,
    connectionTimeoutMillis: isProduction ? 5000 : 10000,
    allowExitOnIdle: isTest,
  };

  if (isProduction) {
    baseConfig.ssl = { rejectUnauthorized: false };
  }

  return baseConfig;
}

function getPool(): Pool {
  if (!pool) {
    pool = new Pool(getPoolConfig());
    pool.on("error", (err) => {
      console.error("Erreur inattendue sur le pool PostgreSQL :", err);
      process.exit(-1);
    });
  }
  return pool;
}

function getDb() {
  return drizzle(getPool(), { schema });
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop, receiver) {
    const dbInstance = getDb();
    const value = Reflect.get(dbInstance, prop, receiver);
    if (typeof value === "function") {
      return value.bind(dbInstance);
    }
    return value;
  },
});

export { schema };

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
