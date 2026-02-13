"use client";

import type { Photo } from "@/lib/db/schema";
import { MapDisplay } from "./map-display";

interface ExifPanelProps {
  photo: Photo;
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
      <div className="text-neutral-500 flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <div className="text-xs text-neutral-500 uppercase tracking-wider">
          {label}
        </div>
        <div className="text-sm text-neutral-200 mt-0.5">{value}</div>
      </div>
    </div>
  );
}

// Simple SVG icons
function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function LensIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function ExifPanel({ photo }: ExifPanelProps) {
  const hasExif =
    photo.cameraModel ||
    photo.lensModel ||
    photo.aperture ||
    photo.shutterSpeed ||
    photo.iso ||
    photo.takenAt ||
    photo.latitude;

  if (!hasExif) return null;

  // Build shooting params string
  const params: string[] = [];
  if (photo.focalLength) params.push(`${photo.focalLength}mm`);
  if (photo.aperture) params.push(`f/${photo.aperture}`);
  if (photo.shutterSpeed) params.push(photo.shutterSpeed);
  if (photo.iso) params.push(`ISO ${photo.iso}`);
  const paramsStr = params.join("  ·  ");

  return (
    <div className="border-t border-neutral-800 pt-6">
      <h3 className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
        拍摄信息
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 divide-y divide-neutral-800/50 sm:divide-y-0">
        {/* Camera */}
        {photo.cameraModel && (
          <ExifItem
            icon={<CameraIcon />}
            label="相机"
            value={
              photo.cameraMake
                ? `${photo.cameraMake} ${photo.cameraModel}`
                : photo.cameraModel
            }
          />
        )}

        {/* Lens */}
        {photo.lensModel && (
          <ExifItem
            icon={<LensIcon />}
            label="镜头"
            value={photo.lensModel}
          />
        )}

        {/* Shooting params */}
        {paramsStr && (
          <ExifItem
            icon={<SettingsIcon />}
            label="拍摄参数"
            value={paramsStr}
          />
        )}

        {/* Date */}
        {photo.takenAt && (
          <ExifItem
            icon={<CalendarIcon />}
            label="拍摄时间"
            value={new Date(photo.takenAt).toLocaleString("zh-CN", {
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
      {photo.latitude && photo.longitude && (
        <div className="mt-4 border-t border-neutral-800 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPinIcon />
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              拍摄地点
            </span>
          </div>
          <MapDisplay lat={photo.latitude} lng={photo.longitude} />
        </div>
      )}
    </div>
  );
}
