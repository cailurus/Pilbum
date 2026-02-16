import { sql } from "drizzle-orm";
import { db } from "./index";
import { hashPassword } from "../password";
import { randomUUID } from "crypto";

/**
 * Check if the database schema is ready (both users and photos tables exist).
 */
export async function checkSchema(): Promise<{
    ready: boolean;
    message: string;
}> {
    try {
        await db.run(sql`SELECT id FROM users LIMIT 1`);
        await db.run(sql`SELECT id FROM photos LIMIT 1`);
        return { ready: true, message: "数据库已就绪" };
    } catch (error) {
        console.error("Database check failed:", error);
        return { ready: false, message: "数据库尚未初始化，需要创建表结构" };
    }
}

/**
 * Create all required tables and seed default admin user.
 * Uses IF NOT EXISTS so it's safe to call multiple times.
 * Compatible with SQLite.
 */
export async function initSchema(): Promise<void> {
    // Create users table (SQLite compatible)
    await db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      display_name TEXT DEFAULT '',
      must_change_password INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Create photos table with all columns including extended EXIF fields (SQLite compatible)
    await db.run(sql`
    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      description TEXT DEFAULT '',
      image_url TEXT NOT NULL,
      thumbnail_url TEXT NOT NULL,
      blur_data_url TEXT,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      is_live_photo INTEGER NOT NULL DEFAULT 0,
      live_photo_video_url TEXT,
      camera_make TEXT,
      camera_model TEXT,
      lens_model TEXT,
      lens_make TEXT,
      software TEXT,
      focal_length REAL,
      focal_length_35mm REAL,
      aperture REAL,
      shutter_speed TEXT,
      exposure_time REAL,
      iso INTEGER,
      exposure_bias REAL,
      exposure_program TEXT,
      exposure_mode TEXT,
      metering_mode TEXT,
      flash TEXT,
      white_balance TEXT,
      color_space TEXT,
      orientation INTEGER,
      taken_at TEXT,
      latitude REAL,
      longitude REAL,
      altitude REAL,
      original_filename TEXT,
      file_size INTEGER,
      mime_type TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Seed default admin user (only if no users exist)
    const result = await db.run(sql`SELECT count(*) as cnt FROM users`);
    const count = (result as unknown as { cnt: number })?.cnt ?? 0;

    if (count === 0) {
        const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin";
        const passwordHash = await hashPassword(defaultPassword);
        const id = randomUUID();

        await db.run(sql`
      INSERT INTO users (id, username, password_hash, role, display_name, must_change_password)
      VALUES (${id}, 'admin', ${passwordHash}, 'admin', '管理员', 1)
    `);
    }
}
