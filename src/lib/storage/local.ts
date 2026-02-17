import { StorageAdapter } from "./types";
import * as fs from "fs/promises";
import * as path from "path";

export class LocalStorageAdapter implements StorageAdapter {
  private basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath || path.join(process.cwd(), "public", "uploads");
  }

  private validateKey(key: string): void {
    if (key.includes("..") || key.startsWith("/") || key.startsWith("\\")) {
      throw new Error("Invalid storage key: path traversal not allowed");
    }
  }

  async upload(key: string, data: Buffer, _contentType: string): Promise<string> {
    this.validateKey(key);
    const filePath = path.join(this.basePath, key);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, data);
    return this.getPublicUrl(key);
  }

  async delete(key: string): Promise<void> {
    this.validateKey(key);
    const filePath = path.join(this.basePath, key);
    try {
      await fs.unlink(filePath);
    } catch {
      // File may not exist
    }
  }

  getPublicUrl(key: string): string {
    return `/uploads/${key}`;
  }
}
