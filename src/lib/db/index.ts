import * as fs from "fs";
import * as path from "path";
import Database from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

export type Database = BetterSQLite3Database<typeof schema>;

// Prevent multiple instances during HMR in development
const globalForDb = globalThis as unknown as {
    _db: Database | undefined;
    _dbClient: InstanceType<typeof Database> | undefined;
};

function createDb(): Database {
    const dbPath = process.env.LOCAL_DB_PATH || "./data/sqlite.db";
    const absolutePath = path.resolve(dbPath);

    // Ensure the directory exists
    const dir = path.dirname(absolutePath);
    fs.mkdirSync(dir, { recursive: true });

    const sqlite = new Database(absolutePath);
    // Enable WAL mode for better performance
    sqlite.pragma("journal_mode = WAL");

    globalForDb._dbClient = sqlite;
    return drizzle(sqlite, { schema });
}

if (!globalForDb._db) {
    globalForDb._db = createDb();
}

export const db = globalForDb._db;
