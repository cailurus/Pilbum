import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
            { error: "新密码至少需要 6 个字符" },
            { status: 400 }
        );
    }

    // Get user from DB
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

    if (!user) {
        return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // Verify current password (skip check if mustChangePassword is true — first login)
    if (!user.mustChangePassword) {
        if (!currentPassword) {
            return NextResponse.json(
                { error: "请输入当前密码" },
                { status: 400 }
            );
        }
        const valid = await verifyPassword(currentPassword, user.passwordHash);
        if (!valid) {
            return NextResponse.json(
                { error: "当前密码错误" },
                { status: 401 }
            );
        }
    }

    // Update password
    const newHash = await hashPassword(newPassword);
    await db
        .update(users)
        .set({
            passwordHash: newHash,
            mustChangePassword: false,
            updatedAt: new Date(),
        })
        .where(eq(users.id, session.userId));

    // Update session
    session.mustChangePassword = false;
    await session.save();

    return NextResponse.json({ success: true });
}
