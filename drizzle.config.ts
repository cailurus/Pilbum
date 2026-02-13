import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const isLocal = process.env.DATABASE_PROVIDER === "local";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/lib/db/schema.ts",
  dialect: "postgresql",
  ...(isLocal
    ? {
      driver: "pglite",
      dbCredentials: {
        url: process.env.LOCAL_DB_PATH || "./data/pglite",
      },
    }
    : {
      dbCredentials: {
        url: process.env.DATABASE_URL!,
      },
    }),
});
