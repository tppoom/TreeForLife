import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "@/lib/db";
import {
  getAllSpecies,
  getSpeciesBySlug,
  getSimilarSpecies,
} from "@/lib/services/speciesService";
import { getSearchMisses } from "@/lib/services/adminService";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { generateMetadata as generatePlantMetadata } from "@/app/plants/[slug]/page";
import HomePage from "@/app/page";
import SearchPage from "@/app/search/page";

describe("Task 6: Public Catalog, Faceted Search & Plant Detail Integration", () => {
  beforeAll(async () => {
    await getDb();
  });

  describe("1. Homepage & Catalog", () => {
    it("HomePage component executes and retrieves 8 featured species", async () => {
      const homeComponent = await HomePage();
      expect(homeComponent).toBeDefined();
      expect(homeComponent.props.featuredPlants).toBeDefined();
      expect(homeComponent.props.featuredPlants.length).toBe(8);

      const firstPlant = homeComponent.props.featuredPlants[0];
      expect(firstPlant).toHaveProperty("slug");
      expect(firstPlant).toHaveProperty("nameTh");
      expect(firstPlant).toHaveProperty("nameEn");
      expect(firstPlant).toHaveProperty("primaryImage");
      expect(firstPlant.stockStatus).toBe("in_stock");
    });
  });

  describe("2. Search & Multi-Attribute Filters", () => {
    it("performs full-text search on Thai names", async () => {
      const results = await getAllSpecies({ search: "มอนสเตอร่า" });
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some((r) => r.nameTh.includes("มอนสเตอร่า"))).toBe(true);
    });

    it("performs alias search on Latin / common aliases", async () => {
      const results = await getAllSpecies({ search: "Albo" });
      expect(results.length).toBeGreaterThanOrEqual(1);
      const albo = results.find((r) => r.slug === "monstera-albo-variegata");
      expect(albo).toBeDefined();
    });

    it("filters by light requirement", async () => {
      const results = await getAllSpecies({ light: "full_sun" });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.light === "full_sun")).toBe(true);
    });

    it("filters by water need", async () => {
      const results = await getAllSpecies({ waterNeed: "low" });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.waterNeed === "low")).toBe(true);
    });

    it("filters by pet safety (safe)", async () => {
      const results = await getAllSpecies({ petSafe: "safe" });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.petSafe === "safe")).toBe(true);
    });

    it("filters by difficulty level", async () => {
      const results = await getAllSpecies({ difficulty: 1 });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.difficulty === 1)).toBe(true);
    });

    it("filters by mature size", async () => {
      const results = await getAllSpecies({ matureSize: "sm" });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.matureSize === "sm")).toBe(true);
    });

    it("filters by placement in JSONB array", async () => {
      const results = await getAllSpecies({ placement: "indoor" });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.placement.includes("indoor"))).toBe(true);
    });

    it("filters by stock status", async () => {
      const results = await getAllSpecies({ stockStatus: "in_stock" });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.stockStatus === "in_stock")).toBe(true);
    });

    it("supports multi-attribute combinations (indoor + petSafe)", async () => {
      const results = await getAllSpecies({
        placement: "indoor",
        petSafe: "safe",
      });
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.placement.includes("indoor")).toBe(true);
        expect(r.petSafe).toBe("safe");
      }
    });

    it("sorts by easiest first", async () => {
      const results = await getAllSpecies({ sort: "easiest_first" });
      expect(results.length).toBeGreaterThan(1);
      for (let i = 1; i < results.length; i++) {
        expect(results[i].difficulty).toBeGreaterThanOrEqual(results[i - 1].difficulty);
      }
    });

    it("sorts by in_stock first", async () => {
      const results = await getAllSpecies({ sort: "in_stock_first", stockStatus: "all" });
      expect(results.length).toBeGreaterThan(1);
      let foundNonStock = false;
      for (const r of results) {
        if (r.stockStatus !== "in_stock") {
          foundNonStock = true;
        } else if (foundNonStock) {
          // If we already encountered a non-in_stock item, we shouldn't see an in_stock item after
          expect(r.stockStatus).not.toBe("in_stock");
        }
      }
    });

    it("logs search miss when zero results match search term", async () => {
      const uniqueQuery = `space_tree_nonexistent_${Date.now()}`;
      const results = await getAllSpecies({ search: uniqueQuery });
      expect(results.length).toBe(0);

      const misses = await getSearchMisses();
      const match = misses.find((m) => m.query.toLowerCase() === uniqueQuery.toLowerCase());
      expect(match).toBeDefined();
      expect(match?.count).toBeGreaterThanOrEqual(1);
    });

    it("SearchPage component renders with searchParams", async () => {
      const searchComponent = await SearchPage({
        searchParams: Promise.resolve({
          q: "มอนสเตอร่า",
          light: "indoor_bright",
          pet: "toxic",
        }),
      });

      expect(searchComponent).toBeDefined();
      expect(searchComponent.props.initialSpecies).toBeDefined();
      expect(searchComponent.props.initialFilters.q).toBe("มอนสเตอร่า");
      expect(searchComponent.props.initialFilters.light).toBe("indoor_bright");
      expect(searchComponent.props.initialFilters.pet).toBe("toxic");
    });
  });

  describe("3. Plant Detail & SEO", () => {
    it("fetches full plant details by slug with relations", async () => {
      const slug = "monstera-albo-variegata";
      const plant = await getSpeciesBySlug(slug);

      expect(plant).not.toBeNull();
      if (!plant) return;

      expect(plant.nameTh).toBe("มอนสเตอร่าด่าง อัลโบ");
      expect(plant.nameSci).toContain("Monstera deliciosa");
      expect(plant.family).toContain("Araceae");
      expect(plant.shopNote).toBeTruthy();
      expect(plant.soilMix).toBeTruthy();

      // Media relation
      expect(plant.media.length).toBeGreaterThanOrEqual(1);
      expect(plant.media[0].credit).toBe("ถ่ายที่ร้าน");

      // Care template relation (3 Thai seasons)
      expect(plant.careTemplate).not.toBeNull();
      expect(plant.careTemplate?.waterDaysHot).toBeGreaterThan(0);
      expect(plant.careTemplate?.waterDaysRainy).toBeGreaterThan(0);
      expect(plant.careTemplate?.waterDaysCool).toBeGreaterThan(0);

      // Problems troubleshooting relation
      expect(plant.problems.length).toBeGreaterThan(0);
      expect(plant.problems[0]).toHaveProperty("symptomTh");
      expect(plant.problems[0]).toHaveProperty("causeTh");
      expect(plant.problems[0]).toHaveProperty("fixTh");
      expect(plant.problems[0]).toHaveProperty("severity");
    });

    it("returns null for nonexistent plant slug", async () => {
      const plant = await getSpeciesBySlug("non-existent-tree-species-xyz");
      expect(plant).toBeNull();
    });

    it("recommends up to 4 similar species excluding self", async () => {
      const slug = "monstera-albo-variegata";
      const plant = await getSpeciesBySlug(slug);
      expect(plant).not.toBeNull();
      if (!plant) return;

      const similar = await getSimilarSpecies(plant.id, plant.light, plant.waterNeed);
      expect(similar.length).toBeGreaterThan(0);
      expect(similar.length).toBeLessThanOrEqual(4);
      expect(similar.every((s) => s.id !== plant.id)).toBe(true);
      expect(similar[0]).toHaveProperty("primaryImage");
    });

    it("generates OpenGraph metadata for plant detail page", async () => {
      const meta = await generatePlantMetadata({
        params: Promise.resolve({ slug: "monstera-albo-variegata" }),
      });

      expect(meta.title).toContain("มอนสเตอร่าด่าง อัลโบ");
      expect(meta.openGraph?.title).toContain("มอนสเตอร่าด่าง อัลโบ");
      expect(meta.openGraph?.siteName).toBe("TreeForLife");
    });
  });

  describe("4. Dynamic Sitemap & Robots.txt", () => {
    it("generates sitemap including static routes and all published species", async () => {
      const entries = await sitemap();
      expect(entries.length).toBeGreaterThan(30);

      const urls = entries.map((e) => e.url);
      expect(urls.some((u) => u.endsWith("/search"))).toBe(true);
      expect(urls.some((u) => u.endsWith("/garden"))).toBe(true);
      expect(urls.some((u) => u.endsWith("/today"))).toBe(true);
      expect(urls.some((u) => u.includes("/plants/monstera-albo-variegata"))).toBe(true);

      for (const entry of entries) {
        expect(entry).toHaveProperty("url");
        expect(entry).toHaveProperty("lastModified");
        expect(entry).toHaveProperty("priority");
      }
    });

    it("generates robots.txt with allowed root and disallows admin & api", () => {
      const config = robots();
      expect(config.rules).toBeDefined();
      const rules = Array.isArray(config.rules) ? config.rules[0] : config.rules;
      expect(rules.allow).toBe("/");
      expect(rules.disallow).toContain("/admin");
      expect(rules.disallow).toContain("/api/");
      expect(config.sitemap).toContain("/sitemap.xml");
    });
  });
});
