import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/password";
import { desc, eq } from "drizzle-orm";
import { createUserSchema } from "@/lib/validators";
import { randomUUID } from "crypto";

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

    const body = await request.json();

    // Validate request body with Zod schema
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0].message },
            { status: 400 }
        );
    }

    const { username, password, role, displayName } = parsed.data;

    try {
        const passwordHash = await hashPassword(password);
        const id = randomUUID();
        const now = new Date().toISOString();

        await db.insert(users).values({
            id,
            username,
            passwordHash,
            role: role || "user",
            displayName: displayName || "",
            mustChangePassword: true, // New users must change password on first login
            createdAt: now,
            updatedAt: now,
        });

        // Fetch the created user
        const [user] = await db
            .select({
                id: users.id,
                username: users.username,
                role: users.role,
                displayName: users.displayName,
            })
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

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
