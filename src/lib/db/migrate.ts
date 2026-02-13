import { sql } from "drizzle-orm";
import { db } from "./index";
import { hashPassword } from "../password";

/**
 * Check if the database schema is ready (both users and photos tables exist).
 */
export async function checkSchema(): Promise<{
    ready: boolean;
    message: string;
}> {
    try {
        await db.execute(sql`SELECT id FROM users LIMIT 0`);
        await db.execute(sql`SELECT id FROM photos LIMIT 0`);
        return { ready: true, message: "数据库已就绪" };
    } catch {
        return { ready: false, message: "数据库尚未初始化，需要创建表结构" };
    }
}

/**
 * Create all required tables and seed default admin user.
 * Uses IF NOT EXISTS so it's safe to call multiple times.
 */
export async function initSchema(): Promise<void> {
    // Create users table
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      display_name TEXT DEFAULT '',
      must_change_password BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `);

    // Create photos table
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS photos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
      focal_length REAL,
      aperture REAL,
      shutter_speed TEXT,
      iso INTEGER,
      taken_at TIMESTAMP,
      latitude REAL,
      longitude REAL,
      altitude REAL,
      original_filename TEXT,
      file_size INTEGER,
      mime_type TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `);

    // Seed default admin user (only if no users exist)
    const existing = await db.execute(sql`SELECT count(*) as cnt FROM users`);
    const row = (existing as unknown as { rows: Record<string, unknown>[] }).rows?.[0]
        ?? (existing as unknown as Record<string, unknown>[])?.[0];
    const count = Number((row as Record<string, unknown>)?.cnt ?? 0);

    if (count === 0) {
        const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin";
        const passwordHash = await hashPassword(defaultPassword);

        await db.execute(sql`
      INSERT INTO users (username, password_hash, role, display_name, must_change_password)
      VALUES ('admin', ${passwordHash}, 'admin', '管理员', true)
    `);
    }
}
