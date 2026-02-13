import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const offset = (page - 1) * limit;

  try {
    const [result, countResult] = await Promise.all([
      db
        .select()
        .from(photos)
        .orderBy(desc(photos.sortOrder), desc(photos.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(photos),
    ]);

    const total = Number(countResult[0].count);

    return NextResponse.json({
      photos: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    // Database not initialized yet
    return NextResponse.json({
      photos: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    });
  }
}
