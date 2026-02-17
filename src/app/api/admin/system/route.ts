import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { photos, users, settings } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { APP_VERSION } from "@/config/version";
import * as fs from "fs";
import * as path from "path";

// Get directory size recursively
function getDirectorySize(dirPath: string): number {
  let totalSize = 0;

  try {
    if (!fs.existsSync(dirPath)) return 0;

    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch {
    // Ignore errors
  }

  return totalSize;
}

// Format bytes to human readable
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export async function GET() {
  // Check authentication
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Database info
    const databaseProvider = process.env.DATABASE_PROVIDER || "local";
    const dbPath = process.env.LOCAL_DB_PATH || "./data/sqlite.db";

    let databaseSize = 0;
    let databaseSizeFormatted = "N/A";

    if (databaseProvider === "local") {
      try {
        const absolutePath = path.resolve(dbPath);
        if (fs.existsSync(absolutePath)) {
          const stats = fs.statSync(absolutePath);
          databaseSize = stats.size;
          databaseSizeFormatted = formatBytes(databaseSize);
        }
        // Also check WAL and SHM files
        const walPath = absolutePath + "-wal";
        const shmPath = absolutePath + "-shm";
        if (fs.existsSync(walPath)) {
          databaseSize += fs.statSync(walPath).size;
        }
        if (fs.existsSync(shmPath)) {
          databaseSize += fs.statSync(shmPath).size;
        }
        databaseSizeFormatted = formatBytes(databaseSize);
      } catch {
        // Ignore errors
      }
    }

    // Storage info
    const storageProvider = process.env.STORAGE_PROVIDER || "local";
    const localStoragePath = process.env.LOCAL_STORAGE_PATH || "public/uploads";

    let storageSize = 0;
    let storageSizeFormatted = "N/A";

    if (storageProvider === "local") {
      const absolutePath = path.resolve(localStoragePath);
      storageSize = getDirectorySize(absolutePath);
      storageSizeFormatted = formatBytes(storageSize);
    }

    // Count records
    const [photoCount, userCount, settingCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(photos),
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(settings),
    ]);

    // Calculate photo storage from database
    const photoStorageResult = await db
      .select({ total: sql<number>`COALESCE(SUM(file_size), 0)` })
      .from(photos);
    const photoStorageSize = Number(photoStorageResult[0]?.total || 0);

    // Get storage configuration display
    const getStorageConfig = () => {
      switch (storageProvider) {
        case "s3":
          return {
            type: "S3 Compatible",
            endpoint: process.env.S3_ENDPOINT || "N/A",
            bucket: process.env.S3_BUCKET || "N/A",
            region: process.env.S3_REGION || "N/A",
          };
        case "azure":
          return {
            type: "Azure Blob",
            container: process.env.AZURE_STORAGE_CONTAINER_NAME || "N/A",
          };
        case "supabase":
          return {
            type: "Supabase Storage",
            bucket: process.env.SUPABASE_BUCKET || "N/A",
          };
        default:
          return {
            type: "Local Filesystem",
            path: path.resolve(localStoragePath),
          };
      }
    };

    // Get database configuration display
    const getDatabaseConfig = () => {
      switch (databaseProvider) {
        case "postgres":
          // Mask password in URL
          const dbUrl = process.env.DATABASE_URL || "";
          const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");
          return {
            type: "PostgreSQL",
            url: maskedUrl || "N/A",
          };
        default:
          return {
            type: "SQLite",
            path: path.resolve(dbPath),
          };
      }
    };

    return NextResponse.json({
      version: APP_VERSION,
      database: {
        provider: databaseProvider,
        config: getDatabaseConfig(),
        size: databaseSize,
        sizeFormatted: databaseSizeFormatted,
        records: {
          photos: Number(photoCount[0].count),
          users: Number(userCount[0].count),
          settings: Number(settingCount[0].count),
        },
      },
      storage: {
        provider: storageProvider,
        config: getStorageConfig(),
        size: storageSize,
        sizeFormatted: storageSizeFormatted,
        photoStorageSize,
        photoStorageSizeFormatted: formatBytes(photoStorageSize),
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    });
  } catch (error) {
    console.error("Failed to get system info:", error);
    return NextResponse.json(
      { error: "Failed to get system info" },
      { status: 500 }
    );
  }
}
