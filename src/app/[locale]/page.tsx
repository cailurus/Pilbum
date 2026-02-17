import { db } from "@/lib/db";
import { photos, settings, SETTING_KEYS } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { MasonryGallery } from "@/components/gallery/masonry-gallery";
import type { Photo } from "@/lib/db/schema";
import { siteConfig } from "@/config/site.config";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

// Helper function to get site name from settings
async function getSiteName(): Promise<string> {
  try {
    const allSettings = await db.select().from(settings);
    const siteNameSetting = allSettings.find(s => s.key === SETTING_KEYS.SITE_NAME);
    return siteNameSetting?.value || siteConfig.name;
  } catch {
    return siteConfig.name;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return {
    title: siteName,
  };
}

export default async function HomePage() {
  const t = await getTranslations();
  let photoList: Photo[] = [];
  let total = 0;
  let showLoginButton = false;
  let siteName = siteConfig.name;

  // Fetch photos (only visible ones)
  try {
    const [result, countResult] = await Promise.all([
      db
        .select()
        .from(photos)
        .where(eq(photos.isVisible, true))
        .orderBy(desc(photos.sortOrder), desc(photos.createdAt))
        .limit(20),
      db.select({ count: sql<number>`count(*)` }).from(photos).where(eq(photos.isVisible, true)),
    ]);
    photoList = result;
    total = Number(countResult[0].count);
  } catch {
    // Database not initialized yet — show empty gallery
  }

  // Fetch settings separately (table might not exist yet)
  try {
    const allSettings = await db.select().from(settings);
    for (const setting of allSettings) {
      if (setting.key === SETTING_KEYS.SHOW_LOGIN_BUTTON) {
        showLoginButton = setting.value === "true";
      } else if (setting.key === SETTING_KEYS.SITE_NAME) {
        siteName = setting.value;
      }
    }
  } catch {
    // Settings table not ready yet — use default
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors">
      {/* Header - floating style, same width as gallery */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/50 dark:border-neutral-800/50 rounded-2xl shadow-sm">
        <div className="px-5 py-3 flex items-center justify-between">
          <h1 className="text-lg font-medium tracking-wide text-neutral-900 dark:text-white">
            {siteName}
          </h1>
          <nav className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            {showLoginButton && (
              <Link
                href="/admin/login"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                title={t("auth.login")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Gallery - same width as header */}
      <main className="w-[calc(100%-2rem)] max-w-6xl mx-auto pt-24 pb-12">
        <MasonryGallery initialPhotos={photoList} initialTotal={total} />
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800/50 py-8 text-center text-xs text-neutral-400 dark:text-neutral-600">
        © {new Date().getFullYear()} {siteConfig.copyright}
      </footer>
    </div>
  );
}
