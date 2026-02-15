import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/password";
import { changePasswordSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0].message },
            { status: 400 }
        );
    }

    const { currentPassword, newPassword } = parsed.data;

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
