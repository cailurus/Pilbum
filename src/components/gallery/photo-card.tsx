"use client";

import Link from "next/link";
import type { Photo } from "@/lib/db/schema";
import { LivePhotoPlayer } from "@/components/livephoto/live-photo-player";
import { useImageLoaded } from "@/hooks/use-image-loaded";

interface PhotoCardProps {
  photo: Photo;
}

export function PhotoCard({ photo }: PhotoCardProps) {
  const { loaded, onLoad, onError, refCallback } = useImageLoaded(photo.thumbnailUrl);

  // Format aperture value
  const formattedAperture = photo.aperture
    ? `f/${photo.aperture.toFixed(1).replace(/\.0$/, '')}`
    : null;

  return (
    <div className="masonry-item">
      <Link
        href={`/photo/${photo.id}`}
        className="block group cursor-pointer"
        aria-label={photo.title || `查看照片 ${photo.id.slice(0, 8)}`}
      >
        <div className="relative rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 shadow-sm hover:shadow-xl transition-shadow duration-300">
          {photo.isLivePhoto && photo.livePhotoVideoUrl ? (
            <LivePhotoPlayer
              imageUrl={photo.thumbnailUrl}
              videoUrl={photo.livePhotoVideoUrl}
              alt={photo.title || `照片 - ${photo.cameraModel || '未知相机'}`}
              width={photo.width}
              height={photo.height}
              blurDataUrl={photo.blurDataUrl || undefined}
              mode="hover"
            />
          ) : (
            <div
              className="relative overflow-hidden"
              style={{ aspectRatio: `${photo.width}/${photo.height}` }}
            >
              <img
                ref={refCallback}
                src={photo.thumbnailUrl}
                alt={photo.title || `照片 - ${photo.cameraModel || '未知相机'}`}
                loading="lazy"
                onLoad={onLoad}
                onError={onError}
                className={`w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out ${loaded ? "img-loaded" : "img-loading"
                  }`}
                style={
                  photo.blurDataUrl && !loaded
                    ? {
                      backgroundImage: `url(${photo.blurDataUrl})`,
                      backgroundSize: "cover",
                    }
                    : undefined
                }
              />
            </div>
          )}

          {/* Hover overlay with info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              {photo.title && (
                <h3 className="text-white font-medium text-sm truncate mb-1">
                  {photo.title}
                </h3>
              )}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-white/70 text-xs">
                {photo.cameraModel && (
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="6" width="20" height="14" rx="2" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    {photo.cameraModel}
                  </span>
                )}
                {formattedAperture && <span>{formattedAperture}</span>}
                {photo.shutterSpeed && <span>{photo.shutterSpeed}</span>}
                {photo.iso && <span>ISO {photo.iso}</span>}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
