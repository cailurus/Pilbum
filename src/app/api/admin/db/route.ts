import { NextResponse } from "next/server";
import { checkSchema, initSchema } from "@/lib/db/migrate";

// GET — check database status (no auth required, so login page can check too)
export async function GET() {
    const status = await checkSchema();
    return NextResponse.json(status);
}

// POST — initialize database schema
// No auth required IF database is not yet initialized (chicken-and-egg: can't login without users table).
// Once initialized, this endpoint becomes a no-op (IF NOT EXISTS + seed check).
export async function POST() {
    const status = await checkSchema();
    if (status.ready) {
        return NextResponse.json({ success: true, message: "数据库已初始化，无需重复操作" });
    }

    try {
        await initSchema();
        return NextResponse.json({ success: true, message: "数据库初始化成功，默认管理员账户：admin / admin" });
    } catch (error) {
        console.error("Database init failed:", error);
        return NextResponse.json(
            { error: "数据库初始化失败", detail: String(error) },
            { status: 500 }
        );
    }
}
