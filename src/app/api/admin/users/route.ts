import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/password";
import { desc } from "drizzle-orm";

// GET — list all users (admin only)
export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await db
        .select({
            id: users.id,
            username: users.username,
            role: users.role,
            displayName: users.displayName,
            mustChangePassword: users.mustChangePassword,
            createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt));

    return NextResponse.json({ users: result });
}

// POST — create a new user (admin only)
export async function POST(request: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { username, password, role, displayName } = await request.json();

    if (!username || !password) {
        return NextResponse.json(
            { error: "用户名和密码不能为空" },
            { status: 400 }
        );
    }

    if (password.length < 6) {
        return NextResponse.json(
            { error: "密码至少需要 6 个字符" },
            { status: 400 }
        );
    }

    if (role && !["admin", "user"].includes(role)) {
        return NextResponse.json(
            { error: "角色只能是 admin 或 user" },
            { status: 400 }
        );
    }

    try {
        const passwordHash = await hashPassword(password);
        const [user] = await db
            .insert(users)
            .values({
                username,
                passwordHash,
                role: role || "user",
                displayName: displayName || "",
                mustChangePassword: true, // New users must change password on first login
            })
            .returning({
                id: users.id,
                username: users.username,
                role: users.role,
                displayName: users.displayName,
            });

        return NextResponse.json({ user }, { status: 201 });
    } catch (error: unknown) {
        const msg = String(error);
        if (msg.includes("unique") || msg.includes("duplicate")) {
            return NextResponse.json(
                { error: "用户名已存在" },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: "创建用户失败" },
            { status: 500 }
        );
    }
}
