"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbReady, setDbReady] = useState<boolean | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [initMessage, setInitMessage] = useState("");
  const router = useRouter();

  // Check DB status on mount
  useEffect(() => {
    fetch("/api/admin/db")
      .then((r) => r.json())
      .then((data) => setDbReady(data.ready))
      .catch(() => setDbReady(false));
  }, []);

  async function handleInitDb() {
    setInitializing(true);
    setInitMessage("");
    try {
      const res = await fetch("/api/admin/db", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setDbReady(true);
        setInitMessage(data.message);
      } else {
        setInitMessage(data.error || "初始化失败");
      }
    } catch {
      setInitMessage("初始化请求失败");
    } finally {
      setInitializing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.mustChangePassword) {
          router.push("/admin/change-password");
        } else {
          router.push("/admin/dashboard");
        }
      } else {
        setError(data.error || "登录失败");
      }
    } catch {
      setError("登录失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="w-full max-w-sm p-8">
        <h1 className="text-2xl font-light text-white mb-8 text-center tracking-wide">
          Pilbum
        </h1>

        {/* DB not initialized */}
        {dbReady === null ? (
          <div className="text-center text-neutral-500">检查数据库状态...</div>
        ) : !dbReady ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
            </div>
            <h2 className="text-lg font-light text-white mb-2">首次使用，需要初始化</h2>
            <p className="text-neutral-500 text-sm mb-6">将创建数据库表结构和默认管理员账户</p>
            <button
              onClick={handleInitDb}
              disabled={initializing}
              className="w-full py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {initializing ? "初始化中..." : "一键初始化"}
            </button>
            {initMessage && (
              <p className={`mt-4 text-sm ${initMessage.includes("成功") ? "text-green-400" : "text-red-400"}`}>
                {initMessage}
              </p>
            )}
          </div>
        ) : (
          /* Login form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="用户名"
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="密码"
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                required
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
