"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Photo } from "@/lib/db/schema";
import { UploadForm } from "@/components/admin/upload-form";
import { PhotoGrid } from "@/components/admin/photo-grid";
import { UserList } from "@/components/admin/user-list";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/config/site.config";

interface CurrentUser {
  userId: string;
  username: string;
  role: "admin" | "user";
}

interface DashboardClientProps {
  currentUser: CurrentUser;
}

// Settings dropdown component
function SettingsDropdown({
  recovering,
  onRecover,
}: {
  recovering: boolean;
  onRecover: () => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
        title="设置"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg py-2 z-50">
          {/* Theme toggle */}
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">主题</span>
            <ThemeToggle />
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-800 my-1" />

          {/* Recover photos */}
          <button
            onClick={() => {
              onRecover();
              setOpen(false);
            }}
            disabled={recovering}
            className="w-full px-3 py-2 text-left text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            {recovering ? "恢复中..." : "恢复照片"}
          </button>

          {/* Change password */}
          <a
            href="/admin/change-password"
            className="block px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            修改密码
          </a>
        </div>
      )}
    </div>
  );
}

export function DashboardClient({ currentUser }: DashboardClientProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [users, setUsers] = useState<Array<{
    id: string;
    username: string;
    role: string;
    displayName: string | null;
    mustChangePassword: boolean;
    createdAt: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);
  const [activeTab, setActiveTab] = useState<"photos" | "upload" | "users">("photos");
  const router = useRouter();

  // Persist tab state in URL hash
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash === "upload" || hash === "users" || hash === "photos") {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (tab: "photos" | "upload" | "users") => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  // Recover photos from filesystem
  const recoverPhotos = async () => {
    if (!confirm("尝试从文件系统恢复照片？这将扫描上传目录并重建数据库记录。")) return;

    setRecovering(true);
    try {
      const res = await fetch("/api/admin/recover-photos", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        alert(`恢复完成！\n成功恢复: ${data.recovered} 张照片\n失败: ${data.errors} 个`);
        await fetchPhotos();
      } else {
        alert(data.error || "恢复失败");
      }
    } catch (error) {
      console.error("Recovery failed:", error);
      alert("恢复失败，请重试");
    } finally {
      setRecovering(false);
    }
  };

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/photos?limit=100&_t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch (error) {
      console.error("Failed to fetch photos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    if (currentUser.role !== "admin") return;
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) setUsers(data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, [currentUser.role]);

  useEffect(() => {
    fetchPhotos();
    fetchUsers();
  }, [fetchPhotos, fetchUsers]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors">
      {/* Floating Header - consistent width across all pages */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/50 dark:border-neutral-800/50 rounded-2xl shadow-sm">
        <div className="px-5 py-3 flex items-center justify-between">
          <h1 className="text-lg font-medium tracking-wide text-neutral-900 dark:text-white">
            {siteConfig.name} <span className="text-neutral-500 dark:text-neutral-400 font-normal">Admin</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 mr-2">
              {currentUser.username}
              {currentUser.role === "admin" && " · 管理员"}
            </span>

            {/* View site - icon only */}
            <a
              href="/"
              target="_blank"
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              title="查看站点"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>

            {/* Settings dropdown */}
            <SettingsDropdown recovering={recovering} onRecover={recoverPhotos} />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              title="退出登录"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Content area with tabs - consistent width with header */}
      <main className="w-[calc(100%-2rem)] max-w-6xl mx-auto pt-24 pb-8">
        {/* Tabs - in content area */}
        <div className="mb-6">
          <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl w-fit">
            <button
              onClick={() => handleTabChange("photos")}
              className={`px-4 py-2 text-sm rounded-lg transition-all cursor-pointer ${activeTab === "photos"
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
            >
              照片管理 ({photos.length})
            </button>
            <button
              onClick={() => handleTabChange("upload")}
              className={`px-4 py-2 text-sm rounded-lg transition-all cursor-pointer ${activeTab === "upload"
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
            >
              上传照片
            </button>
            {currentUser.role === "admin" && (
              <button
                onClick={() => handleTabChange("users")}
                className={`px-4 py-2 text-sm rounded-lg transition-all cursor-pointer ${activeTab === "users"
                  ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  }`}
              >
                用户管理 ({users.length})
              </button>
            )}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "upload" ? (
          <UploadForm
            onUploadComplete={() => {
              setTimeout(async () => {
                await fetchPhotos();
                handleTabChange("photos");
              }, 500);
            }}
          />
        ) : activeTab === "users" && currentUser.role === "admin" ? (
          <UserList
            users={users}
            currentUserId={currentUser.userId}
            onUpdate={fetchUsers}
          />
        ) : loading ? (
          <div className="text-center text-neutral-500 dark:text-neutral-500 py-20">加载中...</div>
        ) : (
          <PhotoGrid photos={photos} onUpdate={fetchPhotos} />
        )}
      </main>
    </div>
  );
}
