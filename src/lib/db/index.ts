import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import * as fs from "fs";
import * as path from "path";

type Database = PostgresJsDatabase<typeof schema>;

// Prevent multiple instances during HMR in development
const globalForDb = globalThis as unknown as { _db: Database | undefined };

async function createDb(): Promise<Database> {
    const provider = process.env.DATABASE_PROVIDER || "local";

    if (provider === "local") {
        const dbPath = process.env.LOCAL_DB_PATH || "./data/pglite";
        // Ensure the directory exists before PGlite tries to use it
        fs.mkdirSync(path.resolve(dbPath), { recursive: true });

        const { PGlite } = await import("@electric-sql/pglite");
        const { drizzle } = await import("drizzle-orm/pglite");
        const client = new PGlite(dbPath);
        return drizzle(client, { schema }) as unknown as Database;
    }

    const { default: postgres } = await import("postgres");
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const client = postgres(process.env.DATABASE_URL!, { prepare: false });
    return drizzle(client, { schema });
}

if (!globalForDb._db) {
    globalForDb._db = await createDb();
}

export const db = globalForDb._db!;
