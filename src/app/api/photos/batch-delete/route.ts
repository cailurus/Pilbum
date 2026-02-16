import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";
import { getStorage } from "@/lib/storage";
import { z } from "zod";

const batchDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "至少选择一张照片").max(100, "一次最多删除100张"),
});

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Validate request body
  const parsed = batchDeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { ids } = parsed.data;

  // Get photos to delete storage files
  const photosToDelete = await db
    .select()
    .from(photos)
    .where(inArray(photos.id, ids));

  if (photosToDelete.length === 0) {
    return NextResponse.json({ error: "没有找到要删除的照片" }, { status: 404 });
  }

  const storage = getStorage();

  // Delete storage files for all photos
  const deletePromises = photosToDelete.flatMap((photo) => [
    storage.delete(`photos/${photo.id}/full.jpg`),
    storage.delete(`photos/${photo.id}/thumb.jpg`),
    photo.livePhotoVideoUrl
      ? storage.delete(`photos/${photo.id}/live.mov`)
      : Promise.resolve(),
  ]);

  await Promise.all(deletePromises);

  // Delete from database
  await db.delete(photos).where(inArray(photos.id, ids));

  return NextResponse.json({
    success: true,
    deleted: photosToDelete.length,
  });
}
