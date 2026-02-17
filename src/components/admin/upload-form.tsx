"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { isHeicFile } from "@/lib/heic";
import { formatFileSize } from "@/lib/format";

interface UploadFormProps {
  onUploadComplete: () => void;
}

type FileStatus = "pending" | "uploading" | "success" | "error";

interface UploadFile {
  id: string;
  file: File;
  preview: string | null;
  status: FileStatus;
  progress: number; // 0-100
  error?: string;
  videoFile?: File;
}

export function UploadForm({ onUploadComplete }: UploadFormProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [storageConfigured, setStorageConfigured] = useState(true);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("setup");

  // Check if storage is configured
  useEffect(() => {
    fetch("/api/config/storage")
      .then((res) => res.json())
      .then((data) => setStorageConfigured(data.configured))
      .catch(() => setStorageConfigured(true)); // Assume configured on error
  }, []);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const allFiles = Array.from(newFiles);

    // Separate image and video files
    const imageFiles = allFiles.filter(
      (f) => f.type.startsWith("image/") || isHeicFile(f)
    );
    const videoFiles = allFiles.filter(
      (f) => f.type.startsWith("video/") ||
             f.name.toLowerCase().endsWith(".mov") ||
             f.name.toLowerCase().endsWith(".mp4")
    );

    // Helper to get base filename without extension
    const getBaseName = (filename: string) => {
      return filename.replace(/\.[^.]+$/, "").toLowerCase();
    };

    // Create a map of video files by base name for quick lookup
    const videoMap = new Map<string, File>();
    for (const video of videoFiles) {
      const baseName = getBaseName(video.name);
      videoMap.set(baseName, video);
    }

    const uploadFiles: UploadFile[] = imageFiles.map((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      let preview: string | null = null;

      // Only generate preview for non-HEIC browser-displayable images
      if (!isHeicFile(file)) {
        preview = URL.createObjectURL(file);
      }

      // Auto-pair with matching video file (same base name)
      const baseName = getBaseName(file.name);
      const matchingVideo = videoMap.get(baseName);

      return {
        id,
        file,
        preview,
        status: "pending" as FileStatus,
        progress: 0,
        videoFile: matchingVideo, // Auto-attach matching video
      };
    });

    setFiles((prev) => [...prev, ...uploadFiles]);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      addFiles(e.dataTransfer.files);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  }

  function attachVideo(uploadFileId: string, videoFile: File) {
    setFiles((prev) =>
      prev.map((f) => (f.id === uploadFileId ? { ...f, videoFile } : f))
    );
  }

  function removeVideo(uploadFileId: string) {
    setFiles((prev) =>
      prev.map((f) => (f.id === uploadFileId ? { ...f, videoFile: undefined } : f))
    );
  }

  async function uploadSingleFile(uploadFile: UploadFile): Promise<boolean> {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("image", uploadFile.file);
      if (uploadFile.videoFile) {
        formData.append("video", uploadFile.videoFile);
      }

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 90); // 90% for upload, 10% for server processing
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, progress: pct } : f
            )
          );
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? { ...f, status: "success", progress: 100 }
                : f
            )
          );
          resolve(true);
        } else {
          let errorMsg = "上传失败";
          try {
            const resp = JSON.parse(xhr.responseText);
            errorMsg = resp.error || errorMsg;
          } catch { }
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? { ...f, status: "error", error: errorMsg }
                : f
            )
          );
          resolve(false);
        }
      });

      xhr.addEventListener("error", () => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "error", error: "网络错误" }
              : f
          )
        );
        resolve(false);
      });

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    });
  }

  async function handleUpload() {
    // Check storage configuration first
    if (!storageConfigured) {
      setShowStorageModal(true);
      return;
    }

    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setUploading(true);

    // Mark all pending as uploading
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "pending" ? { ...f, status: "uploading" } : f
      )
    );

    let successCount = 0;
    // Upload sequentially to avoid overloading
    for (const file of pendingFiles) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, status: "uploading" } : f
        )
      );
      const ok = await uploadSingleFile(file);
      if (ok) successCount++;
    }

    setUploading(false);

    if (successCount > 0) {
      onUploadComplete();
      // Auto-clear successful files after a short delay
      setTimeout(() => {
        setFiles((prev) => {
          prev.filter((f) => f.status === "success").forEach((f) => {
            if (f.preview) URL.revokeObjectURL(f.preview);
          });
          return prev.filter((f) => f.status !== "success");
        });
      }, 2000);
    }
  }

  function clearAll() {
    files.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
  }

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const successCount = files.filter((f) => f.status === "success").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const totalProgress =
    files.length > 0
      ? Math.round(files.reduce((sum, f) => sum + f.progress, 0) / files.length)
      : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Drop zone */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ${uploading
            ? "border-neutral-300 dark:border-neutral-800 cursor-default opacity-60"
            : dragOver
              ? "border-blue-400 dark:border-white/60 bg-blue-50 dark:bg-white/5 scale-[1.01]"
              : "border-neutral-300 dark:border-neutral-700 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-white/[0.02]"
          }`}
      >
        <div className="text-neutral-500 dark:text-neutral-400 space-y-2">
          <div className="mb-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-neutral-400 dark:text-neutral-500">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
            拖拽照片到这里，或点击选择
          </p>
          <p className="text-sm text-neutral-500">
            支持 JPEG、PNG、HEIC/HEIF · 可同时选择多张
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-2">
            Live Photo: 同时拖入 HEIC 和同名 MOV 文件，会自动配对
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif,video/*,.mov,.mp4"
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {/* Storage not configured modal */}
      {showStorageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {t("storageNotConfigured")}
              </h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              {t("storageNotConfiguredDesc")}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowStorageModal(false)}
                className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                {t("dismiss")}
              </button>
              <Link
                href="/setup/storage"
                className="px-4 py-2 text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
              >
                {t("configureStorage")}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-4">
          {/* Overall progress header */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">
                  总进度
                </span>
                <span className="text-neutral-700 dark:text-neutral-300 tabular-nums">{totalProgress}%</span>
              </div>
              <div className="h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* File cards */}
          <div className="grid gap-3">
            {files.map((f) => (
              <div
                key={f.id}
                className={`group relative flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 ${f.status === "success"
                    ? "border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-950/20"
                    : f.status === "error"
                      ? "border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20"
                      : f.status === "uploading"
                        ? "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50"
                        : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/30 hover:border-neutral-300 dark:hover:border-neutral-700"
                  }`}
              >
                {/* Thumbnail / placeholder */}
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                  {f.preview ? (
                    <img
                      src={f.preview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-400 dark:text-neutral-500">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-neutral-800 dark:text-neutral-200 truncate">
                      {f.file.name}
                    </p>
                    {f.videoFile && (
                      <span className="flex-shrink-0 text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 rounded">
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500">
                    {formatFileSize(f.file.size)}
                    {isHeicFile(f.file) && " · HEIC"}
                  </p>

                  {/* Progress bar per file */}
                  {(f.status === "uploading" || f.status === "success") && (
                    <div className="h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ease-out ${f.status === "success"
                            ? "bg-green-500"
                            : "bg-gradient-to-r from-blue-500 to-cyan-400"
                          }`}
                        style={{ width: `${f.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Error message */}
                  {f.status === "error" && f.error && (
                    <p className="text-xs text-red-500 dark:text-red-400">{f.error}</p>
                  )}
                </div>

                {/* Status indicator / actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {f.status === "pending" && (
                    <>
                      {/* Attach Live Photo video */}
                      <label
                        title="附加 Live Photo 视频"
                        className="p-1.5 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <input
                          type="file"
                          accept="video/quicktime,.mov,video/mp4,.mp4"
                          className="hidden"
                          onChange={(e) => {
                            const video = e.target.files?.[0];
                            if (video) attachVideo(f.id, video);
                          }}
                        />
                      </label>

                      {/* Remove */}
                      <button
                        onClick={() => removeFile(f.id)}
                        className="p-1.5 text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="移除"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </>
                  )}

                  {f.status === "uploading" && (
                    <div className="w-5 h-5 border-2 border-neutral-600 border-t-blue-400 rounded-full animate-spin" />
                  )}

                  {f.status === "success" && (
                    <svg
                      className="w-5 h-5 text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}

                  {f.status === "error" && (
                    <button
                      onClick={() =>
                        setFiles((prev) =>
                          prev.map((pf) =>
                            pf.id === f.id
                              ? { ...pf, status: "pending", progress: 0, error: undefined }
                              : pf
                          )
                        )
                      }
                      className="text-xs px-2 py-1 text-red-400 hover:text-red-300 border border-red-800/50 rounded transition-colors"
                      title="重试"
                    >
                      重试
                    </button>
                  )}
                </div>

                {/* Live Photo video badge with remove */}
                {f.status === "pending" && f.videoFile && (
                  <button
                    onClick={() => removeVideo(f.id)}
                    className="absolute top-1 right-1 text-[10px] px-1 py-0.5 bg-purple-900/60 text-purple-300 rounded hover:bg-red-900/60 hover:text-red-300 transition-colors"
                    title="移除视频"
                  >
                    ✕ {f.videoFile.name}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-neutral-500 space-x-3">
              <span>{files.length} 张照片</span>
              {successCount > 0 && (
                <span className="text-green-500">{successCount} 成功</span>
              )}
              {errorCount > 0 && (
                <span className="text-red-400">{errorCount} 失败</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearAll}
                disabled={uploading}
                className="px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                清空
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || pendingCount === 0}
                className="px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {uploading
                  ? `上传中 (${successCount}/${files.length})`
                  : `上传 ${pendingCount} 张照片`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
