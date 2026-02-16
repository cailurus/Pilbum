import exifr from "exifr";
import sharp from "sharp";

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

// Map exposure program codes to readable names
function getExposureProgram(code: number | undefined): string | undefined {
  if (code === undefined) return undefined;
  const programs: Record<number, string> = {
    0: "未定义",
    1: "手动",
    2: "程序自动",
    3: "光圈优先",
    4: "快门优先",
    5: "创意模式",
    6: "运动模式",
    7: "人像模式",
    8: "风景模式",
  };
  return programs[code] || `未知 (${code})`;
}

// Map metering mode codes to readable names
function getMeteringMode(code: number | undefined): string | undefined {
  if (code === undefined) return undefined;
  const modes: Record<number, string> = {
    0: "未知",
    1: "平均测光",
    2: "中央重点",
    3: "点测光",
    4: "多点测光",
    5: "评价测光",
    6: "局部测光",
    255: "其他",
  };
  return modes[code] || `未知 (${code})`;
}

// Map flash codes to readable names
function getFlashMode(code: number | undefined): string | undefined {
  if (code === undefined) return undefined;
  const fired = (code & 1) !== 0;
  const returnDetected = (code & 6) === 6;
  const mode = (code >> 3) & 3;

  let result = fired ? "已闪光" : "未闪光";
  if (mode === 1) result += " (强制)";
  else if (mode === 2) result += " (禁用)";
  else if (mode === 3) result += " (自动)";
  if (returnDetected) result += " (回光检测)";
  return result;
}

// Map white balance codes to readable names
function getWhiteBalance(code: number | undefined): string | undefined {
  if (code === undefined) return undefined;
  return code === 0 ? "自动" : "手动";
}

// Map color space codes to readable names
function getColorSpace(code: number | undefined): string | undefined {
  if (code === undefined) return undefined;
  const spaces: Record<number, string> = {
    1: "sRGB",
    2: "Adobe RGB",
    65535: "未校准",
  };
  return spaces[code] || `未知 (${code})`;
}

// Map exposure mode codes to readable names
function getExposureMode(code: number | undefined): string | undefined {
  if (code === undefined) return undefined;
  const modes: Record<number, string> = {
    0: "自动曝光",
    1: "手动曝光",
    2: "自动包围曝光",
  };
  return modes[code] || `未知 (${code})`;
}

/**
 * Check if buffer is HEIC/HEIF format by examining magic bytes
 */
function isHeicBuffer(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  const ftyp = buffer.toString("ascii", 4, 8);
  if (ftyp !== "ftyp") return false;
  const brand = buffer.toString("ascii", 8, 12);
  const heicBrands = ["heic", "heix", "hevc", "hevx", "mif1", "msf1"];
  return heicBrands.includes(brand.toLowerCase());
}

/**
 * Extract EXIF from HEIC files using Sharp (since exifr doesn't support HEIC)
 */
async function extractExifFromHeic(buffer: Buffer): Promise<Record<string, unknown> | null> {
  try {
    const metadata = await sharp(buffer).metadata();
    if (!metadata.exif) {
      console.log("HEIC file has no EXIF data in metadata");
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
  } catch (error) {
    console.error("HEIC EXIF extraction failed:", error);
    return null;
  }
}

export async function extractExif(buffer: Buffer): Promise<ExifData> {
  try {
    let data: Record<string, unknown> | null = null;

    // Check if this is a HEIC file - use Sharp for HEIC since exifr doesn't support it
    if (isHeicBuffer(buffer)) {
      console.log("Detected HEIC format, using Sharp for EXIF extraction");
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
      console.log("EXIF extraction returned no data");
      return {};
    }

    // Debug: log available keys for troubleshooting
    console.log("EXIF keys found:", Object.keys(data).join(", "));

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
  } catch (error) {
    console.error("EXIF extraction failed:", error);
    return {};
  }
}
