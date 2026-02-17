import { db } from "@/lib/db";
import { settings, SETTING_KEYS } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { siteConfig } from "@/config/site.config";

/**
 * Get site name from database settings, falling back to config default.
 */
export async function getSiteName(): Promise<string> {
  try {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.key, SETTING_KEYS.SITE_NAME))
      .limit(1);
    return result[0]?.value || siteConfig.name;
  } catch {
    return siteConfig.name;
  }
}
