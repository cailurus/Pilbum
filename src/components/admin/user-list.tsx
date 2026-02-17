"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface UserInfo {
    id: string;
    username: string;
    role: string;
    displayName: string | null;
    mustChangePassword: boolean;
    createdAt: string;
}

interface UserListProps {
    users: UserInfo[];
    currentUserId: string;
    onUpdate: () => void;
}

export function UserList({ users, currentUserId, onUpdate }: UserListProps) {
    const t = useTranslations();
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newRole, setNewRole] = useState("user");
    const [newDisplayName, setNewDisplayName] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");
    const [resettingId, setResettingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setCreating(true);
        setError("");

        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: newUsername,
                    password: newPassword,
                    role: newRole,
                    displayName: newDisplayName,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setShowAddForm(false);
                setNewUsername("");
                setNewPassword("");
                setNewRole("user");
                setNewDisplayName("");
                onUpdate();
            } else {
                setError(data.error || t("common.error"));
            }
        } catch {
            setError(t("common.error"));
        } finally {
            setCreating(false);
        }
    }

    async function handleResetPassword(userId: string) {
        const newPwd = prompt(t("admin.resetPasswordPrompt"));
        if (!newPwd) return;
        if (newPwd.length < 6) {
            alert(t("admin.passwordTooShort"));
            return;
        }

        setResettingId(userId);
        try {
            await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: newPwd }),
            });
            onUpdate();
        } catch {
            alert(t("admin.resetPasswordFailed"));
        } finally {
            setResettingId(null);
        }
    }

    async function handleToggleRole(userId: string, currentRole: string) {
        const newRole = currentRole === "admin" ? "user" : "admin";
        try {
            await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });
            onUpdate();
        } catch {
            alert(t("admin.changeRoleFailed"));
        }
    }

    async function handleDelete(userId: string, username: string) {
        if (!confirm(t("admin.deleteConfirmUser", { username }))) return;

        setDeletingId(userId);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (res.ok) {
                onUpdate();
            } else {
                alert(data.error || t("admin.deleteFailed"));
            }
        } catch {
            alert(t("admin.deleteFailed"));
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header with add user button */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-neutral-900 dark:text-white">{t("admin.userList")}</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                    {showAddForm ? t("common.cancel") : t("admin.addUser")}
                </button>
            </div>

            {/* Add user form */}
            {showAddForm && (
                <form
                    onSubmit={handleCreate}
                    className="p-6 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4 max-w-lg"
                >
                    <h3 className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">{t("admin.newUser")}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder={t("auth.username")}
                            className="px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                            required
                        />
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder={t("admin.passwordMinLength")}
                            className="px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                            required
                            minLength={6}
                        />
                        <input
                            type="text"
                            value={newDisplayName}
                            onChange={(e) => setNewDisplayName(e.target.value)}
                            placeholder={t("admin.displayNameOptional")}
                            className="px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                        />
                        <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                        >
                            <option value="user">{t("admin.normalUser")}</option>
                            <option value="admin">{t("admin.admin")}</option>
                        </select>
                    </div>
                    {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={creating}
                        className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {creating ? t("admin.creating") : t("admin.create")}
                    </button>
                </form>
            )}

            {/* User list */}
            <div className="space-y-3">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
                    >
                        <div className="flex items-center gap-4">
                            {/* Avatar - consistent user icon */}
                            <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-neutral-900 dark:text-white font-medium text-sm">
                                        {user.displayName || user.username}
                                    </span>
                                    <span
                                        className={`px-2 py-0.5 rounded text-xs ${user.role === "admin"
                                                ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400"
                                                : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                                            }`}
                                    >
                                        {user.role === "admin" ? t("admin.admin") : t("admin.user")}
                                    </span>
                                    {user.mustChangePassword && (
                                        <span className="px-2 py-0.5 rounded text-xs bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
                                            {t("admin.pendingPasswordChange")}
                                        </span>
                                    )}
                                    {user.id === currentUserId && (
                                        <span className="text-xs text-neutral-400 dark:text-neutral-600">{t("admin.current")}</span>
                                    )}
                                </div>
                                <div className="text-xs text-neutral-500 mt-0.5">
                                    @{user.username} · {t("admin.createdOn")}{" "}
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* Actions (can't modify self except via change-password) */}
                        {user.id !== currentUserId && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleToggleRole(user.id, user.role)}
                                    className="px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                    {user.role === "admin" ? t("admin.demoteToUser") : t("admin.promoteToAdmin")}
                                </button>
                                <button
                                    onClick={() => handleResetPassword(user.id)}
                                    disabled={resettingId === user.id}
                                    className="px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {t("admin.resetPassword")}
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id, user.username)}
                                    disabled={deletingId === user.id}
                                    className="px-3 py-1.5 text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {deletingId === user.id ? t("common.deleting") : t("common.delete")}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
