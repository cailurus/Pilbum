import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";
import { getStorage } from "@/lib/storage";
import { photoUpdateSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photo = await db
    .select()
    .from(photos)
    .where(eq(photos.id, id))
    .limit(1);

  if (photo.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(
    { photo: photo[0] },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Validate request body
  const parsed = photoUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };

  // Content fields
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.sortOrder !== undefined) updates.sortOrder = parsed.data.sortOrder;
  if (parsed.data.isVisible !== undefined) updates.isVisible = parsed.data.isVisible;

  // EXIF fields (from request body directly)
  const exifFields = [
    "cameraMake", "cameraModel", "lensModel", "lensMake",
    "focalLength", "aperture", "shutterSpeed", "iso",
    "takenAt", "latitude", "longitude", "altitude"
  ] as const;
  const parsedData = parsed.data as Record<string, unknown>;
  for (const field of exifFields) {
    if (parsedData[field] !== undefined) {
      updates[field] = parsedData[field];
    }
  }

  await db
    .update(photos)
    .set(updates)
    .where(eq(photos.id, id));

  // Fetch the updated record
  const [updated] = await db
    .select()
    .from(photos)
    .where(eq(photos.id, id))
    .limit(1);

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ photo: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Get photo to delete storage files
  const [photo] = await db
    .select()
    .from(photos)
    .where(eq(photos.id, id))
    .limit(1);

  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const storage = getStorage();

  // Delete storage files
  await Promise.all([
    storage.delete(`photos/${id}/full.jpg`),
    storage.delete(`photos/${id}/thumb.jpg`),
    photo.livePhotoVideoUrl
      ? storage.delete(`photos/${id}/live.mov`)
      : Promise.resolve(),
  ]);

  // Delete from database
  await db.delete(photos).where(eq(photos.id, id));

  return NextResponse.json({ success: true });
}
