import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { extractExif } from "@/lib/exif";
import { processImage } from "@/lib/image";
import { getStorage } from "@/lib/storage";
import { db } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { v4 as uuidv4 } from "uuid";
import { uploadLogger } from "@/lib/logger";
import { uploadLimiter, getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting
  const ip = getClientIp(request.headers);
  const rateLimit = await checkRateLimit(uploadLimiter, ip);
  if (rateLimit && !rateLimit.success) {
    return rateLimitResponse(rateLimit.reset);
  }

  let imageFile: File | null = null;

  try {
    const start = Date.now();
    const formData = await request.formData();
    imageFile = formData.get("image") as File | null;
    const videoFile = formData.get("video") as File | null;
    const title = (formData.get("title") as string) || "";
    const description = (formData.get("description") as string) || "";

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    const storage = getStorage();
    const photoId = uuidv4();
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

    uploadLogger.info({ filename: imageFile.name, size: imageBuffer.length }, 'Starting upload');

    // Extract EXIF before processing (processing may strip it)
    const exif = await extractExif(imageBuffer);

    // Process image: generate full, thumbnail, blur
    const processed = await processImage(imageBuffer);

    // Upload full image
    const fullKey = `photos/${photoId}/full.jpg`;
    const imageUrl = await storage.upload(
      fullKey,
      processed.fullBuffer,
      "image/jpeg"
    );

    // Upload thumbnail
    const thumbKey = `photos/${photoId}/thumb.jpg`;
    const thumbnailUrl = await storage.upload(
      thumbKey,
      processed.thumbnailBuffer,
      "image/jpeg"
    );

    // Handle Live Photo video
    let livePhotoVideoUrl: string | null = null;
    if (videoFile) {
      const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
      const videoKey = `photos/${photoId}/live.mov`;
      livePhotoVideoUrl = await storage.upload(
        videoKey,
        videoBuffer,
        "video/quicktime"
      );
    }

    // Insert into database
    const [photo] = await db
      .insert(photos)
      .values({
        id: photoId,
        title,
        description,
        imageUrl,
        thumbnailUrl,
        blurDataUrl: processed.blurDataUrl,
        width: processed.width,
        height: processed.height,
        isLivePhoto: !!videoFile,
        livePhotoVideoUrl,
        cameraMake: exif.cameraMake,
        cameraModel: exif.cameraModel,
        lensModel: exif.lensModel,
        focalLength: exif.focalLength,
        aperture: exif.aperture,
        shutterSpeed: exif.shutterSpeed,
        iso: exif.iso,
        takenAt: exif.takenAt,
        latitude: exif.latitude,
        longitude: exif.longitude,
        altitude: exif.altitude,
        originalFilename: imageFile.name,
        fileSize: imageBuffer.length,
        mimeType: imageFile.type,
      })
      .returning();

    uploadLogger.info({ photoId, duration: Date.now() - start }, 'Upload complete');

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    uploadLogger.error({ error, filename: imageFile?.name }, 'Upload failed');
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
