// src/lib/config-check.ts

/**
 * Check if database is configured for cloud deployment
 * Returns true if DATABASE_URL is set (cloud) or DATABASE_PROVIDER is "local"
 */
export function isDatabaseConfigured(): boolean {
  const provider = process.env.DATABASE_PROVIDER;
  if (provider === "local") return true;
  return !!process.env.DATABASE_URL;
}

/**
 * Check if object storage is configured for cloud deployment
 * Returns true if cloud storage is configured or STORAGE_PROVIDER is "local"
 */
export function isStorageConfigured(): boolean {
  const provider = process.env.STORAGE_PROVIDER;

  // Local storage is valid (for NAS/testing)
  if (provider === "local" || !provider) {
    // If no provider set but DATABASE_URL exists, storage is NOT configured
    // This means user deployed to Vercel but hasn't set up storage yet
    if (process.env.DATABASE_URL && !provider) {
      return false;
    }
    return true;
  }

  if (provider === "s3") {
    return !!(
      process.env.S3_ENDPOINT &&
      process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY
    );
  }

  if (provider === "azure") {
    return !!(
      process.env.AZURE_STORAGE_CONNECTION_STRING &&
      process.env.AZURE_STORAGE_CONTAINER_NAME
    );
  }

  if (provider === "supabase") {
    return !!(
      process.env.SUPABASE_URL &&
      process.env.SUPABASE_ANON_KEY &&
      process.env.SUPABASE_BUCKET
    );
  }

  return false;
}

/**
 * Get configuration status for display
 */
export function getConfigStatus() {
  return {
    database: isDatabaseConfigured(),
    storage: isStorageConfigured(),
    isLocalMode: process.env.DATABASE_PROVIDER === "local",
  };
}
