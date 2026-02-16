import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";
import { extractExif } from "@/lib/exif";

/**
 * POST - Recover photos from filesystem
 * Scans the uploads directory and recreates database records
 */
export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const uploadsPath = path.join(process.cwd(), "public", "uploads", "photos");

  if (!fs.existsSync(uploadsPath)) {
    return NextResponse.json({ error: "No uploads directory found" }, { status: 404 });
  }

  const photoDirs = fs.readdirSync(uploadsPath).filter((dir) => {
    const fullPath = path.join(uploadsPath, dir);
    return fs.statSync(fullPath).isDirectory();
  });

  const recovered: string[] = [];
  const errors: string[] = [];

  for (const photoId of photoDirs) {
    const photoDir = path.join(uploadsPath, photoId);
    const fullPath = path.join(photoDir, "full.jpg");
    const thumbPath = path.join(photoDir, "thumb.jpg");

    // Check if this photo already exists in DB
    try {
      const existing = await db.select().from(photos).where(
        eq(photos.id, photoId)
      ).limit(1);

      if (existing.length > 0) {
        continue; // Skip existing
      }
    } catch {
      // Table might not exist yet, continue
    }

    if (!fs.existsSync(fullPath)) {
      errors.push(`${photoId}: full.jpg not found`);
      continue;
    }

    try {
      // Read image metadata
      const imageBuffer = fs.readFileSync(fullPath);
      const metadata = await sharp(imageBuffer).metadata();

      // Extract EXIF if possible
      let exifData: Awaited<ReturnType<typeof extractExif>> = {};
      try {
        exifData = await extractExif(imageBuffer);
      } catch {
        // Ignore EXIF errors
      }

      // Check for live photo video
      const liveVideoPath = path.join(photoDir, "live.mov");
      const hasLiveVideo = fs.existsSync(liveVideoPath);

      // Get file stats
      const stats = fs.statSync(fullPath);

      // Insert into database
      const now = new Date().toISOString();
      await db.insert(photos).values({
        id: photoId,
        title: "",
        description: "",
        imageUrl: `/uploads/photos/${photoId}/full.jpg`,
        thumbnailUrl: `/uploads/photos/${photoId}/thumb.jpg`,
        width: metadata.width || 0,
        height: metadata.height || 0,
        isLivePhoto: hasLiveVideo,
        livePhotoVideoUrl: hasLiveVideo ? `/uploads/photos/${photoId}/live.mov` : null,
        // Camera info
        cameraMake: exifData.cameraMake || null,
        cameraModel: exifData.cameraModel || null,
        lensModel: exifData.lensModel || null,
        lensMake: exifData.lensMake || null,
        software: exifData.software || null,
        // Shooting parameters
        focalLength: exifData.focalLength || null,
        focalLength35mm: exifData.focalLength35mm || null,
        aperture: exifData.aperture || null,
        shutterSpeed: exifData.shutterSpeed || null,
        exposureTime: exifData.exposureTime || null,
        iso: exifData.iso || null,
        exposureBias: exifData.exposureBias || null,
        exposureProgram: exifData.exposureProgram || null,
        exposureMode: exifData.exposureMode || null,
        meteringMode: exifData.meteringMode || null,
        flash: exifData.flash || null,
        whiteBalance: exifData.whiteBalance || null,
        // Image info
        colorSpace: exifData.colorSpace || null,
        orientation: exifData.orientation || null,
        takenAt: exifData.takenAt ? exifData.takenAt.toISOString() : null,
        // GPS
        latitude: exifData.latitude || null,
        longitude: exifData.longitude || null,
        altitude: exifData.altitude || null,
        // File info
        fileSize: stats.size,
        mimeType: "image/jpeg",
        originalFilename: null,
        // Timestamps
        createdAt: now,
        updatedAt: now,
      });

      recovered.push(photoId);
    } catch (error) {
      errors.push(`${photoId}: ${String(error)}`);
    }
  }

  return NextResponse.json({
    success: true,
    recovered: recovered.length,
    errors: errors.length,
    details: {
      recovered,
      errors,
    },
  });
}
