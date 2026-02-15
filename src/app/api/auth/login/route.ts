import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate input
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { username, password } = parsed.data;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    const session = await getSession();
    session.isLoggedIn = true;
    session.userId = user.id;
    session.username = user.username;
    session.role = user.role as "admin" | "user";
    session.mustChangePassword = user.mustChangePassword;
    await session.save();

    return NextResponse.json({
      success: true,
      mustChangePassword: user.mustChangePassword,
      role: user.role,
    });
  } catch {
    // Database not ready (users table doesn't exist)
    return NextResponse.json(
      { error: "数据库尚未初始化" },
      { status: 503 }
    );
  }
}
