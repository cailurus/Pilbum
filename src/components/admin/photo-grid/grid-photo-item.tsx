"use client";

import { useRef, useState } from "react";
import type { GridPhotoItemProps } from "./types";

export function GridPhotoItem({
  photo,
  isSelected,
  onSelect,
  onPreview,
  onEdit,
  onDelete,
  onToggleVisibility,
  translations,
}: GridPhotoItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMouseEnter = () => {
    if (photo.isLivePhoto && photo.livePhotoVideoUrl && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div
      data-photo-id={photo.id}
      className={`relative aspect-square group cursor-pointer select-none ${
        isSelected ? "ring-2 ring-blue-500 ring-inset" : ""
      } ${!photo.isVisible ? "opacity-50" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onPreview}
    >
      {/* Static image */}
      <img
        src={photo.thumbnailUrl}
        alt={photo.title || ""}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          isPlaying ? "opacity-0" : "opacity-100"
        }`}
        loading="lazy"
      />

      {/* Live Photo video */}
      {photo.isLivePhoto && photo.livePhotoVideoUrl && (
        <video
          ref={videoRef}
          src={photo.livePhotoVideoUrl}
          muted
          playsInline
          loop
          preload="none"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
            isPlaying ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Selection checkbox - always clickable */}
      <button
        className={`absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center transition-all z-10 ${
          isSelected
            ? "bg-white"
            : "bg-black/50 opacity-0 group-hover:opacity-100 hover:bg-black/70"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(e);
        }}
      >
        {isSelected ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        )}
      </button>

      {/* Badges row */}
      <div className="absolute top-1 right-1 flex items-center gap-1">
        {/* Hidden badge */}
        {!photo.isVisible && (
          <div className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-800/80 text-neutral-300">
            {translations.hidden}
          </div>
        )}
        {/* Live Photo badge */}
        {photo.isLivePhoto && (
          <div className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
            isPlaying ? "bg-red-500 text-white" : "bg-black/60 text-white"
          }`}>
            {isPlaying ? "● LIVE" : "LIVE"}
          </div>
        )}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />

      {/* Action buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className={`p-1.5 rounded text-white transition-colors cursor-pointer ${
            photo.isVisible ? "bg-black/70 hover:bg-orange-600" : "bg-orange-600 hover:bg-orange-500"
          }`}
          title={photo.isVisible ? translations.hide : translations.show}
        >
          {photo.isVisible ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1.5 bg-black/70 hover:bg-blue-600 rounded text-white transition-colors cursor-pointer"
          title={translations.edit}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 bg-black/70 hover:bg-red-600 rounded text-white transition-colors cursor-pointer"
          title={translations.delete}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
