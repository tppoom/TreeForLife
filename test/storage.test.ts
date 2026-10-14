import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getStorageProvider, StorageProvider } from "../lib/storage";
import { MockStorageProvider } from "../lib/storage/mock";
import { SupabaseStorageProvider } from "../lib/storage/supabase";

describe("Media Storage Abstraction", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("defaults to mock/local provider in test environment", async () => {
    const storage = getStorageProvider();
    expect(storage).toBeDefined();
    expect(storage).toBeInstanceOf(MockStorageProvider);

    const signed = await storage.createSignedUploadUrl({
      path: "species/test-species/photo-1.webp",
      contentType: "image/webp",
    });

    expect(signed.uploadUrl).toBeTruthy();
    expect(signed.publicUrl).toContain("photo-1.webp");
  });

  it("handles deletion gracefully", async () => {
    const storage = getStorageProvider();
    const success = await storage.deleteFile("species/test-species/photo-1.webp");
    expect(success).toBe(true);
  });

  it("returns public url correctly from mock provider", () => {
    const storage = getStorageProvider();
    const url = storage.getPublicUrl("species/test-species/photo-1.webp");
    expect(url).toContain("photo-1.webp");
  });

  it("instantiates SupabaseStorageProvider when environment variables are set", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy-service-role-key";

    const storage = getStorageProvider();
    expect(storage).toBeInstanceOf(SupabaseStorageProvider);
  });

  describe("SupabaseStorageProvider", () => {
    const supabaseUrl = "https://example.supabase.co";
    const serviceRoleKey = "dummy-service-role-key";
    let provider: SupabaseStorageProvider;

    beforeEach(() => {
      provider = new SupabaseStorageProvider({
        supabaseUrl,
        serviceRoleKey,
        bucket: "species-media",
      });
    });

    it("generates correct public url", () => {
      const url = provider.getPublicUrl("species/monstera/leaf.jpg");
      expect(url).toBe("https://example.supabase.co/storage/v1/object/public/species-media/species/monstera/leaf.jpg");
    });

    it("creates signed upload url using Supabase REST API", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          url: "/object/upload/sign/species-media/species/monstera/leaf.jpg?token=secret-token",
        }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await provider.createSignedUploadUrl({
        path: "species/monstera/leaf.jpg",
        contentType: "image/jpeg",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://example.supabase.co/storage/v1/object/upload/sign/species-media/species/monstera/leaf.jpg",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
            "Content-Type": "application/json",
          }),
        })
      );

      expect(result.uploadUrl).toBe(
        "https://example.supabase.co/storage/v1/object/upload/sign/species-media/species/monstera/leaf.jpg?token=secret-token"
      );
      expect(result.publicUrl).toBe(
        "https://example.supabase.co/storage/v1/object/public/species-media/species/monstera/leaf.jpg"
      );
    });

    it("deletes file via Supabase REST API", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [{ name: "leaf.jpg" }],
      });
      vi.stubGlobal("fetch", mockFetch);

      const success = await provider.deleteFile("species/monstera/leaf.jpg");
      expect(success).toBe(true);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://example.supabase.co/storage/v1/object/species-media",
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            prefixes: ["species/monstera/leaf.jpg"],
          }),
        })
      );
    });

    it("handles delete failures gracefully returning false", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => "Internal Server Error",
      });
      vi.stubGlobal("fetch", mockFetch);

      const success = await provider.deleteFile("species/monstera/leaf.jpg");
      expect(success).toBe(false);
    });
  });
});
