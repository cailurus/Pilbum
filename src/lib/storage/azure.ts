import { StorageAdapter } from "./types";
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

export class AzureStorageAdapter implements StorageAdapter {
  private containerClient;
  private baseUrl: string;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error("AZURE_STORAGE_CONNECTION_STRING is not set");
    }
    const containerName =
      process.env.AZURE_STORAGE_CONTAINER_NAME || "photos";

    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    this.containerClient =
      blobServiceClient.getContainerClient(containerName);

    // Extract the base URL from the connection string
    const accountName = connectionString.match(/AccountName=([^;]+)/)?.[1];
    this.baseUrl =
      process.env.NEXT_PUBLIC_STORAGE_BASE_URL ||
      `https://${accountName}.blob.core.windows.net/${containerName}`;
  }

  async upload(
    key: string,
    data: Buffer,
    contentType: string
  ): Promise<string> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(key);
    await blockBlobClient.upload(data, data.length, {
      blobHTTPHeaders: {
        blobContentType: contentType,
        blobCacheControl: "public, max-age=31536000, immutable",
      },
    });
    return this.getPublicUrl(key);
  }

  async delete(key: string): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(key);
    await blockBlobClient.deleteIfExists();
  }

  getPublicUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }
}
