import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { StorageAdapter } from "./types";

export class S3StorageAdapter implements StorageAdapter {
  private client: S3Client;
  private bucket: string;
  private baseUrl: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const bucket = process.env.S3_BUCKET;
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    const region = process.env.S3_REGION || "auto";

    if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "S3 storage requires S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY"
      );
    }

    this.bucket = bucket;
    this.baseUrl =
      process.env.NEXT_PUBLIC_STORAGE_BASE_URL || `${endpoint}/${bucket}`;

    this.client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      // Required for Cloudflare R2 and other S3-compatible services
      forcePathStyle: true,
    });
  }

  async upload(
    key: string,
    data: Buffer,
    contentType: string
  ): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
    return this.getPublicUrl(key);
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
    } catch {
      // Ignore errors on delete (file may not exist)
    }
  }

  getPublicUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }
}
