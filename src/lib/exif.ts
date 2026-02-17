import exifr from "exifr";
import sharp from "sharp";
import { isHeicBuffer } from "./heic";

export interface ExifData {
  // Camera info
  cameraMake?: string;
  cameraModel?: string;
  lensModel?: string;
  lensMake?: string;

  // Shooting parameters
  focalLength?: number;
  focalLength35mm?: number;
  aperture?: number;
  shutterSpeed?: string;
  exposureTime?: number;
  iso?: number;
  exposureBias?: number;
  exposureProgram?: string;
  exposureMode?: string;
  meteringMode?: string;
  flash?: string;
  whiteBalance?: string;

  // Image info
  colorSpace?: string;
  orientation?: number;
  software?: string;

  // Date & Location
  takenAt?: Date;
  latitude?: number;
  longitude?: number;
  altitude?: number;

  // Dimensions
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

// Map exposure program codes to readable names (English identifiers for i18n)
function getExposureProgram(code: number | undefined): string | undefined {
  if (code === undefined) return undefined;
  const programs: Record<number, string> = {
    0: "Not Defined",
    1: "Manual",
    2: "Program AE",
    3: "Aperture Priority",
    4: "Shutter Priority",
    5: "Creative",
    6: "Action",
    7: "Portrait",
    8: "Landscape",
  };
  return programs[code] || `Unknown (${code})`;
}

// Map metering mode codes to readable names
function getMeteringMode(code: number | undefined): string | undefined {
  if (code === undefined) return undefined;
  const modes: Record<number, string> = {
    0: "Unknown",
    1: "Average",
    2: "Center-Weighted",
    3: "Spot",
    4: "Multi-Spot",
    5: "Evaluative",
    6: "Partial",
    255: "Other",
  };
  return modes[code] || `Unknown (${code})`;
}

// Map flash codes to readable names
function getFlashMode(code: number | undefined): string | undefined {
  if (code === undefined) return undefined;
  const fired = (code & 1) !== 0;
  const returnDetected = (code & 6) === 6;
  const mode = (code >> 3) & 3;

  let result = fired ? "Fired" : "No Flash";
  if (mode === 1) result += " (Forced)";
  else if (mode === 2) result += " (Suppressed)";
  else if (mode === 3) result += " (Auto)";
  if (returnDetected) result += " (Return Detected)";
  return result;
}

// Map white balance codes to readable names
function getWhiteBalance(code: number | undefined): string | undefined {
  if (code === undefined) return undefined;
  return code === 0 ? "Auto" : "Manual";
}

// Map color space codes to readable names
function getColorSpace(code: number | undefined): string | undefined {
  if (code === undefined) return undefined;
  const spaces: Record<number, string> = {
    1: "sRGB",
    2: "Adobe RGB",
    65535: "Uncalibrated",
  };
  return spaces[code] || `Unknown (${code})`;
}

// Map exposure mode codes to readable names
function getExposureMode(code: number | undefined): string | undefined {
  if (code === undefined) return undefined;
  const modes: Record<number, string> = {
    0: "Auto",
    1: "Manual",
    2: "Auto Bracket",
  };
  return modes[code] || `Unknown (${code})`;
}

/**
 * Extract EXIF from HEIC files using Sharp (since exifr doesn't support HEIC)
 */
async function extractExifFromHeic(buffer: Buffer): Promise<Record<string, unknown> | null> {
  try {
    const metadata = await sharp(buffer).metadata();
    if (!metadata.exif) {
      return null;
    }

    // Sharp's EXIF buffer starts with "Exif\0\0" header (6 bytes)
    // exifr expects raw TIFF data, so we need to skip the header
    let exifBuffer = metadata.exif;
    if (exifBuffer.slice(0, 4).toString("ascii") === "Exif") {
      exifBuffer = exifBuffer.slice(6);
    }

    // Parse the TIFF data with exifr
    // Don't use translateValues to keep numeric codes as numbers
    const data = await exifr.parse(exifBuffer, {
      tiff: true,
      xmp: true,
      gps: true,
      translateKeys: true,
      translateValues: false,
      reviveValues: true,
    });

    return data;
  } catch {
    return null;
  }
}

export async function extractExif(buffer: Buffer): Promise<ExifData> {
  try {
    let data: Record<string, unknown> | null = null;

    // Check if this is a HEIC file - use Sharp for HEIC since exifr doesn't support it
    if (isHeicBuffer(buffer)) {
      data = await extractExifFromHeic(buffer);
    } else {
      // For JPEG and other formats, use exifr directly
      // Don't use translateValues to keep numeric codes as numbers
      data = await exifr.parse(buffer, {
        tiff: true,
        xmp: true,
        icc: true,
        iptc: true,
        gps: true,
        translateKeys: true,
        translateValues: false,
        reviveValues: true,
      });
    }

    if (!data) {
      return {};
    }

    return {
      // Camera info - try multiple possible field names
      cameraMake: (data.Make as string)?.toString().trim(),
      cameraModel: (data.Model as string)?.toString().trim(),
      lensModel: ((data.LensModel || data.LensInfo || data.Lens) as string)?.toString().trim(),
      lensMake: (data.LensMake as string)?.toString().trim(),
      software: (data.Software as string)?.toString().trim(),

      // Shooting parameters
      focalLength: data.FocalLength ? Math.round(Number(data.FocalLength)) : undefined,
      focalLength35mm: data.FocalLengthIn35mmFormat
        ? Math.round(Number(data.FocalLengthIn35mmFormat))
        : undefined,
      aperture: data.FNumber || data.ApertureValue ? Math.round(Number(data.FNumber || data.ApertureValue) * 100) / 100 : undefined,
      exposureTime: data.ExposureTime ? Number(data.ExposureTime) : undefined,
      shutterSpeed: data.ExposureTime
        ? formatShutterSpeed(Number(data.ExposureTime))
        : undefined,
      iso: Number(data.ISO || data.ISOSpeedRatings) || undefined,
      exposureBias: data.ExposureBiasValue !== undefined ? Number(data.ExposureBiasValue) : undefined,
      exposureProgram: getExposureProgram(data.ExposureProgram as number),
      exposureMode: getExposureMode(data.ExposureMode as number),
      meteringMode: getMeteringMode(data.MeteringMode as number),
      flash: getFlashMode(data.Flash as number),
      whiteBalance: getWhiteBalance(data.WhiteBalance as number),

      // Image info
      colorSpace: getColorSpace(data.ColorSpace as number),
      orientation: data.Orientation ? Number(data.Orientation) : undefined,

      // Date & Location
      takenAt: (data.DateTimeOriginal || data.CreateDate || data.ModifyDate) as Date | undefined,
      latitude: (data.latitude ?? data.GPSLatitude) as number | undefined,
      longitude: (data.longitude ?? data.GPSLongitude) as number | undefined,
      altitude: data.GPSAltitude ? Number(data.GPSAltitude) : undefined,

      // Dimensions
      width: Number(data.ExifImageWidth || data.ImageWidth || data.PixelXDimension) || undefined,
      height: Number(data.ExifImageHeight || data.ImageHeight || data.PixelYDimension) || undefined,
    };
  } catch {
    return {};
  }
}
