"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Photo } from "@/lib/db/schema";
import { UploadForm } from "@/components/admin/upload-form";
import { PhotoList } from "@/components/admin/photo-list";
import { UserList } from "@/components/admin/user-list";

interface CurrentUser {
  userId: string;
  username: string;
  role: "admin" | "user";
}

interface DashboardClientProps {
  currentUser: CurrentUser;
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
  const [activeTab, setActiveTab] = useState<"photos" | "upload" | "users">("photos");
  const router = useRouter();

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/photos?limit=100");
      const data = await res.json();
      setPhotos(data.photos);
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
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-light tracking-wide">Pilbum Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs text-neutral-600">
              {currentUser.username}
              {currentUser.role === "admin" && " · 管理员"}
            </span>
            <a
              href="/"
              target="_blank"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              查看站点
            </a>
            <a
              href="/admin/change-password"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              修改密码
            </a>
            <button
              onClick={handleLogout}
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 flex gap-6">
          <button
            onClick={() => setActiveTab("photos")}
            className={`py-3 text-sm border-b-2 transition-colors ${activeTab === "photos"
              ? "border-white text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-300"
              }`}
          >
            照片管理 ({photos.length})
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`py-3 text-sm border-b-2 transition-colors ${activeTab === "upload"
              ? "border-white text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-300"
              }`}
          >
            上传照片
          </button>
          {currentUser.role === "admin" && (
            <button
              onClick={() => setActiveTab("users")}
              className={`py-3 text-sm border-b-2 transition-colors ${activeTab === "users"
                ? "border-white text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-300"
                }`}
            >
              用户管理 ({users.length})
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === "upload" ? (
          <UploadForm
            onUploadComplete={() => {
              setActiveTab("photos");
              fetchPhotos();
            }}
          />
        ) : activeTab === "users" && currentUser.role === "admin" ? (
          <UserList
            users={users}
            currentUserId={currentUser.userId}
            onUpdate={fetchUsers}
          />
        ) : loading ? (
          <div className="text-center text-neutral-500 py-20">加载中...</div>
        ) : (
          <PhotoList photos={photos} onUpdate={fetchPhotos} />
        )}
      </main>
    </div>
  );
}
