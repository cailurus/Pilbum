import { sql } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema";
import { hashPassword } from "../password";
import { randomUUID } from "crypto";
import { dbLogger } from "../logger";

/**
 * Check if the database schema is ready (both users and photos tables exist).
 */
export async function checkSchema(): Promise<{
  ready: boolean;
  message: string;
}> {
  try {
    await db.execute(sql`SELECT id FROM users LIMIT 1`);
    await db.execute(sql`SELECT id FROM photos LIMIT 1`);
    return { ready: true, message: "Database is ready" };
  } catch (error) {
    dbLogger.info({ error }, "Database check: tables not found");
    return { ready: false, message: "Database not initialized, tables need to be created" };
  }
}

/**
 * Create all required tables and seed default admin user.
 * Uses IF NOT EXISTS so it's safe to call multiple times.
 * Compatible with PostgreSQL and PGlite.
 */
export async function initSchema(): Promise<void> {
  // Create users table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      display_name TEXT DEFAULT '',
      must_change_password BOOLEAN NOT NULL DEFAULT false,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Create photos table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      description TEXT DEFAULT '',
      image_url TEXT NOT NULL,
      thumbnail_url TEXT NOT NULL,
      blur_data_url TEXT,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      is_live_photo BOOLEAN NOT NULL DEFAULT false,
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
      is_visible BOOLEAN NOT NULL DEFAULT true,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Create settings table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Create indexes
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_photos_visible_sort
    ON photos (is_visible, sort_order, created_at)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_photos_created_at
    ON photos (created_at)
  `);

  // Seed default admin user (only if no users exist)
  const existingUsers = await db.select({ id: users.id }).from(users).limit(1);

  if (existingUsers.length === 0) {
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin";
    const passwordHash = await hashPassword(defaultPassword);
    const id = randomUUID();
    const now = new Date().toISOString();

    await db.insert(users).values({
      id,
      username: "admin",
      passwordHash,
      role: "admin",
      displayName: "Admin",
      mustChangePassword: true,
      createdAt: now,
      updatedAt: now,
    });

    dbLogger.info("Default admin user created");
  }
}
