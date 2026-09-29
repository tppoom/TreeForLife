# Design Spec: Milestone 2 — Shop Operations & Discoverability (M2)

**Date:** 2026-09-29  
**Status:** Approved for Implementation  
**Target Repository:** `tppoom/TreeForLife` (`/Users/tppoom/Desktop/Projects/TreeForLife`)  
**Milestone:** M2 (Shop CMS, Real Photos, Fuzzy Thai Search & SEO Collections)  
**Covers:** `docs/features/F04-fuzzy-thai-search.md` + `docs/features/F13-seo-collections.md` + `docs/features/F01-admin-catalog-cms.md`  

---

## 1. Executive Summary & Goals

Milestone 1 established a secure, hardened baseline with PDPA compliance (v1.2.0). Now, **Milestone 2** transitions TreeForLife from a demo catalog into an active, operational nursery platform:

1. **Authentic Shop Credibility (F01)**:
   - Provide a mobile-first Admin Catalog CMS so nursery staff can add/edit species, care formulas, and common plant problems in ≤ 5 minutes directly from a smartphone.
   - Introduce cloud media storage (Supabase Storage with local dev fallback) allowing staff to replace Unsplash stock photos with authentic photos taken at the nursery, reinforcing core principle **P6 (Authentic Shop Credit)**.
2. **Frictionless Discovery (F04)**:
   - Thai botanical transliteration varies widely among buyers (e.g., "มอนสเตอร่า", "มอนสเตอรา", "มอนสะเตอร่า").
   - Implement intelligent Thai text normalization and PostgreSQL trigram fuzzy search (`pg_trgm`), eliminating search misses and providing automatic "Did you mean?" suggestions.
3. **Organic Customer Acquisition (F13)**:
   - Buyers search Google for solutions rather than scientific plant names (e.g., "ต้นไม้ห้องแอร์", "ต้นไม้ปลอดภัยกับแมว").
   - Launch 8 curated botanical collection hubs (`/collections/*`) with expert nursery commentary, Schema.org JSON-LD FAQ/ItemList markup, and optimized sitemaps for Google SEO.

---

## 2. Architecture & System Flow

```
                                 [ User / Visitor ]
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
       [ Fuzzy Search (F04) ]                       [ SEO Collections (F13) ]
  • Normalization (lib/search/normalize.ts)    • Curated hubs (lib/collections.ts)
  • Trigram Similarity (pg_trgm)               • 8 landing pages (/collections/[slug])
  • Suggestion ("หมายถึง ... ใช่ไหม?")         • JSON-LD FAQPage & ItemList
  • Search Misses Resolution                   • Deep link to LINE consultation
                   │                                           │
                   └─────────────────────┬─────────────────────┘
                                         ▼
                             [ Public Catalog APIs ]
                     (Filtered: published_at IS NOT NULL
                      AND stock_status <> 'hidden')
                                         ▲
                                         │
                                         │
                               [ Nursery Staff / Admin ]
                                         │
                                         ▼
                            [ Admin Catalog CMS (F01) ]
                 • Auth: requireStaff(actor) via Basic Auth / Session
                 • Tabs: Info · Media · 3-Season Care · Common Problems
                 • Live formula preview (same calculation engine as client)
                 • Client-side WebP compression (<canvas>, 1600px, q0.8)
                 • Direct-to-Cloud Upload (Signed Upload URLs)
                 • One-click Publish / Draft status toggle
```

---

## 3. Detailed Component Specifications

### 3.1. Fuzzy Thai Search Engine (`F04`)

#### 3.1.1 Normalization Pipeline (`lib/search/normalize.ts`)
Creates a deterministic canonical string from raw Thai and Latin botanical queries:
1. Unicode NFC normalization.
2. Lowercase English characters.
3. Strip whitespace, hyphens, underscores, punctuation (`.`, `,`, `/`, `(`, `)`).
4. Strip Thai tone marks and diacritics:
   - `่ ้ ๊ ๋ ็ ์ ํ ฺ` (Unicode range `U+0E47` to `U+0E4E`, `U+0E3A`).
5. Strip standalone `ะ` inside Thai words (e.g., `"มอนสะเตอร่า"` -> `"มอนสเตอรา"`).
6. Return trimmed normalized string.

#### 3.1.2 Database Trigram Extension & Search Text
- **Extension**: Enable `pg_trgm` on PostgreSQL and `@electric-sql/pglite/contrib/pg_trgm` on local PGlite.
- **Column**: Add `search_text TEXT` to `species` table containing pre-computed normalized representation of:
  `name_th ‖ ' ' ‖ name_en ‖ ' ' ‖ name_sci ‖ ' ' ‖ array_to_string(aliases, ' ')`
- **Index**: `CREATE INDEX IF NOT EXISTS species_search_trgm ON species USING gin (search_text gin_trgm_ops);`
- **Query Ranking**:
  ```sql
  SELECT *,
    GREATEST(similarity(search_text, $q), word_similarity($q, search_text)) AS score
  FROM species
  WHERE published_at IS NOT NULL AND stock_status <> 'hidden'
    AND (search_text ILIKE '%' || $q || '%' OR $q <% search_text)
  ORDER BY (search_text ILIKE $q || '%') DESC, score DESC
  LIMIT 50;
  ```
- **Fuzzy Suggestions**: If 0 exact results found, check for species with score `0.2 <= score < 0.35`. If found, return suggestion `{ didYouMean: { name: species.nameTh, slug: species.slug } }`.
- **Search Misses Enhancement**:
  - Add `normalized_query TEXT`, `suggested_species_id UUID REFERENCES species(id)`, and `resolved_at TIMESTAMPTZ` to `search_misses`.
  - Admin button in dashboard: "เพิ่มเป็นชื่อเล่น (Alias)" to link missed query directly to existing species.

---

### 3.2. Curated Botanical Collections & SEO Engine (`F13`)

#### 3.2.1 Collection Definitions (`lib/collections.ts`)
8 static, code-defined collections tailored to Thai household needs:
1. `air-con-plants` ("ต้นไม้ห้องแอร์"): Plants thriving in dry air-conditioned rooms (ZZ plant, Snake plant, Peace lily).
2. `pet-safe-plants` ("ปลอดภัยกับสัตว์เลี้ยง"): 100% non-toxic plants verified safe for cats and dogs.
3. `beginner-plants` ("มือใหม่เลี้ยงง่าย"): Resilient species tolerating irregular watering.
4. `full-sun-plants` ("ต้นไม้ทนแดดจัด"): Heat-tolerant outdoor and balcony species.
5. `bathroom-plants` ("ต้นไม้ในห้องน้ำ"): High humidity and low indirect light lovers (Ferns, Pothos).
6. `low-light-plants` ("ต้นไม้แสงน้อย"): Species flourishing far from windows.
7. `desk-plants` ("ต้นเล็กวางโต๊ะทำงาน"): Compact tabletop companions (<8" pots).
8. `balcony-plants` ("ต้นไม้ระเบียงคอนโด"): Wind and afternoon-sun resistant plants.

#### 3.2.2 Dynamic Collection Pages (`app/collections/[slug]/page.tsx`)
- Server Component with `generateStaticParams()` pre-rendering all 8 collections.
- Layout:
  - Botanical Hero: Title, category badge, and 100–150 word authentic care commentary from nursery staff.
  - Curated Species Grid: Real-time inventory matching collection criteria with in-stock priority.
  - Educational FAQ Accordion: 3–5 practical questions with localized answers.
  - Floating Nursery Action: "ไม่แน่ใจว่าต้นไหนเหมาะกับพื้นที่คุณ? ปรึกษาผู้เชี่ยวชาญผ่าน LINE" deep-linking to `@TreeForLife` with `source_page=/collections/[slug]`.
  - Structured Data (JSON-LD): Rich snippet `FAQPage` and `ItemList` schemas with script injection escaping.
- Hub Page (`app/collections/page.tsx`): Overview directory of all 8 collections.
- Integration: Update homepage shortcuts and `sitemap.xml` with all collection URLs.

---

### 3.3. Admin Catalog CMS & Media Upload Engine (`F01`)

#### 3.3.1 Media Storage Abstraction (`lib/storage/index.ts`)
- Interface:
  ```ts
  export interface StorageProvider {
    createSignedUploadUrl(opts: { path: string; contentType: string }): Promise<{ uploadUrl: string; publicUrl: string }>;
    deleteFile(path: string): Promise<boolean>;
  }
  ```
- **Supabase Storage Provider**: Uses Supabase Storage REST API with service role key for bucket `species-media` (public read).
- **Local Dev/Test Provider**: Mock provider storing assets in `.data/uploads` with instantaneous memory/file verification, ensuring tests and local development function with 0 external API keys.

#### 3.3.2 Data Model Additions
```sql
ALTER TABLE species ADD COLUMN IF NOT EXISTS copied_from_id UUID REFERENCES species(id) ON DELETE SET NULL;
ALTER TABLE species_media ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE species_media ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
CREATE UNIQUE INDEX IF NOT EXISTS species_media_one_primary ON species_media (species_id) WHERE is_primary;
```

#### 3.3.3 Admin Endpoints (`/api/admin/species/*` & `/api/admin/media/*`)
All endpoints protected by `requireStaff(actor)`:
- `GET /api/admin/species`: Full species listing including drafts (`published_at IS NULL`) and stock status.
- `POST /api/admin/species`: Create draft species. Supports `copyFromId` to copy care formulas and environment traits without duplicating names/photos.
- `GET /api/admin/species/[id]`: Full details for editor tabs.
- `PATCH /api/admin/species/[id]`: Update fields with optimistic locking (`updatedAt` check).
- `POST /api/admin/species/[id]/publish`: Validate completeness (>= 1 photo, primary photo set, 3-season formula, shopNote) and mark published.
- `POST /api/admin/species/[id]/unpublish`: Revert to draft.
- `DELETE /api/admin/species/[id]`: Delete species and remove associated media.
- `POST /api/admin/media/upload-url`: Request signed upload URL for browser upload.
- `POST /api/admin/media`: Verify uploaded file and insert `species_media` row.
- `DELETE /api/admin/media/[id]`: Delete photo from database and storage.
- `PATCH /api/admin/media/[id]/primary`: Toggle primary photo status.

#### 3.3.4 Admin Mobile-First UI (`app/admin/species/*`)
1. **`/admin` Updates**:
   - Header with "+ เพิ่มพันธุ์ใหม่" button.
   - Species management table/grid with thumbnail, draft/published badges, and quick stock toggles.
   - Search misses table with one-click "เพิ่มเป็นชื่อเล่น" button.
2. **`/admin/species/new`**:
   - Rapid draft creation (Thai name, English name, auto-slug, optional "คัดลอกจากพันธุ์อื่น" template picker).
3. **`/admin/species/[id]` (Tabbed Editor)**:
   - **Tab 1: ข้อมูล (Info)**: Taxonomy, difficulty chips, light/water/placement chips, aliases tag input, shop note.
   - **Tab 2: รูปถ่าย (Photos)**: Camera/file picker, client-side WebP compression (1600px max, q0.8), primary photo star, alt text, credit ("ถ่ายที่ร้าน").
   - **Tab 3: สูตรดูแล 3 ฤดู (Care Formulas)**: 3-season watering days, fertilizer pause months, live client-side calculation preview table across 3 test scenarios (Terracotta 6" Balcony, Plastic 8" Window, Ceramic 12" Air-con).
   - **Tab 4: ปัญหาพบบ่อย (Troubleshooting)**: Interactive accordion manager (symptom, cause, remedy, severity badge).

---

## 4. Security & Permissions

1. **Staff Authorization**: All `/api/admin/*` and admin pages require authentication (`requireStaff(actor)`).
2. **Safe Public Scoping**: All public queries in `speciesService.ts` strictly filter `published_at IS NOT NULL AND stock_status <> 'hidden'`, guaranteeing drafts and private inventory are never exposed to public crawlers or guests.
3. **Input Validation**: Strict Zod schemas for all species updates (`AdminSpeciesCreateSchema`, `AdminSpeciesUpdateSchema`, `AdminCareUpdateSchema`, `AdminProblemUpdateSchema`).
4. **Rate Limiting**: Admin routes protected against automated abuse.

---

## 5. Verification & Testing Strategy

- **TDD Requirement**: Every module starts with failing tests before implementation.
- **Coverage**:
  - `test/normalize.test.ts`: Thai text normalization and diacritic stripping.
  - `test/search-fuzzy.test.ts`: Trigram query matching, thresholding, and suggestion handling.
  - `test/collections.test.ts`: Collection definitions, slugs, SEO metadata, JSON-LD escaping.
  - `test/admin-species.test.ts`: Species CRUD, draft/publish lifecycle, optimistic concurrency.
  - `test/admin-media.test.ts`: Signed upload URL generation, media record lifecycle, primary photo constraint.
- **Regression**: All existing 217 tests must remain 100% green.
- **Production Build**: Zero TypeScript errors, static generation of collection pages (`npm run build`).
- **Release**: Version bump to `1.3.0`, release tag `v1.3.0-milestone2-shop-cms`.
