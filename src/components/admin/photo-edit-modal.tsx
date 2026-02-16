"use client";

import { useState, useEffect } from "react";
import type { Photo } from "@/lib/db/schema";

interface PhotoEditModalProps {
  photo: Photo | null;
  onClose: () => void;
  onSave: () => void;
}

type TabType = "content" | "exif" | "location";

export function PhotoEditModal({ photo, onClose, onSave }: PhotoEditModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("content");
  const [saving, setSaving] = useState(false);

  // Content fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // EXIF fields
  const [cameraMake, setCameraMake] = useState("");
  const [cameraModel, setCameraModel] = useState("");
  const [lensModel, setLensModel] = useState("");
  const [lensMake, setLensMake] = useState("");
  const [focalLength, setFocalLength] = useState("");
  const [aperture, setAperture] = useState("");
  const [shutterSpeed, setShutterSpeed] = useState("");
  const [iso, setIso] = useState("");
  const [takenAt, setTakenAt] = useState("");

  // Location fields
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [altitude, setAltitude] = useState("");

  useEffect(() => {
    if (photo) {
      // Content
      setTitle(photo.title || "");
      setDescription(photo.description || "");

      // EXIF
      setCameraMake(photo.cameraMake || "");
      setCameraModel(photo.cameraModel || "");
      setLensModel(photo.lensModel || "");
      setLensMake(photo.lensMake || "");
      setFocalLength(photo.focalLength?.toString() || "");
      setAperture(photo.aperture?.toString() || "");
      setShutterSpeed(photo.shutterSpeed || "");
      setIso(photo.iso?.toString() || "");
      setTakenAt(photo.takenAt ? new Date(photo.takenAt).toISOString().slice(0, 16) : "");

      // Location
      setLatitude(photo.latitude?.toString() || "");
      setLongitude(photo.longitude?.toString() || "");
      setAltitude(photo.altitude?.toString() || "");

      // Reset to content tab
      setActiveTab("content");
    }
  }, [photo]);

  if (!photo) return null;

  async function handleSave() {
    if (!photo) return;
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {
        title,
        description,
        cameraMake: cameraMake || null,
        cameraModel: cameraModel || null,
        lensModel: lensModel || null,
        lensMake: lensMake || null,
        focalLength: focalLength ? parseFloat(focalLength) : null,
        aperture: aperture ? parseFloat(aperture) : null,
        shutterSpeed: shutterSpeed || null,
        iso: iso ? parseInt(iso) : null,
        takenAt: takenAt ? new Date(takenAt).toISOString() : null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        altitude: altitude ? parseFloat(altitude) : null,
      };

      const res = await fetch(`/api/photos/${photo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        onSave();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "保存失败");
      }
    } catch (error) {
      console.error("Save failed:", error);
      alert("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-medium text-neutral-900 dark:text-white">编辑照片信息</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 px-6">
          <button
            onClick={() => setActiveTab("content")}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              activeTab === "content"
                ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            内容
          </button>
          <button
            onClick={() => setActiveTab("exif")}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              activeTab === "exif"
                ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            拍摄参数
          </button>
          <button
            onClick={() => setActiveTab("location")}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              activeTab === "location"
                ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            时间与位置
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex gap-6">
            {/* Preview */}
            <div className="flex-shrink-0">
              <img
                src={photo.thumbnailUrl}
                alt={photo.title || ""}
                className="w-32 h-32 object-cover rounded-lg"
              />
              <div className="mt-2 text-xs text-neutral-500 text-center">
                {photo.width} × {photo.height}
                {photo.isLivePhoto && (
                  <span className="ml-1 px-1 py-0.5 bg-amber-100 dark:bg-yellow-500/20 text-amber-600 dark:text-yellow-500 rounded text-[10px]">
                    LIVE
                  </span>
                )}
              </div>
            </div>

            {/* Form */}
            <div className="flex-1 space-y-4">
              {/* Content Tab */}
              {activeTab === "content" && (
                <>
                  <div>
                    <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">标题</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="为照片添加一个标题..."
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                      描述
                      <span className="ml-2 text-xs text-neutral-400 dark:text-neutral-500">(将在前端照片详情页展示)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="为照片添加描述或文案..."
                      rows={6}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors resize-none"
                    />
                  </div>
                </>
              )}

              {/* EXIF Tab */}
              {activeTab === "exif" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">相机品牌</label>
                      <input
                        type="text"
                        value={cameraMake}
                        onChange={(e) => setCameraMake(e.target.value)}
                        placeholder="如: Apple, Canon, Sony"
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">相机型号</label>
                      <input
                        type="text"
                        value={cameraModel}
                        onChange={(e) => setCameraModel(e.target.value)}
                        placeholder="如: iPhone 15 Pro, EOS R5"
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">镜头品牌</label>
                      <input
                        type="text"
                        value={lensMake}
                        onChange={(e) => setLensMake(e.target.value)}
                        placeholder="如: Apple, Canon, Sigma"
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">镜头型号</label>
                      <input
                        type="text"
                        value={lensModel}
                        onChange={(e) => setLensModel(e.target.value)}
                        placeholder="如: RF 24-70mm F2.8 L IS USM"
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">焦距 (mm)</label>
                      <input
                        type="number"
                        value={focalLength}
                        onChange={(e) => setFocalLength(e.target.value)}
                        placeholder="24"
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">光圈 (f/)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={aperture}
                        onChange={(e) => setAperture(e.target.value)}
                        placeholder="2.8"
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">快门速度</label>
                      <input
                        type="text"
                        value={shutterSpeed}
                        onChange={(e) => setShutterSpeed(e.target.value)}
                        placeholder="1/125s"
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">ISO</label>
                      <input
                        type="number"
                        value={iso}
                        onChange={(e) => setIso(e.target.value)}
                        placeholder="100"
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Location Tab */}
              {activeTab === "location" && (
                <>
                  <div>
                    <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">拍摄时间</label>
                    <input
                      type="datetime-local"
                      value={takenAt}
                      onChange={(e) => setTakenAt(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">纬度</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="31.2304"
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">经度</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="121.4737"
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">海拔 (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={altitude}
                        onChange={(e) => setAltitude(e.target.value)}
                        placeholder="4"
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    提示：纬度范围 -90 到 90，经度范围 -180 到 180。正数表示北纬和东经。
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
