import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";

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
    console.error("Failed to update setting:", error);
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
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
