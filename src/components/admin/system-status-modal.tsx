"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { APP_VERSION } from "@/config/version";

interface SystemInfo {
  version: string;
  database: {
    provider: string;
    config: Record<string, string>;
    size: number;
    sizeFormatted: string;
    records: {
      photos: number;
      users: number;
      settings: number;
    };
  };
  storage: {
    provider: string;
    config: Record<string, string>;
    size: number;
    sizeFormatted: string;
    photoStorageSize: number;
    photoStorageSizeFormatted: string;
  };
  environment: {
    nodeVersion: string;
    platform: string;
    arch: string;
  };
}

interface SystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemStatusModal({ isOpen, onClose }: SystemStatusModalProps) {
  const t = useTranslations("admin");
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "database" | "storage">("overview");

  useEffect(() => {
    if (isOpen) {
      fetchSystemInfo();
    }
  }, [isOpen]);

  const fetchSystemInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/system");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSystemInfo(data);
    } catch (err) {
      setError("无法获取系统信息");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getProviderBadgeColor = (provider: string) => {
    switch (provider) {
      case "local":
        return "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400";
      case "postgres":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
      case "s3":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
      case "azure":
        return "bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400";
      case "supabase":
        return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
      default:
        return "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400";
    }
  };

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case "local":
        return t("local");
      case "postgres":
        return "PostgreSQL";
      case "s3":
        return t("s3Compatible");
      case "azure":
        return t("azure");
      case "supabase":
        return t("supabase");
      default:
        return provider;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8" />
                <path d="M12 17v4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{t("systemStatusTitle")}</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Pilbum v{APP_VERSION}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-fit">
            {(["overview", "database", "storage"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm rounded-md transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                {tab === "overview" ? t("overview") : tab === "database" ? t("database") : t("storage")}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchSystemInfo}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
              >
                重试
              </button>
            </div>
          ) : systemInfo ? (
            <>
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {systemInfo.database.records.photos}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">{t("photoCount")}</div>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {systemInfo.storage.photoStorageSizeFormatted}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">{t("photoStorage")}</div>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {systemInfo.database.records.users}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">{t("userCount")}</div>
                    </div>
                  </div>

                  {/* Storage Overview */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">{t("storageConfig")}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400">
                            <ellipse cx="12" cy="5" rx="9" ry="3" />
                            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                            <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-neutral-900 dark:text-white">{t("database")}</div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            {systemInfo.database.config.type}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getProviderBadgeColor(systemInfo.database.provider)}`}>
                        {getProviderLabel(systemInfo.database.provider)}
                      </span>
                    </div>

                    <div className="my-3 border-t border-neutral-200 dark:border-neutral-700" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600 dark:text-green-400">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-neutral-900 dark:text-white">{t("objectStorage")}</div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            {systemInfo.storage.config.type}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getProviderBadgeColor(systemInfo.storage.provider)}`}>
                        {getProviderLabel(systemInfo.storage.provider)}
                      </span>
                    </div>
                  </div>

                  {/* Environment */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">{t("environment")}</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-neutral-500 dark:text-neutral-400">Node.js</div>

                        <div className="font-mono text-neutral-900 dark:text-white">{systemInfo.environment.nodeVersion}</div>
                      </div>
                      <div>
                        <div className="text-neutral-500 dark:text-neutral-400">{t("platform")}</div>
                        <div className="font-mono text-neutral-900 dark:text-white">{systemInfo.environment.platform}</div>
                      </div>
                      <div>
                        <div className="text-neutral-500 dark:text-neutral-400">{t("architecture")}</div>
                        <div className="font-mono text-neutral-900 dark:text-white">{systemInfo.environment.arch}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Database Tab */}
              {activeTab === "database" && (
                <div className="space-y-6">
                  {/* Provider Info */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-neutral-900 dark:text-white">{t("databaseType")}</h3>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getProviderBadgeColor(systemInfo.database.provider)}`}>
                        {systemInfo.database.config.type}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(systemInfo.database.config).map(([key, value]) => (
                        key !== "type" && (
                          <div key={key} className="flex items-center justify-between text-sm">
                            <span className="text-neutral-500 dark:text-neutral-400 capitalize">{key}</span>
                            <span className="font-mono text-neutral-900 dark:text-white text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded max-w-xs truncate">
                              {value}
                            </span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Database Stats */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-4">{t("database")}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500 dark:text-neutral-400">{t("databaseSize")}</span>
                        <span className="font-mono text-neutral-900 dark:text-white">{systemInfo.database.sizeFormatted}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500 dark:text-neutral-400">{t("photoRecords")}</span>
                        <span className="font-mono text-neutral-900 dark:text-white">{systemInfo.database.records.photos}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500 dark:text-neutral-400">{t("userRecords")}</span>
                        <span className="font-mono text-neutral-900 dark:text-white">{systemInfo.database.records.users}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500 dark:text-neutral-400">{t("settingItems")}</span>
                        <span className="font-mono text-neutral-900 dark:text-white">{systemInfo.database.records.settings}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tips */}
                  {systemInfo.database.provider === "local" && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                      <div className="flex gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 dark:text-amber-400 flex-shrink-0">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <div className="text-sm text-amber-800 dark:text-amber-200">
                          <p className="font-medium">{t("localSqliteNote")}</p>
                          <p className="mt-1 text-amber-600 dark:text-amber-300">
                            {t("localSqliteHint")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Storage Tab */}
              {activeTab === "storage" && (
                <div className="space-y-6">
                  {/* Provider Info */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-neutral-900 dark:text-white">{t("storageType")}</h3>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getProviderBadgeColor(systemInfo.storage.provider)}`}>
                        {systemInfo.storage.config.type}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(systemInfo.storage.config).map(([key, value]) => (
                        key !== "type" && (
                          <div key={key} className="flex items-center justify-between text-sm">
                            <span className="text-neutral-500 dark:text-neutral-400 capitalize">{key}</span>
                            <span className="font-mono text-neutral-900 dark:text-white text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded max-w-xs truncate">
                              {value}
                            </span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Storage Stats */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-4">{t("totalPhotoSize")}</h3>
                    <div className="space-y-3">
                      {systemInfo.storage.provider === "local" && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-500 dark:text-neutral-400">{t("directorySize")}</span>
                          <span className="font-mono text-neutral-900 dark:text-white">{systemInfo.storage.sizeFormatted}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500 dark:text-neutral-400">{t("totalPhotoSize")}</span>
                        <span className="font-mono text-neutral-900 dark:text-white">{systemInfo.storage.photoStorageSizeFormatted}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tips */}
                  {systemInfo.storage.provider === "local" && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                      <div className="flex gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 dark:text-amber-400 flex-shrink-0">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <div className="text-sm text-amber-800 dark:text-amber-200">
                          <p className="font-medium">{t("localStorageNote")}</p>
                          <p className="mt-1 text-amber-600 dark:text-amber-300">
                            {t("localStorageHint")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <button
            onClick={fetchSystemInfo}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? "animate-spin" : ""}>
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            刷新
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg text-sm transition-colors cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
