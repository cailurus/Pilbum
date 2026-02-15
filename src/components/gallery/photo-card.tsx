"use client";

import { useState } from "react";
import Link from "next/link";
import type { Photo } from "@/lib/db/schema";
import { LivePhotoPlayer } from "@/components/livephoto/live-photo-player";

interface PhotoCardProps {
  photo: Photo;
}

export function PhotoCard({ photo }: PhotoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="masonry-item">
      <Link
        href={`/photo/${photo.id}`}
        className="block group"
        aria-label={photo.title || `查看照片 ${photo.id.slice(0, 8)}`}
      >
        <div className="relative rounded-xl overflow-hidden bg-neutral-900">
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
                src={photo.thumbnailUrl}
                alt={photo.title || `照片 - ${photo.cameraModel || '未知相机'}`}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${imageLoaded ? "img-loaded" : "img-loading"
                  }`}
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

          {/* Hover overlay with info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {photo.title && (
                <h3 className="text-white font-medium text-sm truncate">
                  {photo.title}
                </h3>
              )}
              <div className="flex items-center gap-2 mt-1 text-white/60 text-xs">
                {photo.cameraModel && <span>{photo.cameraModel}</span>}
                {photo.aperture && <span>f/{photo.aperture}</span>}
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
