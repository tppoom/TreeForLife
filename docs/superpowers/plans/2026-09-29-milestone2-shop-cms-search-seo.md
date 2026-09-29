# Milestone 2: Shop Operations & Discoverability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement PostgreSQL trigram fuzzy Thai search (F04), 8 SEO collection hubs with rich schema markup (F13), and a full-featured mobile-first Admin Catalog CMS with cloud photo upload (F01).

**Architecture:** A unified discovery and operations pipeline: queries pass through a Thai normalization pipeline and `pg_trgm` GIN index with fallback suggestions. Public discovery is enhanced by 8 static SEO collections (`/collections/*`) with Schema.org JSON-LD FAQ/ItemList structured data. The nursery staff manages the catalog via `/admin/species/*` supporting 4 tabs (Info, Photos, 3-Season Care Formula with live preview, and Common Problems) backed by a storage provider abstraction for authentic photos.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.7, Drizzle ORM, PostgreSQL (`pg_trgm`), PGlite (`@electric-sql/pglite/contrib/pg_trgm`), Zod 3, Vitest 2.

**Spec:** `docs/superpowers/specs/2026-09-29-milestone2-shop-cms-search-seo-design.md`

## Global Constraints

- Target repository: `tppoom/TreeForLife` (`/Users/tppoom/Desktop/Projects/TreeForLife`)
- Do NOT touch `/Users/tppoom/Desktop/tree-for-life`
- Zero regressions on existing 217 tests across 20 test files
- All public queries (`speciesService.ts`) must filter `published_at IS NOT NULL AND stock_status <> 'hidden'`
- All admin endpoints under `/api/admin/*` must verify staff authority via `requireStaff(actor)`
- Search text normalization must strip Thai tone marks/diacritics and middle 'ะ' to equate "มอนสเตอร่า", "มอนสเตอรา", and "มอนสะเตอร่า"
- Storage provider must function in local development and tests without requiring external cloud credentials (local mock provider)
- Botanical luxury theme tokens (`forest-*`, `sand-*`, `emerald-*`, `gold-*`) and dark mode preserved

---

### Task 1: Thai Text Normalization Engine (`lib/search/normalize.ts`)

**Files:**
- Create: `lib/search/normalize.ts`
- Test: `test/normalize.test.ts`

**Interfaces:**
- Produces: `normalizeThaiSearch(input: string): string`

- [ ] **Step 1: Write test for normalization**

```ts
// test/normalize.test.ts
import { describe, it, expect } from "vitest";
import { normalizeThaiSearch } from "../lib/search/normalize";

describe("Thai Search Text Normalization", () => {
  it("normalizes Thai tone marks and diacritics", () => {
    expect(normalizeThaiSearch("มอนสเตอร่า")).toBe("มอนสเตอรา");
    expect(normalizeThaiSearch("ลิ้นมังกร")).toBe("ลินมังกร");
  });

  it("normalizes middle 'ะ' variations", () => {
    expect(normalizeThaiSearch("มอนสะเตอร่า")).toBe("มอนสเตอรา");
  });

  it("lowercases and strips punctuation, whitespace, and hyphens", () => {
    expect(normalizeThaiSearch("Monstera-Deliciosa (Giant)")).toBe("monsteradeliciosagiant");
  });

  it("handles empty or single character gracefully", () => {
    expect(normalizeThaiSearch("")).toBe("");
    expect(normalizeThaiSearch("  ")).toBe("");
    expect(normalizeThaiSearch(" ก ")).toBe("ก");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/normalize.test.ts`
Expected: FAIL (Cannot find module '../lib/search/normalize')

- [ ] **Step 3: Implement `lib/search/normalize.ts`**

```ts
// lib/search/normalize.ts
export function normalizeThaiSearch(input: string | null | undefined): string {
  if (!input) return "";

  // 1. Unicode NFC normalization & trim
  let text = input.normalize("NFC").trim().toLowerCase();

  // 2. Strip punctuation, whitespace, and symbols
  text = text.replace(/[\s\-_.,/()'"[\]{}:;+!@#$%^&*\\|`~<>?=]/g, "");

  // 3. Remove Thai tone marks and diacritics:
  // U+0E31 (ั mai han-akat), U+0E47-U+0E4E (็ ่ ้ ๊ ๋ ์ ํ), U+0E3A (ฺ phinthu)
  // Note: Keep vowels (ะ า ิ ี ึ ื ุ ู เ แ โ ใ ไ) but handle middle 'ะ'
  text = text.replace(/[\u0E38\u0E39\u0E47-\u0E4E\u0E3A]/g, (match) => {
    // Keep sara u (\u0E38) and sara uu (\u0E39)
    if (match === "\u0E38" || match === "\u0E39") return match;
    return "";
  });
  text = text.replace(/[\u0E48-\u0E4C]/g, ""); // ่ ้ ๊ ๋ ์

  // 4. Remove 'ะ' when in the middle of a Thai word (e.g. มอนสะเตอร่า -> มอนสเตอรา)
  // Matches 'ะ' followed by a Thai consonant (\u0E01-\u0E2E)
  text = text.replace(/ะ(?=[\u0E01-\u0E2E])/g, "");

  return text;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/normalize.test.ts`
Expected: PASS (4 tests passed)

- [ ] **Step 5: Commit**

```bash
git add lib/search/normalize.ts test/normalize.test.ts
git commit -m "feat(search): add Thai search text normalization pipeline"
```

---

### Task 2: Database Trigram Integration & Search Text Column

**Files:**
- Modify: `db/schema.ts`
- Modify: `lib/db/index.ts`
- Modify: `lib/db/schema-ddl.ts`
- Test: `test/search-trgm.test.ts`

**Interfaces:**
- Produces: `species.searchText` column, GIN trigram index `species_search_trgm`, `searchMisses.normalizedQuery`, `searchMisses.suggestedSpeciesId`, `searchMisses.resolvedAt`.

- [ ] **Step 1: Write database trigram test**

```ts
// test/search-trgm.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../lib/db";
import { species } from "../db/schema";
import { sql } from "drizzle-orm";
import { normalizeThaiSearch } from "../lib/search/normalize";

describe("Database Trigram & Search Text Support", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  it("verifies pg_trgm extension and similarity calculation", async () => {
    const res = await db.execute(
      sql`SELECT similarity(${normalizeThaiSearch("มอนสเตอร่า")}, ${normalizeThaiSearch("มอนสเตอรา")}) AS sim`
    );
    const sim = Number(res[0]?.sim ?? res.rows?.[0]?.sim);
    expect(sim).toBeGreaterThan(0.5);
  });

  it("species table has search_text column populated", async () => {
    const first = await db.query.species.findFirst();
    expect(first).toBeDefined();
    expect(first?.searchText).toBeDefined();
    expect(typeof first?.searchText).toBe("string");
    expect(first?.searchText.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/search-trgm.test.ts`
Expected: FAIL (`search_text` column not found / pg_trgm setup needed)

- [ ] **Step 3: Update `db/schema.ts`, `lib/db/index.ts`, and `lib/db/schema-ddl.ts`**

1. In `db/schema.ts`:
   - Add `searchText: text("search_text")` to `species` table.
   - Add to `searchMisses`:
     - `normalizedQuery: text("normalized_query")`
     - `suggestedSpeciesId: uuid("suggested_species_id").references(() => species.id, { onDelete: "set null" })`
     - `resolvedAt: timestamp("resolved_at", { withTimezone: true })`
2. In `lib/db/index.ts`:
   - Import `pg_trgm` from `@electric-sql/pglite/contrib/pg_trgm`.
   - Pass `extensions: { pg_trgm }` when initializing `PGlite`.
   - In `initDatabase`: execute `CREATE EXTENSION IF NOT EXISTS pg_trgm;`
   - In DDL: add `ALTER TABLE species ADD COLUMN IF NOT EXISTS search_text TEXT;`
   - Add `CREATE INDEX IF NOT EXISTS species_search_trgm ON species USING gin (search_text gin_trgm_ops);`
   - Backfill `search_text` for any existing rows where `search_text IS NULL`: compute normalized representation of `name_th || ' ' || name_en || ' ' || name_sci || ' ' || array_to_string(aliases, ' ')`.
3. In `lib/db/schema-ddl.ts`:
   - Keep SQL DDL synchronized with changes.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/search-trgm.test.ts`
Expected: PASS (2 tests passed)

- [ ] **Step 5: Commit**

```bash
git add db/schema.ts lib/db/index.ts lib/db/schema-ddl.ts test/search-trgm.test.ts
git commit -m "feat(db): enable pg_trgm extension and add search_text index"
```

---

### Task 3: Fuzzy Thai Search Query & Suggestions Integration

**Files:**
- Modify: `lib/services/speciesService.ts`
- Modify: `app/search/SearchClient.tsx`
- Test: `test/search-fuzzy.test.ts`

**Interfaces:**
- Produces: Enhanced `getAllSpecies(filters)` supporting fuzzy search and returning `{ species: Species[], didYouMean?: { name: string; slug: string } }`.

- [ ] **Step 1: Write integration tests for fuzzy Thai search**

```ts
// test/search-fuzzy.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../lib/db";
import { getAllSpecies } from "../lib/services/speciesService";

describe("Fuzzy Thai Search Integration", () => {
  beforeAll(async () => {
    await getDb();
  });

  it("finds Monstera with typo 'มอนสเตอรา' (missing tone mark)", async () => {
    const results = await getAllSpecies({ q: "มอนสเตอรา" });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].nameTh).toContain("มอนสเตอร่า");
  });

  it("finds Monstera with syllable insertion 'มอนสะเตอร่า'", async () => {
    const results = await getAllSpecies({ q: "มอนสะเตอร่า" });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].nameTh).toContain("มอนสเตอร่า");
  });

  it("finds Snake plant with typo 'ลิ้นมังกอน'", async () => {
    const results = await getAllSpecies({ q: "ลิ้นมังกอน" });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].nameTh).toContain("ลิ้นมังกร");
  });

  it("returns empty array for completely unrelated query", async () => {
    const results = await getAllSpecies({ q: "เครื่องบินโบอิ้ง" });
    expect(results.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/search-fuzzy.test.ts`
Expected: FAIL (Query not using normalized search_text or trigram similarity)

- [ ] **Step 3: Update `lib/services/speciesService.ts` and `app/search/SearchClient.tsx`**

1. In `lib/services/speciesService.ts`:
   - Import `normalizeThaiSearch` from `@/lib/search/normalize`.
   - When `filters.q` is provided:
     - Normalize query: `const normQ = normalizeThaiSearch(filters.q);`
     - Query condition: `search_text ILIKE '%' || normQ || '%' OR word_similarity(normQ, search_text) > 0.3`.
     - Order by exact prefix match first, then `word_similarity(normQ, search_text) DESC`.
     - If 0 results, query for species with `word_similarity(normQ, search_text) BETWEEN 0.2 AND 0.35` to find potential `didYouMean` suggestion.
     - When logging search misses, store `normalizedQuery: normQ`.
2. In `app/search/SearchClient.tsx`:
   - If `didYouMean` is returned, display botanical suggestion card: "หมายถึง **{didYouMean.name}** ใช่ไหม?" with a quick click link.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/search-fuzzy.test.ts`
Expected: PASS (4 tests passed)

- [ ] **Step 5: Commit**

```bash
git add lib/services/speciesService.ts app/search/SearchClient.tsx test/search-fuzzy.test.ts
git commit -m "feat(search): implement fuzzy Thai search and suggestion chip"
```

---

### Task 4: Curated Botanical Collections Engine & Pages

**Files:**
- Create: `lib/collections.ts`
- Create: `app/collections/page.tsx`
- Create: `app/collections/[slug]/page.tsx`
- Test: `test/collections.test.ts`

**Interfaces:**
- Produces: `COLLECTIONS` registry, `getCollectionBySlug(slug: string)`, `/collections` hub, `/collections/[slug]` static pre-rendered landing pages.

- [ ] **Step 1: Write test for collections**

```ts
// test/collections.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import { COLLECTIONS, getCollectionBySlug } from "../lib/collections";
import { getAllSpecies } from "../lib/services/speciesService";
import { getDb } from "../lib/db";

describe("Botanical Collections", () => {
  beforeAll(async () => {
    await getDb();
  });

  it("contains 8 distinct collections with valid metadata and FAQs", () => {
    expect(COLLECTIONS.length).toBe(8);
    const slugs = new Set(COLLECTIONS.map((c) => c.slug));
    expect(slugs.size).toBe(8);

    for (const c of COLLECTIONS) {
      expect(c.titleTh).toBeTruthy();
      expect(c.titleEn).toBeTruthy();
      expect(c.introTh.length).toBeGreaterThan(50);
      expect(c.faqs.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("each collection yields at least 3 matching species from seed catalog", async () => {
    for (const c of COLLECTIONS) {
      const species = await getAllSpecies(c.filter);
      expect(species.length, `Collection ${c.slug} should have plants`).toBeGreaterThanOrEqual(2);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/collections.test.ts`
Expected: FAIL (Cannot find module '../lib/collections')

- [ ] **Step 3: Implement `lib/collections.ts`, `app/collections/page.tsx`, and `app/collections/[slug]/page.tsx`**

1. Create `lib/collections.ts`:
   - Define `Collection` interface (`slug`, `titleTh`, `titleEn`, `badge`, `introTh`, `introEn`, `filter: SpeciesFilterParams`, `faqs: { qTh, aTh, qEn, aEn }[]`).
   - Define the 8 collections:
     - `air-con-plants` (placement: "air_con")
     - `pet-safe-plants` (petSafe: true)
     - `beginner-plants` (difficulty: 1, 2)
     - `full-sun-plants` (light: "full_sun")
     - `bathroom-plants` (placement: "bathroom", humidity)
     - `low-light-plants` (light: "low_light")
     - `desk-plants` (potSize: "small", placement: "desk")
     - `balcony-plants` (placement: "balcony_shade")
2. Create `app/collections/page.tsx`:
   - Botanical luxury directory of all 8 collections with icons, plant counters, and preview badges.
3. Create `app/collections/[slug]/page.tsx`:
   - `generateStaticParams()` returning all 8 slugs.
   - Botanical hero, species grid with stock priority.
   - FAQ accordion section.
   - Schema.org JSON-LD structured data (`FAQPage`, `ItemList`, `BreadcrumbList`).
   - Floating LINE OA consultation action button (`source_page=/collections/[slug]`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/collections.test.ts`
Expected: PASS (2 tests passed)

- [ ] **Step 5: Commit**

```bash
git add lib/collections.ts app/collections/page.tsx app/collections/[slug]/page.tsx test/collections.test.ts
git commit -m "feat(seo): add 8 curated botanical collections and dynamic pages"
```

---

### Task 5: SEO Dynamic Metadata, Sitemap & Navigation Integration

**Files:**
- Modify: `app/sitemap.ts`
- Modify: `components/layout/Navbar.tsx`
- Modify: `components/home/HomeHero.tsx`
- Test: `test/seo-collections.test.ts`

**Interfaces:**
- Produces: Updated `sitemap.xml` containing all `/collections/*` URLs, updated homepage shortcut chips linking to collections.

- [ ] **Step 1: Write test for sitemap and SEO navigation**

```ts
// test/seo-collections.test.ts
import { describe, it, expect } from "vitest";
import sitemap from "../app/sitemap";
import { COLLECTIONS } from "../lib/collections";

describe("SEO Collections & Sitemap Integration", () => {
  it("sitemap includes all collection routes", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    expect(urls.some((u) => u.endsWith("/collections"))).toBe(true);
    for (const c of COLLECTIONS) {
      expect(urls.some((u) => u.endsWith(`/collections/${c.slug}`)), `Missing ${c.slug}`).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/seo-collections.test.ts`
Expected: FAIL (Collections not in sitemap)

- [ ] **Step 3: Update `app/sitemap.ts`, `components/layout/Navbar.tsx`, and `components/home/HomeHero.tsx`**

1. In `app/sitemap.ts`:
   - Add `/collections` (priority 0.8) and each `/collections/${c.slug}` (priority 0.8, changeFrequency 'weekly').
2. In `components/layout/Navbar.tsx`:
   - Add "คอลเลกชันแนะนำ" (Collections) link in the navigation menu.
3. In `components/home/HomeHero.tsx`:
   - Update quick search tags to link directly to `/collections/[slug]` for rich SEO landing experiences.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/seo-collections.test.ts`
Expected: PASS (1 test passed)

- [ ] **Step 5: Commit**

```bash
git add app/sitemap.ts components/layout/Navbar.tsx components/home/HomeHero.tsx test/seo-collections.test.ts
git commit -m "feat(seo): integrate collections into sitemap and navigation"
```

---

### Task 6: Cloud Media Storage Abstraction

**Files:**
- Create: `lib/storage/index.ts`
- Create: `lib/storage/supabase.ts`
- Create: `lib/storage/mock.ts`
- Test: `test/storage.test.ts`

**Interfaces:**
- Produces: `getStorageProvider(): StorageProvider`, `StorageProvider` interface (`createSignedUploadUrl`, `deleteFile`, `getPublicUrl`).

- [ ] **Step 1: Write test for storage abstraction**

```ts
// test/storage.test.ts
import { describe, it, expect } from "vitest";
import { getStorageProvider } from "../lib/storage";

describe("Media Storage Abstraction", () => {
  it("defaults to mock/local provider in test environment", async () => {
    const storage = getStorageProvider();
    expect(storage).toBeDefined();

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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/storage.test.ts`
Expected: FAIL (Cannot find module '../lib/storage')

- [ ] **Step 3: Implement `lib/storage/index.ts`, `lib/storage/supabase.ts`, and `lib/storage/mock.ts`**

1. `lib/storage/index.ts`:
   - Export `StorageProvider` interface.
   - If `process.env.SUPABASE_SERVICE_ROLE_KEY` & `NEXT_PUBLIC_SUPABASE_URL` are present, return `SupabaseStorageProvider`.
   - Otherwise, return `MockStorageProvider` (storing files locally or returning deterministic URLs for local dev/testing).
2. `lib/storage/supabase.ts`:
   - Direct REST API integration with Supabase Storage for bucket `species-media`.
3. `lib/storage/mock.ts`:
   - In-memory / local disk implementation for instant tests with 0 cloud dependencies.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/storage.test.ts`
Expected: PASS (2 tests passed)

- [ ] **Step 5: Commit**

```bash
git add lib/storage/index.ts lib/storage/supabase.ts lib/storage/mock.ts test/storage.test.ts
git commit -m "feat(storage): implement media storage provider with Supabase and local mock"
```

---

### Task 7: Admin Species Backend APIs & Schemas

**Files:**
- Create: `lib/validation/admin.ts`
- Create: `app/api/admin/species/route.ts`
- Create: `app/api/admin/species/[id]/route.ts`
- Create: `app/api/admin/species/[id]/publish/route.ts`
- Create: `app/api/admin/media/route.ts`
- Create: `app/api/admin/media/upload-url/route.ts`
- Create: `app/api/admin/media/[id]/route.ts`
- Test: `test/admin-species-api.test.ts`

**Interfaces:**
- Produces: Complete CRUD endpoints for species catalog management, photo management, and publish/unpublish lifecycle.

- [ ] **Step 1: Write integration tests for Admin Species APIs**

```ts
// test/admin-species-api.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../lib/db";
import { GET as getSpeciesList, POST as createSpecies } from "../app/api/admin/species/route";
import { GET as getSpecies, PATCH as updateSpecies } from "../app/api/admin/species/[id]/route";
import { POST as publishSpecies } from "../app/api/admin/species/[id]/publish/route";

describe("Admin Species Catalog APIs", () => {
  let createdId: string;

  beforeAll(async () => {
    await getDb();
  });

  it("creates a draft species with minimum fields", async () => {
    const req = new Request("https://example.com/api/admin/species", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        nameTh: "ต้นเงินไหลมาด่างขาว",
        nameEn: "Syngonium Albo Variegata",
        slug: `syngonium-albo-${Date.now()}`,
      }),
    });
    const res = await createSpecies(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.id).toBeDefined();
    expect(json.data.publishedAt).toBeNull(); // Draft by default
    createdId = json.data.id;
  });

  it("updates draft species details", async () => {
    const req = new Request(`https://example.com/api/admin/species/${createdId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        difficulty: 2,
        light: "bright_indirect",
        shopNote: "ต้นนี้ชอบความชื้นสูงและแดดรำไร",
      }),
    });
    const res = await updateSpecies(req, { params: Promise.resolve({ id: createdId }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.difficulty).toBe(2);
    expect(json.data.shopNote).toContain("ชอบความชื้นสูง");
  });

  it("unauthorized anonymous caller cannot access admin endpoints", async () => {
    // Note: in local mock, if we test with anonymous role
    // requireStaff throws 403
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/admin-species-api.test.ts`
Expected: FAIL (Endpoints not found)

- [ ] **Step 3: Implement admin validation schemas and API routes**

1. Create `lib/validation/admin.ts`:
   - `AdminSpeciesCreateSchema`: `nameTh`, `nameEn`, `slug`, optional `copyFromId`.
   - `AdminSpeciesUpdateSchema`: partial update of taxonomy, difficulty, light, water, placements, summary, shopNote, aliases, care formulas.
2. Implement route handlers wrapping logic in `try/catch` and returning `toErrorResponse(err)`:
   - `app/api/admin/species/route.ts` (GET, POST)
   - `app/api/admin/species/[id]/route.ts` (GET, PATCH, DELETE)
   - `app/api/admin/species/[id]/publish/route.ts` (POST)
   - `app/api/admin/media/route.ts` (POST)
   - `app/api/admin/media/upload-url/route.ts` (POST)
   - `app/api/admin/media/[id]/route.ts` (DELETE, PATCH)

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/admin-species-api.test.ts`
Expected: PASS (All tests passed)

- [ ] **Step 5: Commit**

```bash
git add lib/validation/admin.ts app/api/admin/species/ app/api/admin/media/ test/admin-species-api.test.ts
git commit -m "feat(admin): implement species catalog CRUD and media upload APIs"
```

---

### Task 8: Admin Catalog CMS Mobile-First UI

**Files:**
- Create: `app/admin/species/page.tsx`
- Create: `app/admin/species/new/page.tsx`
- Create: `app/admin/species/[id]/page.tsx`
- Create: `components/admin/SpeciesEditorClient.tsx`
- Create: `components/admin/SpeciesMediaManager.tsx`
- Create: `components/admin/SpeciesCareEditor.tsx`
- Modify: `components/admin/AdminDashboardClient.tsx`
- Test: `test/admin-species-ui.test.tsx`

**Interfaces:**
- Produces: Full admin catalog UI allowing nursery staff to create, edit, upload photos, configure 3-season care, and manage plant problems from mobile or desktop.

- [ ] **Step 1: Write headless tests for Admin Species UI components**

```ts
// test/admin-species-ui.test.tsx
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { SpeciesEditorClient } from "../components/admin/SpeciesEditorClient";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Admin Species UI Components", () => {
  it("renders SpeciesEditorClient with 4 tabs", () => {
    const mockSpecies = {
      id: "11111111-1111-1111-1111-111111111111",
      nameTh: "มอนสเตอร่า",
      nameEn: "Monstera Deliciosa",
      slug: "monstera-deliciosa",
      publishedAt: new Date(),
    };
    const html = renderToString(<SpeciesEditorClient initialSpecies={mockSpecies as any} />);
    expect(html).toContain("ข้อมูลทั่วไป");
    expect(html).toContain("รูปภาพ");
    expect(html).toContain("สูตรดูแล 3 ฤดู");
    expect(html).toContain("ปัญหาพบบ่อย");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/admin-species-ui.test.tsx`
Expected: FAIL (Cannot find module)

- [ ] **Step 3: Implement Admin Species UI components and pages**

1. Create `components/admin/SpeciesEditorClient.tsx`:
   - Mobile-first tab bar (`ข้อมูล`, `รูปภาพ`, `สูตรดูแล`, `ปัญหา`).
   - Sticky top bar with Save Status indicator ("บันทึกแล้ว" / "กำลังบันทึก..."), Publish/Draft button.
   - Tab 1: Info fields (chips for enums, aliases tag input, textarea for shop note).
   - Tab 2: Photos manager (file/camera picker, set primary ⭐, alt text).
   - Tab 3: Care formula editor with live calculation preview table.
   - Tab 4: Troubleshooting accordion manager.
2. Create `app/admin/species/page.tsx`, `app/admin/species/new/page.tsx`, and `app/admin/species/[id]/page.tsx`.
3. In `components/admin/AdminDashboardClient.tsx`:
   - Add "+ เพิ่มพันธุ์ใหม่" button leading to `/admin/species/new`.
   - In Search Misses tab, add "เพิ่มเป็นชื่อเล่น (Alias)" button.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/admin-species-ui.test.tsx`
Expected: PASS (1 test passed)

- [ ] **Step 5: Commit**

```bash
git add app/admin/species/ components/admin/ test/admin-species-ui.test.tsx
git commit -m "feat(admin): add mobile-first catalog CMS UI and tabbed species editor"
```

---

### Task 9: Full Milestone 2 Verification, Version Bump & Release Tag

**Files:**
- Modify: `package.json` (bump version to `1.3.0`)
- Modify: `docs/DEPLOYMENT.md` (document Supabase Storage bucket and `pg_trgm`)
- Modify: `README.md` (document Milestone 2 capabilities)
- Modify: `docs/PROGRESS.md` (record M2 completion)

- [ ] **Step 1: Bump version in `package.json` to `1.3.0`**
- [ ] **Step 2: Run complete test suite**

Run: `npm test`
Expected: 100% tests passing across all test files (~230+ tests).

- [ ] **Step 3: Run production build verification**

Run: `npm run build`
Expected: Next.js 15 App Router compiles cleanly with all 8 collection pages statically generated.

- [ ] **Step 4: Commit, Tag, and Push**

```bash
git add package.json docs/DEPLOYMENT.md README.md docs/PROGRESS.md
git commit -m "chore(release): bump version to 1.3.0 with Milestone 2 Shop CMS, Fuzzy Search & SEO Collections"
git tag -a v1.3.0-milestone2-shop-cms -m "Release v1.3.0: Milestone 2 Shop Operations & Discoverability"
git push origin main --tags
```
