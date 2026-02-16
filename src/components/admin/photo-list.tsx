"use client";

import { useState, useMemo } from "react";
import type { Photo } from "@/lib/db/schema";
import { PhotoEditModal } from "./photo-edit-modal";

interface PhotoListProps {
  photos: Photo[];
  onUpdate: () => void;
}

type FilterType = "all" | "upload-date" | "taken-date" | "live-photo" | "camera";

export function PhotoList({ photos, onUpdate }: PhotoListProps) {
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterValue, setFilterValue] = useState("");

  // Get unique filter options
  const filterOptions = useMemo(() => {
    const uploadDates = new Set<string>();
    const takenDates = new Set<string>();
    const cameras = new Set<string>();

    photos.forEach((photo) => {
      uploadDates.add(new Date(photo.createdAt).toLocaleDateString("zh-CN"));
      if (photo.takenAt) {
        takenDates.add(new Date(photo.takenAt).toLocaleDateString("zh-CN"));
      }
      if (photo.cameraModel) {
        cameras.add(photo.cameraModel);
      }
    });

    return {
      uploadDates: Array.from(uploadDates).sort().reverse(),
      takenDates: Array.from(takenDates).sort().reverse(),
      cameras: Array.from(cameras).sort(),
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
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPhotos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPhotos.map((p) => p.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

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

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这张照片吗？此操作不可撤销。")) return;

    setDeleting(id);
    try {
      await fetch(`/api/photos/${id}`, { method: "DELETE" });
      onUpdate();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(null);
    }
  }

  if (photos.length === 0) {
    return (
      <div className="text-center text-neutral-500 py-20">
        <p className="text-lg mb-2">还没有照片</p>
        <p className="text-sm">点击「上传照片」开始添加你的作品</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-neutral-900 rounded-xl border border-neutral-800">
        <span className="text-sm text-neutral-400">筛选:</span>
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value as FilterType);
            setFilterValue("");
          }}
          className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
        >
          <option value="all">全部</option>
          <option value="upload-date">上传日期</option>
          <option value="taken-date">拍摄日期</option>
          <option value="live-photo">照片类型</option>
          <option value="camera">相机型号</option>
        </select>

        {filterType === "upload-date" && filterOptions.uploadDates.length > 0 && (
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
          >
            <option value="">选择日期</option>
            {filterOptions.uploadDates.map((date) => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        )}

        {filterType === "taken-date" && filterOptions.takenDates.length > 0 && (
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
          >
            <option value="">选择日期</option>
            {filterOptions.takenDates.map((date) => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        )}

        {filterType === "live-photo" && (
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
          >
            <option value="">选择类型</option>
            <option value="live">Live Photo</option>
            <option value="static">静态照片</option>
          </select>
        )}

        {filterType === "camera" && filterOptions.cameras.length > 0 && (
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
          >
            <option value="">选择相机</option>
            {filterOptions.cameras.map((camera) => (
              <option key={camera} value={camera}>{camera}</option>
            ))}
          </select>
        )}

        {filterValue && (
          <button
            onClick={() => {
              setFilterType("all");
              setFilterValue("");
            }}
            className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            清除筛选
          </button>
        )}

        <span className="text-sm text-neutral-500 ml-auto">
          显示 {filteredPhotos.length} / {photos.length} 张
        </span>
      </div>

      {/* Selection toolbar */}
      <div className="flex items-center gap-4 p-3 bg-neutral-900/50 rounded-xl border border-neutral-800">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedIds.size === filteredPhotos.length && filteredPhotos.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-white focus:ring-0 focus:ring-offset-0"
          />
          <span className="text-sm text-neutral-400">全选</span>
        </label>

        {selectedIds.size > 0 && (
          <>
            <span className="text-sm text-neutral-300">
              已选择 {selectedIds.size} 张
            </span>
            <button
              onClick={clearSelection}
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              取消选择
            </button>
            <button
              onClick={handleBatchDelete}
              disabled={batchDeleting}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {batchDeleting ? "删除中..." : `删除选中 (${selectedIds.size})`}
            </button>
          </>
        )}
      </div>

      {/* Photo list */}
      {filteredPhotos.map((photo) => (
        <div
          key={photo.id}
          className={`flex gap-4 p-4 bg-neutral-900 rounded-xl border transition-colors ${
            selectedIds.has(photo.id)
              ? "border-white/30 bg-neutral-800/50"
              : "border-neutral-800"
          }`}
        >
          {/* Checkbox */}
          <div className="flex-shrink-0 flex items-center">
            <input
              type="checkbox"
              checked={selectedIds.has(photo.id)}
              onChange={() => toggleSelect(photo.id)}
              className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
          </div>

          {/* Thumbnail */}
          <div className="flex-shrink-0">
            <img
              src={photo.thumbnailUrl}
              alt={photo.title}
              className="w-28 h-28 object-cover rounded-lg cursor-pointer"
              onClick={() => toggleSelect(photo.id)}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white truncate">
              {photo.title || "无标题"}
            </h3>
            {photo.description && (
              <p className="text-sm text-neutral-400 mt-1 line-clamp-2">
                {photo.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
              <span>
                {photo.width} x {photo.height}
              </span>
              {photo.cameraModel && <span>{photo.cameraModel}</span>}
              {photo.isLivePhoto && (
                <span className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400">
                  Live
                </span>
              )}
              <span>
                {new Date(photo.createdAt).toLocaleDateString("zh-CN")}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-start gap-2">
            <button
              onClick={() => setEditingPhoto(photo)}
              className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
            >
              编辑
            </button>
            <button
              onClick={() => handleDelete(photo.id)}
              disabled={deleting === photo.id}
              className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              {deleting === photo.id ? "删除中..." : "删除"}
            </button>
          </div>
        </div>
      ))}

      {/* Edit Modal */}
      <PhotoEditModal
        photo={editingPhoto}
        onClose={() => setEditingPhoto(null)}
        onSave={onUpdate}
      />
    </div>
  );
}
