"use client";

import { useRef, useState, useCallback } from "react";

interface LivePhotoPlayerProps {
  imageUrl: string;
  videoUrl: string;
  alt: string;
  width: number;
  height: number;
  blurDataUrl?: string;
  mode: "hover" | "longpress";
  className?: string;
}

export function LivePhotoPlayer({
  imageUrl,
  videoUrl,
  alt,
  width,
  height,
  blurDataUrl,
  mode,
  className = "",
}: LivePhotoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => { });
    setIsPlaying(true);
  }, []);

  const stopPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);
  }, []);

  // Hover handlers
  const handleMouseEnter = mode === "hover" ? startPlayback : undefined;
  const handleMouseLeave = mode === "hover" ? stopPlayback : undefined;

  // Long press handlers
  const handlePointerDown =
    mode === "longpress"
      ? () => {
        longPressTimer.current = setTimeout(startPlayback, 300);
      }
      : undefined;

  const handlePointerUp =
    mode === "longpress"
      ? () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        stopPlayback();
      }
      : undefined;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: `${width}/${height}` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={mode === "longpress" ? (e) => e.preventDefault() : undefined}
    >
      {/* Static image */}
      <img
        src={imageUrl}
        alt={alt}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? "opacity-0" : "opacity-100"
          } ${imageLoaded ? "img-loaded" : "img-loading"}`}
        style={
          blurDataUrl && !imageLoaded
            ? { backgroundImage: `url(${blurDataUrl})`, backgroundSize: "cover" }
            : undefined
        }
      />

      {/* Video layer */}
      <video
        ref={videoRef}
        src={videoUrl}
        muted
        playsInline
        loop
        preload="none"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? "opacity-100" : "opacity-0"
          }`}
      />

      {/* LIVE badge */}
      <div
        className={`absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all ${isPlaying
            ? "bg-red-500 text-white"
            : "bg-black/50 text-white/80 backdrop-blur-sm"
          }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-white live-badge" : "bg-yellow-400"
            }`}
        />
        LIVE
      </div>
    </div>
  );
}
