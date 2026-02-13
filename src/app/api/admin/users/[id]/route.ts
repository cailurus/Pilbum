import { NextRequest, NextResponse } from "next/server";
import { isAdmin, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/password";

// PATCH — update user (admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (body.displayName !== undefined) updates.displayName = body.displayName;
    if (body.role && ["admin", "user"].includes(body.role)) updates.role = body.role;

    // Reset password (admin sets a new one, user must change on next login)
    if (body.password) {
        if (body.password.length < 6) {
            return NextResponse.json(
                { error: "密码至少需要 6 个字符" },
                { status: 400 }
            );
        }
        updates.passwordHash = await hashPassword(body.password);
        updates.mustChangePassword = true;
    }

    const [updated] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, id))
        .returning({
            id: users.id,
            username: users.username,
            role: users.role,
            displayName: users.displayName,
        });

    if (!updated) {
        return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    return NextResponse.json({ user: updated });
}

// DELETE — delete user (admin only, cannot delete self)
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const session = await getSession();

    if (session.userId === id) {
        return NextResponse.json(
            { error: "不能删除自己的账户" },
            { status: 400 }
        );
    }

    const [deleted] = await db
        .delete(users)
        .where(eq(users.id, id))
        .returning({ id: users.id });

    if (!deleted) {
        return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}
