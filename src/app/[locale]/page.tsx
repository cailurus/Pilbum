import { db } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { MasonryGallery } from "@/components/gallery/masonry-gallery";
import type { Photo } from "@/lib/db/schema";

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
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-neutral-950/80 border-b border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-light tracking-widest text-white">
            PILBUM
          </h1>
          <nav className="text-sm text-neutral-400">
            <span>{total} photos</span>
          </nav>
        </div>
      </header>

      {/* Gallery */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <MasonryGallery initialPhotos={photoList} initialTotal={total} />
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/50 py-8 text-center text-sm text-neutral-600">
        Powered by Pilbum
      </footer>
    </div>
  );
}
