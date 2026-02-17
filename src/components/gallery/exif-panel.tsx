"use client";

import type { Photo } from "@/lib/db/schema";
import { MapDisplay } from "./map-display";
import { displayConfig } from "@/config/display.config";
import { formatFileSize } from "@/lib/format";

interface ExifTranslations {
  camera: string;
  lens: string;
  shootingParams: string;
  takenAt: string;
  location: string;
  shootingInfo: string;
  fileInfo: string;
  dimensions: string;
  fileSize: string;
  uploadedAt: string;
  type: string;
  originalFilename: string;
  altitude: string;
  meters: string;
}

interface ExifPanelProps {
  photo: Photo;
  translations: ExifTranslations;
  locale: string;
}

function ExifItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="text-neutral-400 dark:text-neutral-500 flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <div className="text-xs text-neutral-500 dark:text-neutral-500 uppercase tracking-wider">
          {label}
        </div>
        <div className="text-sm text-neutral-700 dark:text-neutral-200 mt-0.5">{value}</div>
      </div>
    </div>
  );
}

// Modern minimal SVG icons
function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <circle cx="12" cy="13" r="4" />
      <path d="M2 10h2" />
    </svg>
  );
}

function LensIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function ApertureIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
      <line x1="9.69" y1="8" x2="21.17" y2="8" />
      <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
      <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
      <line x1="14.31" y1="16" x2="2.83" y2="16" />
      <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21c-4-4-8-7.5-8-12a8 8 0 1 1 16 0c0 4.5-4 8-8 12z" />
      <circle cx="12" cy="9" r="3" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7l-5-5z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 16l5-5 4 4 5-5 4 4" />
      <circle cx="8" cy="8" r="1.5" />
    </svg>
  );
}

function CloudUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />
      <path d="M12 13v6" />
      <path d="M9 16l3-3 3 3" />
    </svg>
  );
}

function LivePhotoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

function MountainIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3l4 8 5-5 5 10H2L8 3z" />
    </svg>
  );
}

export function ExifPanel({ photo, translations: t, locale }: ExifPanelProps) {
  const { exif, fileInfo } = displayConfig;

  // Check if any EXIF info should be shown
  const hasExif =
    (exif.camera && photo.cameraModel) ||
    (exif.lens && photo.lensModel) ||
    (exif.shootingParams && (photo.aperture || photo.shutterSpeed || photo.iso || photo.focalLength)) ||
    (exif.takenDate && photo.takenAt) ||
    (exif.gpsMap && photo.latitude && photo.longitude);

  // Check if any file info should be shown
  const hasFileInfo =
    (fileInfo.dimensions && photo.width && photo.height) ||
    (fileInfo.fileSize && photo.fileSize) ||
    (fileInfo.uploadDate && photo.createdAt) ||
    (fileInfo.livePhotoIndicator && photo.isLivePhoto) ||
    (fileInfo.originalFilename && photo.originalFilename) ||
    (fileInfo.altitude && photo.altitude);

  // Build shooting params string
  const params: string[] = [];
  if (photo.focalLength) params.push(`${photo.focalLength}mm`);
  if (photo.aperture) params.push(`f/${photo.aperture}`);
  if (photo.shutterSpeed) params.push(photo.shutterSpeed);
  if (photo.iso) params.push(`ISO ${photo.iso}`);
  const paramsStr = params.join("  ·  ");

  // EXIF info section
  const exifSection = hasExif && (
    <>
      <h3 className="text-xs text-neutral-500 dark:text-neutral-500 uppercase tracking-wider mb-2">
        {t.shootingInfo}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 divide-y divide-neutral-200 dark:divide-neutral-800/50 sm:divide-y-0">
        {/* Camera */}
        {exif.camera && photo.cameraModel && (
          <ExifItem
            icon={<CameraIcon />}
            label={t.camera}
            value={
              photo.cameraMake
                ? `${photo.cameraMake} ${photo.cameraModel}`
                : photo.cameraModel
            }
          />
        )}

        {/* Lens */}
        {exif.lens && photo.lensModel && (
          <ExifItem
            icon={<LensIcon />}
            label={t.lens}
            value={photo.lensModel}
          />
        )}

        {/* Shooting params */}
        {exif.shootingParams && paramsStr && (
          <ExifItem
            icon={<ApertureIcon />}
            label={t.shootingParams}
            value={paramsStr}
          />
        )}

        {/* Date */}
        {exif.takenDate && photo.takenAt && (
          <ExifItem
            icon={<CalendarIcon />}
            label={t.takenAt}
            value={new Date(photo.takenAt).toLocaleString(locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
        )}
      </div>

      {/* GPS Map */}
      {exif.gpsMap && photo.latitude && photo.longitude && (
        <div className="mt-4 border-t border-neutral-200 dark:border-neutral-800 pt-4">
          <div className="flex items-center gap-2 mb-3 text-neutral-400 dark:text-neutral-500">
            <MapPinIcon />
            <span className="text-xs text-neutral-500 dark:text-neutral-500 uppercase tracking-wider">
              {t.location}
            </span>
          </div>
          <MapDisplay lat={photo.latitude} lng={photo.longitude} />
        </div>
      )}
    </>
  );

  // File info section
  const fileInfoSection = hasFileInfo && (
    <div className={hasExif ? "border-t border-neutral-200 dark:border-neutral-800 pt-6 mt-6" : ""}>
      <h3 className="text-xs text-neutral-500 dark:text-neutral-500 uppercase tracking-wider mb-2">
        {t.fileInfo}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 divide-y divide-neutral-200 dark:divide-neutral-800/50 sm:divide-y-0">
        {/* Dimensions */}
        {fileInfo.dimensions && photo.width && photo.height && (
          <ExifItem
            icon={<ImageIcon />}
            label={t.dimensions}
            value={`${photo.width} × ${photo.height}`}
          />
        )}

        {/* File size */}
        {fileInfo.fileSize && photo.fileSize && (
          <ExifItem
            icon={<FileIcon />}
            label={t.fileSize}
            value={formatFileSize(photo.fileSize)}
          />
        )}

        {/* Upload date */}
        {fileInfo.uploadDate && (
          <ExifItem
            icon={<CloudUpIcon />}
            label={t.uploadedAt}
            value={new Date(photo.createdAt).toLocaleString(locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
        )}

        {/* Live Photo indicator */}
        {fileInfo.livePhotoIndicator && photo.isLivePhoto && (
          <ExifItem
            icon={<LivePhotoIcon />}
            label={t.type}
            value="Live Photo"
          />
        )}

        {/* Original filename */}
        {fileInfo.originalFilename && photo.originalFilename && (
          <ExifItem
            icon={<FileIcon />}
            label={t.originalFilename}
            value={photo.originalFilename}
          />
        )}

        {/* Altitude */}
        {fileInfo.altitude && photo.altitude && (
          <ExifItem
            icon={<MountainIcon />}
            label={t.altitude}
            value={`${photo.altitude.toFixed(1)} ${t.meters}`}
          />
        )}
      </div>
    </div>
  );

  if (!hasExif && !hasFileInfo) return null;

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
      {exifSection}
      {fileInfoSection}
    </div>
  );
}
