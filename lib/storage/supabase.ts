import type { StorageProvider } from "./index";

export interface SupabaseStorageProviderOptions {
  supabaseUrl: string;
  serviceRoleKey: string;
  bucket?: string;
}

export class SupabaseStorageProvider implements StorageProvider {
  private supabaseUrl: string;
  private serviceRoleKey: string;
  private bucket: string;

  constructor(options: SupabaseStorageProviderOptions) {
    this.supabaseUrl = options.supabaseUrl.replace(/\/+$/, "");
    this.serviceRoleKey = options.serviceRoleKey;
    this.bucket = options.bucket || "species-media";
  }

  async createSignedUploadUrl(opts: {
    path: string;
    contentType: string;
  }): Promise<{ uploadUrl: string; publicUrl: string }> {
    const cleanPath = opts.path.replace(/^\/+/, "");
    const endpoint = `${this.supabaseUrl}/storage/v1/object/upload/sign/${this.bucket}/${cleanPath}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.serviceRoleKey}`,
        apikey: this.serviceRoleKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ upsert: true }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(
        `Failed to create signed upload URL: ${res.status} ${res.statusText} ${errorText}`.trim()
      );
    }

    const data = (await res.json()) as { url?: string; signedUrl?: string };
    let uploadUrl = data.signedUrl || data.url || "";
    if (uploadUrl.startsWith("/")) {
      uploadUrl = `${this.supabaseUrl}/storage/v1${uploadUrl}`;
    }

    return {
      uploadUrl,
      publicUrl: this.getPublicUrl(cleanPath),
    };
  }

  async deleteFile(path: string): Promise<boolean> {
    const cleanPath = path.replace(/^\/+/, "");
    const endpoint = `${this.supabaseUrl}/storage/v1/object/${this.bucket}`;

    try {
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.serviceRoleKey}`,
          apikey: this.serviceRoleKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prefixes: [cleanPath],
        }),
      });

      if (!res.ok) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  getPublicUrl(path: string): string {
    const cleanPath = path.replace(/^\/+/, "");
    return `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${cleanPath}`;
  }
}
