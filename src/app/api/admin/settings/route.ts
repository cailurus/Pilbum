import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings, SETTING_KEYS, type SettingKey } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { logger } from "@/lib/logger";

const adminSettingsLogger = logger.child({ module: "admin-settings" });

// Allowed setting keys
const ALLOWED_KEYS = new Set<string>(Object.values(SETTING_KEYS));

// PUT /api/admin/settings - Update settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Missing key or value" },
        { status: 400 }
      );
    }

    // Validate key against whitelist
    if (!ALLOWED_KEYS.has(key)) {
      return NextResponse.json(
        { error: "Invalid setting key" },
        { status: 400 }
      );
    }

    // Upsert the setting
    const existing = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(settings)
        .set({ value: String(value), updatedAt: new Date().toISOString() })
        .where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({
        key,
        value: String(value),
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    adminSettingsLogger.error({ error }, "Failed to update setting");
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 }
    );
  }
}

// GET /api/admin/settings - Get all settings (admin only)
export async function GET() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allSettings = await db.select().from(settings);
    const result: Record<string, string> = {};
    for (const setting of allSettings) {
      result[setting.key] = setting.value;
    }

    return NextResponse.json({ settings: result });
  } catch (error) {
    adminSettingsLogger.error({ error }, "Failed to fetch settings");
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
