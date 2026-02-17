import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings, SETTING_KEYS } from "@/lib/db/schema";
import { siteConfig } from "@/config/site.config";

// Default settings values
const DEFAULT_SETTINGS: Record<string, string> = {
  [SETTING_KEYS.SHOW_LOGIN_BUTTON]: "false",
  [SETTING_KEYS.SITE_NAME]: siteConfig.name,
};

// GET /api/settings - Get all public settings (no auth required)
export async function GET() {
  try {
    const allSettings = await db.select().from(settings);

    // Merge with defaults
    const result: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const setting of allSettings) {
      result[setting.key] = setting.value;
    }

    return NextResponse.json({ settings: result });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    // Return defaults on error
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  }
}
