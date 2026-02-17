"use client";

import { useRef, useState, useCallback } from "react";
import { useImageLoaded } from "@/hooks/use-image-loaded";

interface LivePhotoPlayerProps {
  imageUrl: string;
  videoUrl: string;
  alt: string;
  width: number;
  height: number;
  blurDataUrl?: string;
  mode: "hover" | "longpress";
  className?: string;
  maxHeight?: string;
  objectFit?: "cover" | "contain";
  muted?: boolean;
  onMutedChange?: (muted: boolean) => void;
  showSoundToggle?: boolean;
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
  maxHeight,
  objectFit = "cover",
  muted = true,
  onMutedChange,
  showSoundToggle = false,
}: LivePhotoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { loaded: imageLoaded, onLoad, onError, refCallback } = useImageLoaded(imageUrl);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      isPlaying ? stopPlayback() : startPlayback();
    }
  };

  const fitClass = objectFit === "contain" ? "object-contain" : "object-cover";

  return (
    <div
      className={`relative overflow-hidden w-full ${className}`}
      style={{
        aspectRatio: `${width}/${height}`,
        ...(maxHeight && { maxHeight }),
      }}
      role="button"
      tabIndex={0}
      aria-label={`实况照片: ${alt}，${mode === 'hover' ? '悬停播放' : '长按播放'}`}
      aria-pressed={isPlaying}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={mode === "longpress" ? (e) => e.preventDefault() : undefined}
    >
      {/* Static image - use relative positioning to give container height */}
      <img
        ref={refCallback}
        src={imageUrl}
        alt={alt}
        loading="lazy"
        onLoad={onLoad}
        onError={onError}
        className={`w-full h-full ${fitClass} transition-opacity duration-300 ${isPlaying ? "opacity-0" : "opacity-100"
          } ${imageLoaded ? "img-loaded" : "img-loading"}`}
        style={
          blurDataUrl && !imageLoaded
            ? { backgroundImage: `url(${blurDataUrl})`, backgroundSize: "cover" }
            : undefined
        }
      />

      {/* Video layer - absolute overlay */}
      <video
        ref={videoRef}
        src={videoUrl}
        muted={muted}
        playsInline
        loop
        preload="none"
        className={`absolute inset-0 w-full h-full ${fitClass} transition-opacity duration-300 ${isPlaying ? "opacity-100" : "opacity-0"
          }`}
      />

      {/* LIVE badge and sound toggle */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        {/* LIVE badge - changes color when playing */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all ${isPlaying
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
        {/* Sound toggle - only icon changes, not color */}
        {showSoundToggle && onMutedChange && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMutedChange(!muted);
            }}
            className="flex items-center justify-center w-7 h-7 rounded-full text-xs transition-all cursor-pointer bg-black/50 text-white/80 backdrop-blur-sm hover:bg-black/70"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
