"use client";

import Link from "next/link";
import type { Photo } from "@/lib/db/schema";
import { LivePhotoPlayer } from "@/components/livephoto/live-photo-player";
import { ExifPanel } from "@/components/gallery/exif-panel";
import { useState } from "react";

interface PhotoDetailProps {
  photo: Photo;
}

export function PhotoDetail({ photo }: PhotoDetailProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-neutral-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-neutral-400 hover:text-white transition-colors text-sm flex items-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            返回
          </Link>
          <h1 className="text-sm font-light tracking-widest text-neutral-400">
            PILBUM
          </h1>
        </div>
      </header>

      <main className="pt-16">
        {/* Photo display */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="rounded-2xl overflow-hidden bg-neutral-900">
            {photo.isLivePhoto && photo.livePhotoVideoUrl ? (
              <LivePhotoPlayer
                imageUrl={photo.imageUrl}
                videoUrl={photo.livePhotoVideoUrl}
                alt={photo.title || "Photo"}
                width={photo.width}
                height={photo.height}
                blurDataUrl={photo.blurDataUrl || undefined}
                mode="longpress"
              />
            ) : (
              <div
                className="relative"
                style={{ aspectRatio: `${photo.width}/${photo.height}` }}
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.title || "Photo"}
                  onLoad={() => setImageLoaded(true)}
                  className={`w-full h-full object-contain ${imageLoaded ? "img-loaded" : "img-loading"
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
          </div>

          {/* Photo info */}
          <div className="mt-8 max-w-3xl mx-auto">
            {photo.title && (
              <h2 className="text-2xl font-light text-white mb-2">
                {photo.title}
              </h2>
            )}
            {photo.description && (
              <p className="text-neutral-400 leading-relaxed mb-8">
                {photo.description}
              </p>
            )}

            {/* EXIF info */}
            <ExifPanel photo={photo} />
          </div>
        </div>
      </main>
    </div>
  );
}
