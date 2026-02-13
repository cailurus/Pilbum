"use client";

import { useState } from "react";
import type { Photo } from "@/lib/db/schema";

interface PhotoListProps {
  photos: Photo[];
  onUpdate: () => void;
}

export function PhotoList({ photos, onUpdate }: PhotoListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  if (photos.length === 0) {
    return (
      <div className="text-center text-neutral-500 py-20">
        <p className="text-lg mb-2">还没有照片</p>
        <p className="text-sm">点击「上传照片」开始添加你的作品</p>
      </div>
    );
  }

  function startEdit(photo: Photo) {
    setEditingId(photo.id);
    setEditTitle(photo.title);
    setEditDescription(photo.description || "");
  }

  async function saveEdit(id: string) {
    try {
      await fetch(`/api/photos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });
      setEditingId(null);
      onUpdate();
    } catch (error) {
      console.error("Save failed:", error);
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

  return (
    <div className="space-y-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="flex gap-4 p-4 bg-neutral-900 rounded-xl border border-neutral-800"
        >
          {/* Thumbnail */}
          <div className="flex-shrink-0">
            <img
              src={photo.thumbnailUrl}
              alt={photo.title}
              className="w-28 h-28 object-cover rounded-lg"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {editingId === photo.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="标题"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="描述"
                  rows={2}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(photo.id)}
                    className="px-3 py-1.5 bg-white text-black rounded-md text-sm font-medium hover:bg-neutral-200 transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-md text-sm hover:bg-neutral-700 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Actions */}
          {editingId !== photo.id && (
            <div className="flex-shrink-0 flex items-start gap-2">
              <button
                onClick={() => startEdit(photo)}
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
          )}
        </div>
      ))}
    </div>
  );
}
