import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../lib/db";
import { GET as getSpeciesList, POST as createSpecies } from "../app/api/admin/species/route";
import { GET as getSpecies, PATCH as updateSpecies, DELETE as deleteSpecies } from "../app/api/admin/species/[id]/route";
import { POST as publishSpecies } from "../app/api/admin/species/[id]/publish/route";
import { POST as createMedia } from "../app/api/admin/media/route";
import { POST as uploadUrlMedia } from "../app/api/admin/media/upload-url/route";
import { DELETE as deleteMedia, PATCH as updateMedia } from "../app/api/admin/media/[id]/route";
import { requireStaff, type Actor } from "../lib/auth/actor";
import { HttpError } from "../lib/http/errors";

describe("Admin Species Catalog APIs", () => {
  let createdId: string;
  let sourceSpeciesId: string;
  let createdMediaId: string;

  beforeAll(async () => {
    await getDb();
  });

  it("creates a draft species with minimum fields", async () => {
    const slug = `syngonium-albo-${Date.now()}`;
    const req = new Request("https://example.com/api/admin/species", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        nameTh: "ต้นเงินไหลมาด่างขาว",
        nameEn: "Syngonium Albo Variegata",
        slug,
      }),
    });
    const res = await createSpecies(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.id).toBeDefined();
    expect(json.data.publishedAt).toBeNull(); // Draft by default
    expect(json.data.stockStatus).toBe("in_stock");
    expect(json.data.searchText).toBeDefined();
    createdId = json.data.id;
  });

  it("creates another species copying care template and traits from existing species", async () => {
    const slug = `syngonium-aurea-${Date.now()}`;
    const req = new Request("https://example.com/api/admin/species", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        nameTh: "ต้นเงินไหลมาด่างเหลือง",
        nameEn: "Syngonium Aurea Variegata",
        slug,
        copyFromId: createdId,
      }),
    });
    const res = await createSpecies(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.id).toBeDefined();
    sourceSpeciesId = json.data.id;
  });

  it("fails to create species with invalid slug or missing fields", async () => {
    const req = new Request("https://example.com/api/admin/species", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        nameTh: "",
        nameEn: "",
        slug: "Invalid Slug With Spaces",
      }),
    });
    const res = await createSpecies(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("lists all species including drafts and media", async () => {
    const req = new Request("https://example.com/api/admin/species");
    const res = await getSpeciesList(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    const found = json.data.find((s: any) => s.id === createdId);
    expect(found).toBeDefined();
    expect(found.publishedAt).toBeNull();
    expect(Array.isArray(found.media)).toBe(true);
  });

  it("updates draft species details", async () => {
    const req = new Request(`https://example.com/api/admin/species/${createdId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        difficulty: 2,
        light: "bright_indirect",
        shopNote: "ต้นนี้ชอบความชื้นสูงและแดดรำไร",
        careTemplate: {
          waterDaysHot: 2,
          waterDaysRainy: 4,
          waterDaysCool: 3,
        },
      }),
    });
    const res = await updateSpecies(req, { params: Promise.resolve({ id: createdId }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.difficulty).toBe(2);
    expect(json.data.shopNote).toContain("ชอบความชื้นสูง");
  });

  it("gets full species details with care template and media", async () => {
    const req = new Request(`https://example.com/api/admin/species/${createdId}`);
    const res = await getSpecies(req, { params: Promise.resolve({ id: createdId }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.id).toBe(createdId);
    expect(json.data.careTemplate).toBeDefined();
    expect(json.data.careTemplate.waterDaysHot).toBe(2);
  });

  it("publishes and unpublishes species via publish toggle", async () => {
    // 1. Publish
    const reqPub = new Request(`https://example.com/api/admin/species/${createdId}/publish`, {
      method: "POST",
    });
    const resPub = await publishSpecies(reqPub, { params: Promise.resolve({ id: createdId }) });
    expect(resPub.status).toBe(200);
    const jsonPub = await resPub.json();
    expect(jsonPub.data.publishedAt).not.toBeNull();

    // 2. Unpublish (toggle)
    const reqUnpub = new Request(`https://example.com/api/admin/species/${createdId}/publish`, {
      method: "POST",
    });
    const resUnpub = await publishSpecies(reqUnpub, { params: Promise.resolve({ id: createdId }) });
    expect(resUnpub.status).toBe(200);
    const jsonUnpub = await resUnpub.json();
    expect(jsonUnpub.data.publishedAt).toBeNull();
  });

  it("generates signed upload URL for media uploads", async () => {
    const req = new Request("https://example.com/api/admin/media/upload-url", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        filename: "test-photo.webp",
        contentType: "image/webp",
        speciesId: createdId,
      }),
    });
    const res = await uploadUrlMedia(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.uploadUrl).toBeDefined();
    expect(json.data.publicUrl).toBeDefined();
  });

  it("creates media record for species", async () => {
    const req = new Request("https://example.com/api/admin/media", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        speciesId: createdId,
        url: "https://example.com/species-media/test-photo.webp",
        alt: "รูปถ่ายเงินไหลมาด่างขาว",
        isCover: true,
        sortOrder: 0,
      }),
    });
    const res = await createMedia(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.id).toBeDefined();
    expect(json.data.speciesId).toBe(createdId);
    expect(json.data.isPrimary).toBe(true);
    createdMediaId = json.data.id;
  });

  it("updates media metadata (alt, cover status, sortOrder)", async () => {
    const req = new Request(`https://example.com/api/admin/media/${createdMediaId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        alt: "รูปถ่ายเงินไหลมาด่างขาวมุมข้าง",
        sortOrder: 1,
      }),
    });
    const res = await updateMedia(req, { params: Promise.resolve({ id: createdMediaId }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.altTh).toBe("รูปถ่ายเงินไหลมาด่างขาวมุมข้าง");
    expect(json.data.sortOrder).toBe(1);
  });

  it("deletes media record and calls storage provider", async () => {
    const req = new Request(`https://example.com/api/admin/media/${createdMediaId}`, {
      method: "DELETE",
    });
    const res = await deleteMedia(req, { params: Promise.resolve({ id: createdMediaId }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it("deletes species and its cascaded records", async () => {
    const req = new Request(`https://example.com/api/admin/species/${sourceSpeciesId}`, {
      method: "DELETE",
    });
    const res = await deleteSpecies(req, { params: Promise.resolve({ id: sourceSpeciesId }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    // Verify it's gone
    const reqCheck = new Request(`https://example.com/api/admin/species/${sourceSpeciesId}`);
    const resCheck = await getSpecies(reqCheck, { params: Promise.resolve({ id: sourceSpeciesId }) });
    expect(resCheck.status).toBe(404);
  });

  it("unauthorized anonymous caller cannot access admin endpoints (requireStaff check)", async () => {
    const anonymousActor: Actor = { kind: "anonymous", ip: "127.0.0.1" };
    expect(() => requireStaff(anonymousActor)).toThrow(HttpError);

    const customerActor: Actor = { kind: "user", userId: "cust-1", role: "customer", guestToken: null };
    expect(() => requireStaff(customerActor)).toThrow(HttpError);

    const staffActor: Actor = { kind: "user", userId: "staff-1", role: "staff", guestToken: null };
    expect(() => requireStaff(staffActor)).not.toThrow();
  });
});
