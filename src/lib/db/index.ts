import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as fs from "fs";
import * as path from "path";

export type Database = ReturnType<typeof drizzlePglite<typeof schema>> | ReturnType<typeof drizzlePostgres<typeof schema>>;

// Prevent multiple instances during HMR in development
const globalForDb = globalThis as unknown as {
  _db: Database | undefined;
};

function createDb(): Database {
  const provider = process.env.DATABASE_PROVIDER || "local";

  if (provider === "local") {
    // Local mode: use PGlite (in-process PostgreSQL)
    const dbPath = process.env.LOCAL_DB_PATH || "./data/pglite";
    const absolutePath = path.resolve(dbPath);

    // Ensure directory exists
    const dir = path.dirname(absolutePath);
    fs.mkdirSync(dir, { recursive: true });

    const client = new PGlite(absolutePath);
    return drizzlePglite(client, { schema });
  }

  // Cloud mode: use postgres.js driver
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required when DATABASE_PROVIDER is not 'local'. " +
      "Set DATABASE_PROVIDER=local for SQLite mode, or provide a DATABASE_URL."
    );
  }

  const client = postgres(databaseUrl, { prepare: false });
  return drizzlePostgres(client, { schema });
}

if (!globalForDb._db) {
  globalForDb._db = createDb();
}

export const db = globalForDb._db;
