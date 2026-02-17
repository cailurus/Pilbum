"use client";

import Link from "next/link";
import type { Photo } from "@/lib/db/schema";
import { LivePhotoPlayer } from "@/components/livephoto/live-photo-player";
import { ExifPanel } from "@/components/gallery/exif-panel";
import { displayConfig } from "@/config/display.config";
import { useImageLoaded } from "@/hooks/use-image-loaded";
import { ThemeToggle } from "@/components/theme-toggle";

interface PhotoDetailProps {
  photo: Photo;
  siteName: string;
}

// Compact shooting info strip with icons
function ShootingInfoStrip({ photo }: { photo: Photo }) {
  const items: { icon: React.ReactNode; value: string }[] = [];

  // Camera
  if (photo.cameraModel) {
    items.push({
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="6" width="20" height="14" rx="2" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      ),
      value: photo.cameraModel,
    });
  }

  // Focal length
  if (photo.focalLength) {
    items.push({
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      ),
      value: `${photo.focalLength}mm`,
    });
  }

  // Aperture
  if (photo.aperture) {
    items.push({
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
          <line x1="9.69" y1="8" x2="21.17" y2="8" />
          <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
        </svg>
      ),
      value: `f/${photo.aperture.toFixed(1).replace(/\.0$/, '')}`,
    });
  }

  // Shutter
  if (photo.shutterSpeed) {
    items.push({
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      value: photo.shutterSpeed,
    });
  }

  // ISO
  if (photo.iso) {
    items.push({
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M7 7v10M12 7v10M17 7v10" />
        </svg>
      ),
      value: `ISO ${photo.iso}`,
    });
  }

  // Date
  if (photo.takenAt) {
    items.push({
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M3 10h18" />
          <path d="M8 2v4M16 2v4" />
        </svg>
      ),
      value: new Date(photo.takenAt).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="text-neutral-400 dark:text-neutral-500">{item.icon}</span>
          <span>{item.value}</span>
        </span>
      ))}
    </div>
  );
}

export function PhotoDetail({ photo, siteName }: PhotoDetailProps) {
  const { loaded: imageLoaded, onLoad, onError, refCallback } = useImageLoaded(photo.imageUrl);

  // Check if there's detailed info to show below
  const hasDetailedInfo = (photo.latitude && photo.longitude) ||
    photo.fileSize || photo.originalFilename || photo.lensModel;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors">
      {/* Floating header - consistent width across all pages */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/50 dark:border-neutral-800/50 rounded-2xl shadow-sm">
        <div className="px-5 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors text-sm flex items-center gap-2 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="hidden sm:inline">返回</span>
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-medium tracking-wide text-neutral-600 dark:text-neutral-300">
              {siteName}
            </h1>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="pt-20 pb-8">
        {/* Main photo section - centered layout with consistent max-width matching header */}
        <section className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center">
          <div className="w-[calc(100%-2rem)] max-w-6xl mx-auto">
            {/* Title above photo */}
            {displayConfig.content.title && photo.title && (
              <h2 className="text-xl sm:text-2xl font-light text-neutral-900 dark:text-white text-center mb-4">
                {photo.title}
              </h2>
            )}

            {/* Photo - centered with max constraints */}
            <div className="w-full flex items-center justify-center">
              {photo.isLivePhoto && photo.livePhotoVideoUrl ? (
                <LivePhotoPlayer
                  imageUrl={photo.imageUrl}
                  videoUrl={photo.livePhotoVideoUrl}
                  alt={photo.title || "Photo"}
                  width={photo.width}
                  height={photo.height}
                  blurDataUrl={photo.blurDataUrl || undefined}
                  mode="hover"
                  className="max-w-full rounded-xl shadow-2xl shadow-neutral-900/10 dark:shadow-black/30"
                  maxHeight="calc(100vh - 16rem)"
                  objectFit="contain"
                />
              ) : (
                <div
                  className="relative max-w-full rounded-xl overflow-hidden shadow-2xl shadow-neutral-900/10 dark:shadow-black/30"
                  style={{
                    aspectRatio: `${photo.width}/${photo.height}`,
                    maxHeight: 'calc(100vh - 16rem)',
                  }}
                >
                  <img
                    ref={refCallback}
                    src={photo.imageUrl}
                    alt={photo.title || "Photo"}
                    onLoad={onLoad}
                    onError={onError}
                    className={`w-full h-full object-contain ${imageLoaded ? "img-loaded" : "img-loading"}`}
                    style={
                      photo.blurDataUrl && !imageLoaded
                        ? {
                          backgroundImage: `url(${photo.blurDataUrl})`,
                          backgroundSize: "cover",
                        }
                        : undefined
                    }
                  />
                </div>
              )}
            </div>

            {/* Description below photo */}
            {displayConfig.content.description && photo.description && (
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm sm:text-base text-center mt-4">
                {photo.description}
              </p>
            )}

            {/* Compact shooting info strip */}
            <div className="mt-6">
              <ShootingInfoStrip photo={photo} />
            </div>
          </div>
        </section>

        {/* Detailed metadata section - only if has extra info */}
        {hasDetailedInfo && (
          <section className="bg-white dark:bg-neutral-900/50 py-12 mt-8 border-t border-neutral-200 dark:border-neutral-800">
            <div className="w-[calc(100%-2rem)] max-w-6xl mx-auto">
              <ExifPanel photo={photo} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
