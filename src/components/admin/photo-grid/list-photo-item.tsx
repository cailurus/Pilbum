"use client";

import { useRef, useState } from "react";
import { formatFileSize } from "@/lib/format";
import type { ListPhotoItemProps } from "./types";

export function ListPhotoItem({
  photo,
  isSelected,
  onSelect,
  onPreview,
  onEdit,
  onDelete,
  onToggleVisibility,
  translations,
  locale,
}: ListPhotoItemProps) {
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

  // Format aperture to avoid floating point issues
  const formatAperture = (aperture: number | null) => {
    if (!aperture) return null;
    return aperture.toFixed(1).replace(/\.0$/, '');
  };

  return (
    <div
      data-photo-id={photo.id}
      className={`rounded-lg transition-colors border select-none ${
        isSelected
          ? "bg-blue-50 dark:bg-neutral-800/50 border-blue-200 dark:border-white/20"
          : "bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
      } ${!photo.isVisible ? "opacity-60" : ""}`}
    >
      <div className="flex gap-3 p-3">
        {/* Checkbox */}
        <div className="flex items-center" data-no-drag>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-blue-600 dark:text-white focus:ring-0 cursor-pointer"
          />
        </div>

        {/* Thumbnail with Live Photo support */}
        <div
          className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer bg-neutral-200 dark:bg-neutral-800"
          onClick={onPreview}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src={photo.thumbnailUrl}
            alt={photo.title || ""}
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              isPlaying ? "opacity-0" : "opacity-100"
            }`}
          />
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
          {photo.isLivePhoto && (
            <div className={`absolute top-1 right-1 px-1 py-0.5 rounded text-[9px] font-medium ${
              isPlaying ? "bg-red-500 text-white" : "bg-black/60 text-white"
            }`}>
              {isPlaying ? "●" : "LIVE"}
            </div>
          )}
        </div>

        {/* Photo details - Compact */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {/* Title row */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-white truncate">
              {photo.title || translations.noTitle}
            </h3>
            {!photo.isVisible && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400">
                {translations.hidden}
              </span>
            )}
          </div>

          {/* Info row - Single line compact with labels */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            <span>{translations.dimensions}: {photo.width}×{photo.height}</span>
            <span>{translations.fileSize}: {formatFileSize(photo.fileSize)}</span>
            {photo.cameraModel && <span>{translations.device}: {photo.cameraModel}</span>}
            {photo.aperture && <span>{translations.aperture}: f/{formatAperture(photo.aperture)}</span>}
            {photo.shutterSpeed && <span>{translations.shutterSpeed}: {photo.shutterSpeed}</span>}
            {photo.iso && <span>{translations.iso}: {photo.iso}</span>}
            {photo.focalLength && <span>{translations.focalLength}: {photo.focalLength}mm</span>}
          </div>

          {/* Location row */}
          {(photo.takenAt || (photo.latitude && photo.longitude)) && (
            <div className="flex flex-wrap items-center gap-x-3 text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
              {photo.takenAt && <span>{new Date(photo.takenAt).toLocaleString(locale)}</span>}
              {photo.latitude && photo.longitude && (
                <span>
                  {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
                  {photo.altitude !== null && photo.altitude !== undefined && ` · ${photo.altitude.toFixed(0)}m`}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleVisibility}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              photo.isVisible
                ? "hover:bg-orange-100 dark:hover:bg-orange-900/30 text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400"
                : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50"
            }`}
            title={photo.isVisible ? translations.hide : translations.show}
          >
            {photo.isVisible ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors cursor-pointer"
            title={translations.edit}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
            title={translations.delete}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
