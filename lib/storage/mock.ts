import type { StorageProvider } from "./index";

export class MockStorageProvider implements StorageProvider {
  private baseUrl: string;

  constructor(baseUrl = "https://mock-storage.local") {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  async createSignedUploadUrl(opts: {
    path: string;
    contentType: string;
  }): Promise<{ uploadUrl: string; publicUrl: string }> {
    const cleanPath = opts.path.replace(/^\/+/, "");
    return {
      uploadUrl: `${this.baseUrl}/upload/${cleanPath}`,
      publicUrl: this.getPublicUrl(cleanPath),
    };
  }

  async deleteFile(_path: string): Promise<boolean> {
    return true;
  }

  getPublicUrl(path: string): string {
    const cleanPath = path.replace(/^\/+/, "");
    return `${this.baseUrl}/public/${cleanPath}`;
  }
}
