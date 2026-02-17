import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { desc, sql, eq } from "drizzle-orm";
import { photoQuerySchema } from "@/lib/validators";
import { isAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Validate query params
  const parsed = photoQuerySchema.safeParse({
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "20",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { page, limit } = parsed.data;
  const offset = (page - 1) * limit;

  // Check if admin request (authenticated) - show all photos
  // Otherwise show only visible photos
  const isAdmin = await isAuthenticated();

  try {
    const baseQuery = isAdmin
      ? db.select().from(photos)
      : db.select().from(photos).where(eq(photos.isVisible, true));

    const baseCountQuery = isAdmin
      ? db.select({ count: sql<number>`count(*)` }).from(photos)
      : db.select({ count: sql<number>`count(*)` }).from(photos).where(eq(photos.isVisible, true));

    const [result, countResult] = await Promise.all([
      baseQuery
        .orderBy(desc(photos.sortOrder), desc(photos.createdAt))
        .limit(limit)
        .offset(offset),
      baseCountQuery,
    ]);

    const total = Number(countResult[0].count);

    return NextResponse.json(
      {
        photos: result,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        headers: {
          'Cache-Control': isAdmin ? 'no-store' : 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch {
    // Database not initialized yet
    return NextResponse.json({
      photos: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    });
  }
}
