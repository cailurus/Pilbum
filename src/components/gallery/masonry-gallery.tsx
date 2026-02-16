"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Photo } from "@/lib/db/schema";
import { PhotoCard } from "./photo-card";

interface MasonryGalleryProps {
  initialPhotos: Photo[];
  initialTotal: number;
}

export function MasonryGallery({
  initialPhotos,
  initialTotal,
}: MasonryGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPhotos.length < initialTotal);
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/photos?page=${nextPage}&limit=20`);
      const data = await res.json();

      setPhotos((prev) => [...prev, ...data.photos]);
      setPage(nextPage);
      setHasMore(nextPage < data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to load more photos:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  if (photos.length === 0) {
    return (
      <div className="text-center text-neutral-500 dark:text-neutral-500 py-32">
        <p className="text-lg">暂无照片</p>
      </div>
    );
  }

  return (
    <>
      <div className="masonry">
        {photos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} />
        ))}
      </div>

      {/* Infinite scroll loader */}
      {hasMore && (
        <div ref={loaderRef} className="py-12 text-center">
          {loading && (
            <div className="inline-block w-6 h-6 border-2 border-neutral-300 dark:border-neutral-600 border-t-neutral-900 dark:border-t-white rounded-full animate-spin" />
          )}
        </div>
      )}
    </>
  );
}
