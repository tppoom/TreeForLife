import { MockStorageProvider } from "./mock";
import { SupabaseStorageProvider } from "./supabase";

export interface StorageProvider {
  createSignedUploadUrl(opts: {
    path: string;
    contentType: string;
  }): Promise<{ uploadUrl: string; publicUrl: string }>;
  deleteFile(path: string): Promise<boolean>;
  getPublicUrl(path: string): string;
}

export { MockStorageProvider } from "./mock";
export { SupabaseStorageProvider } from "./supabase";

let cachedProvider: StorageProvider | null = null;
let lastServiceRoleKey: string | undefined = undefined;
let lastSupabaseUrl: string | undefined = undefined;

export function getStorageProvider(): StorageProvider {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (
    cachedProvider &&
    lastServiceRoleKey === serviceRoleKey &&
    lastSupabaseUrl === supabaseUrl
  ) {
    return cachedProvider;
  }

  lastServiceRoleKey = serviceRoleKey;
  lastSupabaseUrl = supabaseUrl;

  if (serviceRoleKey && supabaseUrl) {
    cachedProvider = new SupabaseStorageProvider({
      supabaseUrl,
      serviceRoleKey,
      bucket: "species-media",
    });
  } else {
    cachedProvider = new MockStorageProvider();
  }

  return cachedProvider;
}
