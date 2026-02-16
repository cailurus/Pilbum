"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { Photo } from "@/lib/db/schema";
import { PhotoEditModal } from "./photo-edit-modal";

// Grid item component with Live Photo support
function GridPhotoItem({
  photo,
  isSelected,
  onSelect,
  onPreview,
  onEdit,
  onDelete,
}: {
  photo: Photo;
  isSelected: boolean;
  onSelect: (e?: React.MouseEvent) => void;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
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
      className={`relative aspect-square group cursor-pointer ${
        isSelected ? "ring-2 ring-white ring-inset" : ""
      }`}
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

      {/* Live Photo badge */}
      {photo.isLivePhoto && (
        <div className={`absolute top-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
          isPlaying ? "bg-red-500 text-white" : "bg-black/60 text-white"
        }`}>
          {isPlaying ? "● LIVE" : "LIVE"}
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />

      {/* Action buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1.5 bg-black/70 hover:bg-blue-600 rounded text-white transition-colors cursor-pointer"
          title="编辑"
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
          title="删除"
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

// List item component with Live Photo support
function ListPhotoItem({
  photo,
  isSelected,
  onSelect,
  onPreview,
  onEdit,
  onDelete,
}: {
  photo: Photo;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
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
      className={`rounded-lg transition-colors border ${
        isSelected
          ? "bg-blue-50 dark:bg-neutral-800/50 border-blue-200 dark:border-white/20"
          : "bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
      }`}
    >
      <div className="flex gap-3 p-3">
        {/* Checkbox */}
        <div className="flex items-center">
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
              {photo.title || "无标题"}
            </h3>
          </div>

          {/* Info row - Single line compact with labels */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            <span>尺寸: {photo.width}×{photo.height}</span>
            <span>大小: {formatFileSize(photo.fileSize)}</span>
            {photo.cameraModel && <span>设备: {photo.cameraModel}</span>}
            {photo.aperture && <span>光圈: f/{formatAperture(photo.aperture)}</span>}
            {photo.shutterSpeed && <span>快门: {photo.shutterSpeed}</span>}
            {photo.iso && <span>ISO: {photo.iso}</span>}
            {photo.focalLength && <span>焦距: {photo.focalLength}mm</span>}
          </div>

          {/* Location row */}
          {(photo.takenAt || (photo.latitude && photo.longitude)) && (
            <div className="flex flex-wrap items-center gap-x-3 text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
              {photo.takenAt && <span>{new Date(photo.takenAt).toLocaleString("zh-CN")}</span>}
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
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors cursor-pointer"
            title="编辑"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
            title="删除"
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

// Preview modal - simple photo preview only
function PreviewModal({
  photo,
  onClose,
}: {
  photo: Photo;
  onClose: () => void;
}) {
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
            {isPlaying ? "播放中" : "LIVE"}
          </button>
        )}
      </div>
    </div>
  );
}

interface PhotoGridProps {
  photos: Photo[];
  onUpdate: () => void;
}

type FilterType = "all" | "upload-date" | "taken-date" | "live-photo" | "camera";
type ViewMode = "grid" | "list";
type GridSize = "small" | "medium" | "large";

// Grid size configurations
const gridSizeConfig = {
  small: "grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10",
  medium: "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6",
  large: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4",
};

// Format file size
function formatFileSize(bytes: number | null): string {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Helper to safely read from localStorage
function getStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function PhotoGrid({ photos, onUpdate }: PhotoGridProps) {
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterValue, setFilterValue] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>(() => getStoredValue("photoGridViewMode", "grid"));
  const [gridSize, setGridSize] = useState<GridSize>(() => getStoredValue("photoGridSize", "medium"));
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);

  // Persist view mode and grid size to localStorage
  useEffect(() => {
    localStorage.setItem("photoGridViewMode", JSON.stringify(viewMode));
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem("photoGridSize", JSON.stringify(gridSize));
  }, [gridSize]);

  // Get unique filter options
  const filterOptions = useMemo(() => {
    const uploadDates = new Map<string, number>();
    const takenDates = new Map<string, number>();
    const cameras = new Map<string, number>();

    photos.forEach((photo) => {
      const uploadDate = new Date(photo.createdAt).toLocaleDateString("zh-CN");
      uploadDates.set(uploadDate, (uploadDates.get(uploadDate) || 0) + 1);

      if (photo.takenAt) {
        const takenDate = new Date(photo.takenAt).toLocaleDateString("zh-CN");
        takenDates.set(takenDate, (takenDates.get(takenDate) || 0) + 1);
      }
      if (photo.cameraModel) {
        cameras.set(photo.cameraModel, (cameras.get(photo.cameraModel) || 0) + 1);
      }
    });

    return {
      uploadDates: Array.from(uploadDates.entries()).sort((a, b) => b[0].localeCompare(a[0])),
      takenDates: Array.from(takenDates.entries()).sort((a, b) => b[0].localeCompare(a[0])),
      cameras: Array.from(cameras.entries()).sort((a, b) => a[0].localeCompare(b[0])),
      livePhotoCount: photos.filter(p => p.isLivePhoto).length,
      staticPhotoCount: photos.filter(p => !p.isLivePhoto).length,
    };
  }, [photos]);

  // Filter photos
  const filteredPhotos = useMemo(() => {
    if (filterType === "all" || !filterValue) return photos;

    return photos.filter((photo) => {
      switch (filterType) {
        case "upload-date":
          return new Date(photo.createdAt).toLocaleDateString("zh-CN") === filterValue;
        case "taken-date":
          return photo.takenAt && new Date(photo.takenAt).toLocaleDateString("zh-CN") === filterValue;
        case "live-photo":
          return filterValue === "live" ? photo.isLivePhoto : !photo.isLivePhoto;
        case "camera":
          return photo.cameraModel === filterValue;
        default:
          return true;
      }
    });
  }, [photos, filterType, filterValue]);

  // Selection handlers
  const toggleSelect = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPhotos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPhotos.map((p) => p.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  // Batch delete
  async function handleBatchDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 张照片吗？此操作不可撤销。`)) return;

    setBatchDeleting(true);
    try {
      const res = await fetch("/api/photos/batch-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (res.ok) {
        setSelectedIds(new Set());
        onUpdate();
      } else {
        const data = await res.json();
        alert(data.error || "删除失败");
      }
    } catch (error) {
      console.error("Batch delete failed:", error);
      alert("删除失败，请重试");
    } finally {
      setBatchDeleting(false);
    }
  }

  // Single delete
  async function handleDelete(id: string) {
    if (!confirm("确定要删除这张照片吗？此操作不可撤销。")) return;

    try {
      await fetch(`/api/photos/${id}`, { method: "DELETE" });
      onUpdate();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  }

  if (photos.length === 0) {
    return (
      <div className="text-center text-neutral-500 py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-400 dark:text-neutral-600">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <p className="text-lg mb-2">还没有照片</p>
        <p className="text-sm">点击「上传照片」开始添加你的作品</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Selection controls */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.size === filteredPhotos.length && filteredPhotos.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-blue-600 dark:text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {selectedIds.size > 0 ? `已选 ${selectedIds.size}` : "全选"}
            </span>
          </label>

          {selectedIds.size > 0 && (
            <>
              <button
                onClick={clearSelection}
                className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={batchDeleting}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {batchDeleting ? "删除中..." : "删除"}
              </button>
            </>
          )}

          <div className="flex-1" />

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as FilterType);
              setFilterValue("");
            }}
            className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none"
          >
            <option value="all">全部 ({photos.length})</option>
            <option value="upload-date">按上传日期</option>
            <option value="taken-date">按拍摄日期</option>
            <option value="live-photo">按类型</option>
            <option value="camera">按相机</option>
          </select>

          {filterType === "upload-date" && (
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none"
            >
              <option value="">选择日期</option>
              {filterOptions.uploadDates.map(([date, count]) => (
                <option key={date} value={date}>{date} ({count})</option>
              ))}
            </select>
          )}

          {filterType === "taken-date" && (
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none"
            >
              <option value="">选择日期</option>
              {filterOptions.takenDates.map(([date, count]) => (
                <option key={date} value={date}>{date} ({count})</option>
              ))}
            </select>
          )}

          {filterType === "live-photo" && (
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none"
            >
              <option value="">选择类型</option>
              <option value="live">Live Photo ({filterOptions.livePhotoCount})</option>
              <option value="static">静态照片 ({filterOptions.staticPhotoCount})</option>
            </select>
          )}

          {filterType === "camera" && (
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none"
            >
              <option value="">选择相机</option>
              {filterOptions.cameras.map(([camera, count]) => (
                <option key={camera} value={camera}>{camera} ({count})</option>
              ))}
            </select>
          )}

          {filterValue && (
            <button
              onClick={() => {
                setFilterType("all");
                setFilterValue("");
              }}
              className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
            >
              清除
            </button>
          )}

          {/* Grid size control (only in grid mode) */}
          {viewMode === "grid" && (
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400 dark:text-neutral-500">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              <input
                type="range"
                min="0"
                max="2"
                value={gridSize === "small" ? 0 : gridSize === "medium" ? 1 : 2}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setGridSize(val === 0 ? "small" : val === 1 ? "medium" : "large");
                }}
                className="w-20 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-neutral-900 dark:accent-white"
              />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400 dark:text-neutral-500">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </div>
          )}

          {/* View mode toggle */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-colors cursor-pointer ${viewMode === "grid" ? "bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"}`}
              title="网格视图"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-colors cursor-pointer ${viewMode === "list" ? "bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"}`}
              title="列表视图"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>

          {/* Filter status - inline */}
          {filterValue && (
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              · 显示 {filteredPhotos.length} 张
            </span>
          )}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className={`grid ${gridSizeConfig[gridSize]} gap-1`}>
          {filteredPhotos.map((photo) => (
            <GridPhotoItem
              key={photo.id}
              photo={photo}
              isSelected={selectedIds.has(photo.id)}
              onSelect={(e) => toggleSelect(photo.id, e)}
              onPreview={() => setPreviewPhoto(photo)}
              onEdit={() => setEditingPhoto(photo)}
              onDelete={() => handleDelete(photo.id)}
            />
          ))}
        </div>
      ) : (
        /* List View - Compact with Live Photo support */
        <div className="space-y-2">
          {filteredPhotos.map((photo) => (
            <ListPhotoItem
              key={photo.id}
              photo={photo}
              isSelected={selectedIds.has(photo.id)}
              onSelect={() => toggleSelect(photo.id)}
              onPreview={() => setPreviewPhoto(photo)}
              onEdit={() => setEditingPhoto(photo)}
              onDelete={() => handleDelete(photo.id)}
            />
          ))}
        </div>
      )}

      {/* Preview Modal - photo only */}
      {previewPhoto && (
        <PreviewModal
          photo={previewPhoto}
          onClose={() => setPreviewPhoto(null)}
        />
      )}

      {/* Edit Modal */}
      <PhotoEditModal
        photo={editingPhoto}
        onClose={() => setEditingPhoto(null)}
        onSave={onUpdate}
      />
    </div>
  );
}
