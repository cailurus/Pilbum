import { StorageAdapter } from "./types";
import { LocalStorageAdapter } from "./local";
import { AzureStorageAdapter } from "./azure";
import { S3StorageAdapter } from "./s3";

let storageInstance: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (storageInstance) return storageInstance;

  const provider = process.env.STORAGE_PROVIDER || "local";

  switch (provider) {
    case "s3":
      storageInstance = new S3StorageAdapter();
      break;
    case "azure":
      storageInstance = new AzureStorageAdapter();
      break;
    case "local":
    default:
      storageInstance = new LocalStorageAdapter(
        process.env.LOCAL_STORAGE_PATH
      );
      break;
  }

  return storageInstance;
}

export type { StorageAdapter } from "./types";
