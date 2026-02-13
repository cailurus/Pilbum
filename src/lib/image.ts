import sharp from "sharp";
import convert from "heic-convert";

interface ProcessedImage {
  fullBuffer: Buffer;
  thumbnailBuffer: Buffer;
  blurDataUrl: string;
  width: number;
  height: number;
  format: string;
}

const FULL_MAX_WIDTH = 2400;
const THUMBNAIL_MAX_WIDTH = 800;
const BLUR_WIDTH = 32;

/**
 * Detect if a buffer is HEIC/HEIF format by checking magic bytes.
 * HEIC files have 'ftyp' at offset 4 and a HEIC brand after that.
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
 * Convert HEIC/HEIF buffer to JPEG. Returns the original buffer if not HEIC.
 */
async function ensureJpegBuffer(inputBuffer: Buffer): Promise<Buffer> {
  if (!isHeicBuffer(inputBuffer)) return inputBuffer;

  console.log("Detected HEIC format, converting to JPEG...");
  const result = await convert({
    buffer: inputBuffer,
    format: "JPEG",
    quality: 0.95,
  });
  return Buffer.from(result);
}

export async function processImage(
  inputBuffer: Buffer
): Promise<ProcessedImage> {
  // Convert HEIC → JPEG if needed
  const jpegBuffer = await ensureJpegBuffer(inputBuffer);

  const image = sharp(jpegBuffer);
  const metadata = await image.metadata();

  const width = metadata.width || 0;
  const height = metadata.height || 0;

  // Full-size: resize if larger than max, convert to JPEG
  const fullImage = sharp(jpegBuffer)
    .rotate() // Auto-rotate based on EXIF orientation
    .resize(FULL_MAX_WIDTH, undefined, {
      withoutEnlargement: true,
      fit: "inside",
    })
    .jpeg({ quality: 85, progressive: true });

  const fullBuffer = await fullImage.toBuffer();
  const fullMeta = await sharp(fullBuffer).metadata();

  // Thumbnail
  const thumbnailBuffer = await sharp(jpegBuffer)
    .rotate()
    .resize(THUMBNAIL_MAX_WIDTH, undefined, {
      withoutEnlargement: true,
      fit: "inside",
    })
    .jpeg({ quality: 75, progressive: true })
    .toBuffer();

  // Blur placeholder (tiny base64)
  const blurBuffer = await sharp(jpegBuffer)
    .rotate()
    .resize(BLUR_WIDTH, undefined, { fit: "inside" })
    .jpeg({ quality: 50 })
    .toBuffer();

  const blurDataUrl = `data:image/jpeg;base64,${blurBuffer.toString("base64")}`;

  return {
    fullBuffer,
    thumbnailBuffer,
    blurDataUrl,
    width: fullMeta.width || width,
    height: fullMeta.height || height,
    format: "jpeg",
  };
}
