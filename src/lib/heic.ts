/**
 * HEIC/HEIF format detection utilities.
 */

/**
 * Detect if a buffer is HEIC/HEIF format by checking magic bytes.
 * HEIC files have 'ftyp' at offset 4 and a HEIC brand after that.
 */
export function isHeicBuffer(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  const ftyp = buffer.toString("ascii", 4, 8);
  if (ftyp !== "ftyp") return false;
  const brand = buffer.toString("ascii", 8, 12);
  const heicBrands = ["heic", "heix", "hevc", "hevx", "mif1", "msf1"];
  return heicBrands.includes(brand.toLowerCase());
}

/**
 * Detect if a File is HEIC/HEIF format by checking file extension and MIME type.
 */
export function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".heic") ||
    name.endsWith(".heif") ||
    file.type === "image/heic" ||
    file.type === "image/heif"
  );
}
