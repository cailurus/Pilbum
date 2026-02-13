import exifr from "exifr";

export interface ExifData {
  cameraMake?: string;
  cameraModel?: string;
  lensModel?: string;
  focalLength?: number;
  aperture?: number;
  shutterSpeed?: string;
  iso?: number;
  takenAt?: Date;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  width?: number;
  height?: number;
}

function formatShutterSpeed(exposureTime: number): string {
  if (exposureTime >= 1) {
    return `${exposureTime}s`;
  }
  const denominator = Math.round(1 / exposureTime);
  return `1/${denominator}s`;
}

export async function extractExif(buffer: Buffer): Promise<ExifData> {
  try {
    const data = await exifr.parse(buffer, {
      pick: [
        "Make",
        "Model",
        "LensModel",
        "LensMake",
        "FocalLength",
        "FNumber",
        "ExposureTime",
        "ISO",
        "ISOSpeedRatings",
        "DateTimeOriginal",
        "CreateDate",
        "GPSLatitude",
        "GPSLongitude",
        "GPSAltitude",
        "ImageWidth",
        "ImageHeight",
        "ExifImageWidth",
        "ExifImageHeight",
      ],
      gps: true,
    });

    if (!data) return {};

    return {
      cameraMake: data.Make?.trim(),
      cameraModel: data.Model?.trim(),
      lensModel: data.LensModel?.trim() || (data.LensMake ? `${data.LensMake}`.trim() : undefined),
      focalLength: data.FocalLength ? Math.round(data.FocalLength) : undefined,
      aperture: data.FNumber,
      shutterSpeed: data.ExposureTime
        ? formatShutterSpeed(data.ExposureTime)
        : undefined,
      iso: data.ISO || data.ISOSpeedRatings,
      takenAt: data.DateTimeOriginal || data.CreateDate || undefined,
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.GPSAltitude,
      width: data.ExifImageWidth || data.ImageWidth,
      height: data.ExifImageHeight || data.ImageHeight,
    };
  } catch (error) {
    console.error("EXIF extraction failed:", error);
    return {};
  }
}
