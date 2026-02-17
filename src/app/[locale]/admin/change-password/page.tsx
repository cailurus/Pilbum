"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isFirstLogin, setIsFirstLogin] = useState<boolean | null>(null);
    const router = useRouter();
    const t = useTranslations();

    // Check if this is a forced password change
    useEffect(() => {
        fetch("/api/auth/me")
            .then((r) => r.json())
            .then((data) => setIsFirstLogin(data.mustChangePassword === true))
            .catch(() => router.push("/admin/login"));
    }, [router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (newPassword.length < 6) {
            setError(t("auth.newPasswordMinLength"));
            return;
        }

        if (newPassword !== confirmPassword) {
            setError(t("auth.passwordMismatch"));
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();
            if (res.ok) {
                router.push("/admin/dashboard");
            } else {
                setError(data.error || t("editPhoto.saveFailed"));
            }
        } catch {
            setError(t("auth.loginFailed"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 transition-colors px-4">
            <div className="w-full max-w-sm p-8 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/50 rounded-2xl shadow-sm">
                <h1 className="text-2xl font-medium text-neutral-900 dark:text-white mb-2 text-center tracking-wide">
                    {t("auth.changePassword")}
                </h1>
                {isFirstLogin && (
                    <p className="text-neutral-500 text-sm text-center mb-8">
                        {t("auth.firstLoginChangePassword")}
                    </p>
                )}
                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    {!isFirstLogin && (
                        <div>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder={t("auth.currentPassword")}
                                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder={t("auth.newPassword")}
                            className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
                            required
                            minLength={6}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={t("auth.confirmPassword")}
                            className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
                            required
                        />
                    </div>
                    {error && (
                        <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? t("auth.saving") : t("auth.confirmChange")}
                    </button>
                </form>
            </div>
        </div>
    );
}
