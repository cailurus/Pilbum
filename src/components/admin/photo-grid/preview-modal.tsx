"use client";

import { useRef, useState, useEffect } from "react";
import type { PreviewModalProps } from "./types";

export function PreviewModal({
  photo,
  onClose,
  playingText,
}: PreviewModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play Live Photo when modal opens
  useEffect(() => {
    if (photo.isLivePhoto && photo.livePhotoVideoUrl && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [photo]);

  const togglePlayback = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white z-10 cursor-pointer"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Photo only */}
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <img
          src={photo.imageUrl || photo.thumbnailUrl}
          alt={photo.title || ""}
          className={`max-w-full max-h-[90vh] object-contain transition-opacity duration-200 ${
            isPlaying ? "opacity-0" : "opacity-100"
          }`}
        />
        {/* Live Photo Video */}
        {photo.isLivePhoto && photo.livePhotoVideoUrl && (
          <video
            ref={videoRef}
            src={photo.livePhotoVideoUrl}
            muted
            playsInline
            loop
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-200 ${
              isPlaying ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        {/* Live Photo badge */}
        {photo.isLivePhoto && photo.livePhotoVideoUrl && (
          <button
            onClick={togglePlayback}
            className={`absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              isPlaying
                ? "bg-red-500 text-white"
                : "bg-black/50 text-white/80 backdrop-blur-sm hover:bg-black/70"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-white animate-pulse" : "bg-yellow-400"}`} />
            {isPlaying ? playingText : "LIVE"}
          </button>
        )}
      </div>
    </div>
  );
}
