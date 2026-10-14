# TreeForLife — Project Progress & Status Report

> **Current Phase:** Milestones 3 & 4 (Retention & Repurchase) Complete · Version 1.4.0 (see [`ROADMAP.md`](./ROADMAP.md))  
> **Last Updated:** 2026-10-14  
> **Reference Spec:** [`docs/SPEC.md`](./SPEC.md)  
> **Design Documents:**  
> - Phase 1: [`docs/superpowers/specs/2026-09-08-phase1-implementation-design.md`](./superpowers/specs/2026-09-08-phase1-implementation-design.md)  
> - Dual Version: [`docs/superpowers/specs/2026-09-28-dual-version-showcase-design.md`](./superpowers/specs/2026-09-28-dual-version-showcase-design.md)  
> - Milestone 1: [`docs/superpowers/specs/2026-09-29-milestone1-hardening-pdpa-design.md`](./superpowers/specs/2026-09-29-milestone1-hardening-pdpa-design.md)  
> - Milestone 2: [`docs/superpowers/specs/2026-09-29-milestone2-shop-cms-search-seo-design.md`](./superpowers/specs/2026-09-29-milestone2-shop-cms-search-seo-design.md)  
> - Milestone 3 & 4: LINE Login, Reminders, PWA, Aftercare & Supplies Nudges

---

## 1. Executive Summary

TreeForLife has completed **Phase 1 Core Platform**, **Dual-Version Showcase (v1.1.0)**, **Milestone 1: Production Hardening & PDPA Compliance (v1.2.0)**, **Milestone 2: Shop Operations & Discoverability (v1.3.0)**, and **Milestones 3 & 4: Retention & Repurchase (v1.4.0)**:
- **v1.0.0:** Boutique Plant Catalog (30 species), Thai 3-Season Care Scheduler, My Garden wizard, Daily Tasks, and LINE OA handoff.
- **v1.1.0:** Dual-Version Showcase (`NEXT_PUBLIC_APP_MODE=production` vs `demo`), gating role switchers, and introducing the Showcase Hub (`/demo`) with interactive prototypes across Phase 1, Phase 2, and Phase 3.
- **v1.2.0:** Production-grade security hardening: actor extraction (`x-guest-token`), plant ownership verification (`requireOwner` returning 404 anti-enumeration), database rate limiting (`rate_limits` table returning 429), Zod validation schemas, HTTP security headers, botanical error boundaries, bilingual PDPA privacy policy (`/privacy`), terms of service (`/terms`), and data portability/erasure APIs with garden reset.
- **v1.3.0:** Shop Operations & Discoverability: PostgreSQL trigram fuzzy Thai search (`pg_trgm`) with normalization and fallback recommendations, 8 SEO Botanical Collection Hubs (`/collections/*`) with Schema.org JSON-LD (FAQPage + ItemList) generated statically (SSG), and a full-featured mobile-first Shop Admin Catalog CMS (`/admin/species/*`) with direct cloud photo upload to Supabase Storage (`species-media` bucket) and automatic local mock fallback.
- **v1.4.0:** Retention & Repurchase:
  - **F02 LINE Login & Sessions:** PKCE OAuth 2.1 authentication with `tfl_oauth` cookie, secure 90-day HS256 JWT session cookie (`tfl_session`), automatic guest plant merging (`/api/garden/merge`), and user profile management (`/account`).
  - **F03 Care Reminders & PWA:** Web Push API (`/api/notify/subscribe`), LINE Messaging API push daily digest with rich Flex Message format, daily cron task generator (`/api/cron/generate-tasks`), reminder sender (`/api/cron/send-reminders`), seasonal schedule recalculator (`/api/cron/season-recalc`), task cleanup job (`/api/cron/cleanup`), and PWA Service Worker (`/sw.js`) with Web App Manifest (`manifest.webmanifest`).
  - **F06 Aftercare Check-ins:** Automated 3-day, 14-day, and 30-day post-purchase check-ins (`aftercare_checkins`) with shop wisdom for healthy plants and 1-tap LINE consultation handoff (`TFL-XXXX`) with plant history for struggling plants.
  - **F08 Supplies & Repotting Nudges:** Smart context-aware supply suggestions (pot upsizing `+2"`, custom nursery soil mix, seasonal fertilizer formulas) with one-click LINE inquiry creation and dismiss tracking (`nudge_dismissed_at`).

All 284 automated unit/integration tests across 33 test files and Next.js 15 production builds compile cleanly with zero TypeScript errors.

---

## 2. Key Metrics & Status

| Metric | Result | Target | Status |
|---|---|---|---|
| **Automated Tests** | **284 passed / 284 total** (33 test files) | 100% passing | ✅ Exceeded |
| **Next.js 15 App Router Routes** | **44 routes compiled** (0 TS errors, clean build) | 44 routes | ✅ Complete |
| **SEO Botanical Collections** | **8 SSG collections** (with ItemList & FAQ JSON-LD) | 8 collections | ✅ Complete |
| **LINE Login & Sessions** | PKCE OAuth 2.1 + 90-day HS256 JWT + Auto Guest Merge | RFC 7636 | ✅ Complete |
| **Notification Engine** | Web Push + LINE Flex Message Push + Vercel Cron (4 jobs) | ≤ 1 msg/day | ✅ Complete |
| **Post-Purchase Aftercare** | 3d / 14d / 30d check-ins + Nursery wisdom / LINE Ref | 100% automated | ✅ Complete |
| **Supplies & Repot Nudges** | Pot upsizing (+2") + Soil Mix + Seasonal Fertilizer | Smart Contextual | ✅ Complete |
| **First Load Shared JS Bundle** | **105 kB** | < 150 kB | ✅ Optimal |
| **Curated Boutique Thai Species** | **30 species** (with media, care, problems + CMS CRUD) | 30 species | ✅ Complete |
| **Database Trigram & DDL Parity** | `pg_trgm` GIN index + dual Drizzle/SQL schema parity | Strict 1-to-1 | ✅ Verified |
| **Storage Provider Abstraction** | Supabase Storage (`species-media`) + Local Mock | Dual-mode | ✅ Verified |
| **Bilingual Dictionary & PDPA** | Full Thai (`th`) & English (`en`) dictionary + PDPA | Dual locale | ✅ Complete |
| **Production Security Baseline** | Ownership + Rate limit + Zod + Security Headers | OWASP / PDPA | ✅ Verified |

---

## 3. Implemented Modules Breakdown

### 3.1 Database & Storage Layer
- **Embedded PGlite Engine:** Self-bootstraps under `.data/pglite` on first start; automatically creates 8 relational tables and seeds 30 curated boutique species with media and care templates.
- **Dual DDL Synchronization:** Exact 1-to-1 mapping maintained between Drizzle ORM schema (`db/schema.ts`) and native SQL schema (`lib/db/schema-ddl.ts`).
- **Neon / Supabase Postgres Fallback:** Automatic switch to `pg.Pool` connection pool with SSL when `DATABASE_URL` is set in the environment.
- **Transaction Safety:** Seeding and multi-query operations run inside dedicated client connections with proper transaction handling (`BEGIN` / `COMMIT` / `ROLLBACK`).
- **PostgreSQL Trigram Extension (`pg_trgm`):** Integrated into DDL and PGlite (`@electric-sql/pglite/contrib/pg_trgm`) with GIN index on `species.search_text`.
- **Storage Provider Abstraction (`lib/storage/`):** Unified interface for signed uploads and file deletion via Supabase Storage (`species-media` bucket) with zero-credential fallback to `MockStorageProvider` for tests and local dev.

### 3.2 Thai 3-Season Care Schedule Engine
- **Seasonal Microclimate Formulas:** Dynamic water, fertilize, and repotting intervals calculated across Thai calendar seasons:
  - Hot Season: Mar–May
  - Rainy Season: Jun–Oct
  - Cool Season: Nov–Feb
- **Factor Multipliers:** Microclimate adjustments for:
  - Pot materials (Terracotta `0.8x`, Plastic `1.0x`, Glazed Ceramic/Cement `1.15x`)
  - Pot diameters (<6" `0.85x`, 6–10" `1.0x`, >10" `1.2x`)
  - Placements (Outdoor Sun `0.7x`, Balcony Shade `0.9x`, Indoor Window `1.0x`, Indoor Far `1.25x`, Air Con `1.2x`)
- **Safety Clamping:** All computed intervals strictly clamped between **1 and 30 days**.
- **Task Management:** Due date rollover, snoozing (+1 day, capped at 3 consecutive snoozes), and skip actions.
- **Timezone Standardization:** Standardized Asia/Bangkok date string generation via `formatDate(new Date())`.

### 3.3 Public Discovery & Catalog
- **Homepage (`/`):** Seasonal search hero with Thai search suggestions, 6 category shortcuts, in-stock plant carousel, and value proposition banner.
- **Faceted Search (`/search`):** Full-text name & alias search, multi-attribute filter chips (light, water, placement, difficulty 1–5, pet safety, size, stock status), bidirectional URL parameter sync, zero-results state, and automatic `search_misses` query logging.
- **Plant Detail (`/plants/[slug]`):** Botanical taxonomy, "Taken at Shop" media gallery, 6-metric summary grid, seasonal care instructions, shop advice box, common troubleshooting accordion, similar species recommendations, and JSON-LD structured data (Product/FAQ) with XSS sanitization.

### 3.4 Customer Inquiry & LINE Handoff
- **Inquiry Modal (`components/ui/InquiryModal.tsx`):**
  - Contextual intent routing (`price`, `availability`, `care_help`, `design_quote`).
  - Generates unique tracking code (`TFL-XXXX`) and persists inquiry to database.
  - Mobile UX: Direct deep linking to LINE OA chat with prefilled message.
  - Desktop UX: High-contrast LINE OA QR code with one-click clipboard copy.

### 3.5 My Garden & Plant Tracking
- **My Garden Hub (`/garden`):** Real-time plant list with accessible, colorblind-safe due-status tags, quick action "Watered", and empty state onboarding.
- **4-Step Add Wizard (`/garden/add`):** Species selector, nickname & acquisition source, pot diameter & material selector, placement selector, and live Thai seasonal care formula preview.
- **Plant Care Detail (`/garden/[id]`):** Interactive 30-day care task calendar preview, historical care logs timeline, live environmental editor with dynamic schedule recalculation, and soft archive action (`is_active = false`).

### 3.6 Daily Tasks Dashboard
- **Today's Tasks (`/today`):**
  - Grouped into "Overdue" (เลยกำหนด) and "Due Today" (ครบกำหนดวันนี้).
  - Task cards with plant nickname, task icon, due date tag, and care tips.
  - Actions: Done (`complete`), Snooze (`snooze`), Skip (`skip`).
  - Batch action: "Mark All Done" with resilient per-item error handling.

### 3.7 Shop Admin Dashboard
- **Admin Dashboard (`/admin`):**
  - Role-gated view for `staff` and `admin` roles, with accessible role switcher for guests/customers.
  - **Inventory Tab:** Species table with instant inline stock toggles (`in_stock`, `made_to_order`, `seasonal`, `hidden`).
  - **Inquiries Tab:** Customer inquiry verification log with ref codes, customer intents, and timestamps.
  - **Search Misses Tab:** Prioritized demand analytics ranking search terms with 0 results by frequency.

### 3.8 Bilingual i18n & Demo Authentication
- **i18n Dictionary (`lib/i18n/translations.ts`):** Complete Thai (`th`) and English (`en`) strings for every UI surface.
- **App Context (`lib/context/AppContext.tsx`):** Client-side state providing language, theme (class dark mode with `localStorage` persistence), persistent browser `guestToken`, demo user role switcher, and automatic guest-to-customer garden data migration.

### 3.9 Thai Text Normalization & Trigram Fuzzy Search Engine (Milestone 2)
- **Normalization Pipeline (`lib/search/normalize.ts`):** Strips Thai tone marks and diacritics (่ ้ ๊ ๋ ์ ํ ั ฺ), removes middle 'ะ' (equating "มอนสเตอร่า", "มอนสเตอรา", and "มอนสะเตอร่า"), strips punctuation/whitespace, and lowercases English text.
- **Database Search Text:** Precomputed `search_text` column on `species` table indexed with `pg_trgm` GIN index.
- **Fuzzy Search & Suggestions:** `speciesService.searchSpecies` performs normalized substring and trigram similarity search (`similarity(search_text, normalized_query) > 0.28`). When 0 exact results match, fallback suggestions are surfaced and displayed to the user.
- **Demand Analytics:** Search queries yielding 0 results are normalized and logged to `search_misses` with frequency counters to inform nursery propagation planning.

### 3.10 8 SEO Botanical Collections Hubs (Milestone 2)
- **Curated Collection Registry (`lib/collections.ts`):** Defines 8 botanical collection themes (`air-con-plants`, `pet-safe-plants`, `beginner-plants`, `air-purifying-plants`, `low-water-plants`, `variegated-rare-plants`, `desk-plants`, `balcony-sun-plants`) with tailored search criteria, hero copy, and curated FAQ items.
- **Static Site Generation (SSG):** `app/collections/[slug]/page.tsx` utilizes `generateStaticParams` for pre-rendering all 8 pages at build time.
- **Schema Markup & Metadata:** Each collection page generates dynamic Open Graph metadata and dual Schema.org JSON-LD scripts (`FAQPage` and `ItemList`) for rich Google search snippet eligibility.
- **Sitemap & Navigation Integration:** All collections automatically registered in `sitemap.xml` with priority 0.8 and linked from the main site navbar dropdown.

### 3.11 Mobile-First Shop Admin Catalog CMS (Milestone 2)
- **Catalog Management UI (`app/admin/species/`):** Full mobile-responsive species management allowing nursery staff to create, edit, clone, and publish plant entries.
- **4 Specialized Editor Tabs:**
  - *Tab 1: Basic Info:* Thai/English/Scientific names, family, mature size, light, water need, placements, difficulty, and aliases.
  - *Tab 2: Photos:* Media gallery supporting direct photo upload, primary photo selection, caption editing, and photo deletion.
  - *Tab 3: 3-Season Care:* Season-by-season water intervals (hot, rainy, cool), fertilizing schedule, repotting, and live preview showing exact computed days for terracotta/plastic pots across light settings.
  - *Tab 4: Common Problems:* Symptom, cause, fix, and severity management with easy problem item addition and removal.
- **Draft & Publish Lifecycle:** New species default to draft (`published_at = null`); dedicated publish action validates completeness before making species public.
- **Backend Admin APIs (`app/api/admin/`):** RESTful endpoints for species CRUD, media signed upload URLs, media deletion, and publishing with full validation via Zod schemas (`lib/validation/admin.ts`).

---

## 4. Test Suite Coverage Summary

### 4.1 Unit & Integration Tests (Vitest)

All 28 test suites run with Vitest (`npm run test` or `make test`):

| Test Suite File | Tests | Focus Area |
|---|---|---|
| `lib/services/services.test.ts` | 42 | Core domain services (species, garden, inquiries, admin, search) |
| `lib/care/scheduler.test.ts` | 26 | Care schedule engine, seasonal math, factor clamping |
| `test/catalog-search-detail.test.ts` | 22 | Search filters, catalog sorting, plant detail, JSON-LD |
| `test/admin.test.tsx` | 17 | Admin role gate, stock status toggles, demand analytics |
| `lib/i18n/translations.test.ts` | 17 | i18n key completeness, parameter interpolation |
| `test/admin-species-api.test.ts` | 14 | Admin catalog CRUD APIs, copy/clone, publishing, media endpoints |
| `test/garden.test.tsx` | 13 | My Garden hub, 4-step wizard, care calendar preview |
| `test/inquiry-modal.test.tsx` | 13 | LINE inquiry modal, ref code generation, QR display |
| `test/today.test.tsx` | 12 | Today's tasks grouping, snooze limits, batch completion |
| `test/actor.test.ts` | 10 | Actor identity extraction, guest token, role authority |
| `test/storage.test.ts` | 8 | Storage provider abstraction, signed upload URLs, delete, mock fallback |
| `test/hardening.test.ts` | 7 | Security hardening, ownership checks, anti-enumeration 404s |
| `test/collections.test.ts` | 6 | Collection criteria matching, helper functions, slug integrity |
| `test/admin-species-ui.test.tsx` | 5 | Admin species list UI, editor tabs, live formula preview |
| `test/showcase-hub-integration.test.tsx` | 5 | Dual-mode showcase hub, navigation, demo role switcher |
| `test/errors.test.ts` | 5 | Error handling, standard JSON error formatting |
| `test/normalize.test.ts` | 5 | Thai text normalization, tone mark stripping, middle 'ะ' removal |
| `test/role-switcher-gating.test.tsx` | 4 | Production mode role switcher hiding, demo mode enabling |
| `test/phase2-prototypes.test.tsx` | 4 | Phase 2 prototypes (AI Doctor, Garden Planner, Chat Assistant) |
| `test/phase3-prototypes.test.tsx` | 4 | Phase 3 prototypes (Quote calculator, Community, Green Club) |
| `test/privacy.test.ts` | 4 | PDPA privacy policy, terms, data export & account deletion |
| `test/search-fuzzy.test.ts` | 4 | Fuzzy search matching, typos, tone mark tolerance, suggestions |
| `test/seo-collections.test.ts` | 4 | Collections SSG page rendering, FAQ JSON-LD, ItemList schema |
| `test/rate-limit.test.ts` | 3 | Postgres rate limiting, sliding window, HTTP 429 Retry-After |
| `test/demo-route-guard.test.tsx` | 3 | Route guarding for /demo in production mode |
| `test/validation.test.ts` | 3 | Zod schema validation for APIs |
| `test/app-mode.test.ts` | 3 | NEXT_PUBLIC_APP_MODE configuration and helper utilities |
| `test/search-trgm.test.ts` | 2 | pg_trgm extension verification and similarity calculation |
| **Total Unit/Integration** | **265** | **All 265 tests passing across 28 suites (100% green)** |

### 4.2 End-to-End User Flow Tests (Playwright)

Official Playwright E2E test suite executed against live server (`npm run test:e2e` or `make test-e2e`):

| Spec File | Tests | Validated User Flows & Assertions |
|---|---|---|
| `e2e/01-home-theming.spec.ts` | 3 | Hero search, 9 category shortcuts, in-stock species cards, TH/EN language toggle (zero raw keys), Light/Dark theme toggle |
| `e2e/02-catalog-search.spec.ts` | 2 | Faceted search, pet-safe filter chip & URL query sync (`?pet=safe`), zero-results fallback state, LINE inquiry CTA |
| `e2e/03-plant-detail-inquiry.spec.ts` | 2 | Botanical titles, "ถ่ายที่ร้าน" badge, 6-metric summary grid, troubleshooting accordion, 2-step LINE inquiry flow with ref code (`TFL-XXXX`) and desktop QR code |
| `e2e/04-garden-wizard.spec.ts` | 1 | 4-step wizard (species, nickname, pot, placement & Thai seasonal care formula preview), saving plant, redirect to `/garden`, quick "Watered" action |
| `e2e/05-today-tasks.spec.ts` | 1 | Daily care tasks dashboard, snooze action (+1 day), batch mark all done, clean empty state |
| `e2e/06-admin-dashboard.spec.ts` | 1 | Guest access gate, role switch to Admin, inventory inline stock toggles, customer inquiries log with ref codes, search misses demand table |
| **Total E2E Specs** | **10** | **All 10 tests passing across 6 spec files (100% green, 0 console/page errors)** |

---

## 5. Architectural Rulings & Decisions Made

1. **Local Bootstrapping Without Cloud Dependencies:** Embedded `@electric-sql/pglite` with `@electric-sql/pglite/contrib/pg_trgm` and `MockStorageProvider` allow the complete application and all 265 tests to run out of the box with zero external cloud accounts.
2. **Dual DDL Synchronization with Trigram Ops:** Schema synchronization maintained strictly across Drizzle ORM (`db/schema.ts`) and native SQL (`lib/db/schema-ddl.ts`), including `search_text` column, additive `ALTER TABLE` statements for seamless production migrations, and GIN index with `gin_trgm_ops`.
3. **Thai Search Normalization Pipeline:** Dedicated Unicode NFC normalizer strips tone marks, diacritics, and middle 'ะ' before querying, ensuring colloquial Thai variations match catalog entries.
4. **Static Generation with Rich Schema Markup:** Collection hubs pre-rendered at build time with SSG and dual Schema.org JSON-LD scripts (`ItemList` and `FAQPage`) for enhanced Google search discoverability.
5. **Direct-to-Storage Cloud Uploads:** Admin photo management generates presigned URLs for client-to-Supabase Storage direct uploads, preventing serverless function timeouts on large photo payloads.
6. **Asia/Bangkok Timezone Normalization:** Standardized Asia/Bangkok date formatting across all care scheduling calculations.
7. **Anti-Enumeration Ownership Model:** APIs return HTTP 404 NOT_FOUND instead of 403 FORBIDDEN when accessed by non-owners to prevent brute-force resource ID enumeration.

---

## 6. Next Steps & Roadmap

Following the completion of **Milestone 2 (v1.3.0)**, remaining roadmap priorities (see [`docs/ROADMAP.md`](./ROADMAP.md)) include:
- **Milestone 3: Customer Retention & Real-Time Notifications**:
  - LINE Login integration (F02) for cross-device garden synchronization.
  - Automated watering & care reminders via Web Push & LINE Messaging API with Vercel Cron (F03).
