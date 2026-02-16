import { db } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { MasonryGallery } from "@/components/gallery/masonry-gallery";
import type { Photo } from "@/lib/db/schema";
import { siteConfig } from "@/config/site.config";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let photoList: Photo[] = [];
  let total = 0;

  try {
    const [result, countResult] = await Promise.all([
      db
        .select()
        .from(photos)
        .orderBy(desc(photos.sortOrder), desc(photos.createdAt))
        .limit(20),
      db.select({ count: sql<number>`count(*)` }).from(photos),
    ]);
    photoList = result;
    total = Number(countResult[0].count);
  } catch {
    // Database not initialized yet — show empty gallery
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors">
      {/* Header - floating style, same width as gallery */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/50 dark:border-neutral-800/50 rounded-2xl shadow-sm">
        <div className="px-5 py-3 flex items-center justify-between">
          <h1 className="text-lg font-medium tracking-wide text-neutral-900 dark:text-white">
            {siteConfig.name}
          </h1>
          <nav className="flex items-center gap-4">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
              {total} 张照片
            </span>
            <ThemeToggle />
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
