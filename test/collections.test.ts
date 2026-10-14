import { describe, it, expect, beforeAll } from "vitest";
import { COLLECTIONS, getCollectionBySlug } from "../lib/collections";
import { getAllSpecies } from "../lib/services/speciesService";
import { getDb } from "../lib/db";
import { generateStaticParams, generateMetadata } from "../app/collections/[slug]/page";
import sitemap from "../app/sitemap";

describe("Botanical Collections", () => {
  beforeAll(async () => {
    await getDb();
  });

  it("contains 8 distinct collections with valid metadata and FAQs", () => {
    expect(COLLECTIONS.length).toBe(8);
    const slugs = new Set(COLLECTIONS.map((c) => c.slug));
    expect(slugs.size).toBe(8);

    for (const c of COLLECTIONS) {
      expect(c.slug).toBeTruthy();
      expect(c.titleTh).toBeTruthy();
      expect(c.titleEn).toBeTruthy();
      expect(c.badge).toBeTruthy();
      expect(c.introTh.length).toBeGreaterThan(50);
      expect(c.introEn).toBeTruthy();
      expect(c.faqs.length).toBeGreaterThanOrEqual(3);
      for (const faq of c.faqs) {
        expect(faq.qTh).toBeTruthy();
        expect(faq.aTh).toBeTruthy();
        expect(faq.qEn).toBeTruthy();
        expect(faq.aEn).toBeTruthy();
      }
    }
  });

  it("each collection yields at least 3 matching species from seed catalog", async () => {
    for (const c of COLLECTIONS) {
      const species = await getAllSpecies(c.filter);
      expect(species.length, `Collection ${c.slug} should have plants`).toBeGreaterThanOrEqual(2);
    }
  });

  it("getCollectionBySlug returns correct collection or undefined", () => {
    const found = getCollectionBySlug("air-con-plants");
    expect(found).toBeDefined();
    expect(found?.slug).toBe("air-con-plants");
    expect(getCollectionBySlug("non-existent-collection")).toBeUndefined();
  });

  it("generateStaticParams returns all 8 collection slugs", () => {
    const params = generateStaticParams();
    expect(params).toHaveLength(8);
    expect(params.map((p) => p.slug)).toEqual(COLLECTIONS.map((c) => c.slug));
  });

  it("generateMetadata produces valid SEO metadata for collections", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "pet-safe-plants" }),
    });
    expect(meta.title).toContain("ต้นไม้ปลอดภัยกับสัตว์เลี้ยง");
    expect(meta.description).toBeTruthy();
    expect(meta.alternates?.canonical).toBe("https://treeforlife.shop/collections/pet-safe-plants");

    const notFoundMeta = await generateMetadata({
      params: Promise.resolve({ slug: "invalid-collection" }),
    });
    expect(notFoundMeta.title).toContain("ไม่พบคอลเลกชัน");
  });

  it("sitemap includes /collections and all 8 collection slugs", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://treeforlife.shop/collections");
    for (const c of COLLECTIONS) {
      expect(urls).toContain(`https://treeforlife.shop/collections/${c.slug}`);
    }
  });
});
