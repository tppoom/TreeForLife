# Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete Phase 1 boutique plant shop and plant-care platform for TreeForLife from scratch, including embedded PGlite database with 30-species seeding, Thai 3-season care schedule engine, bilingual TH/EN catalog, My Garden plant tracking, daily care tasks, shop admin dashboard, and LINE handoff.

**Architecture:** Layer-first architecture: project foundation and dependencies $\rightarrow$ dual-schema database and 30-species seed dataset $\rightarrow$ Thai 3-season care scheduler engine with TDD unit tests $\rightarrow$ domain services & REST API routes $\rightarrow$ bilingual/theming AppContext and layout $\rightarrow$ public catalog, search, and plant detail pages $\rightarrow$ LINE inquiry modal $\rightarrow$ My Garden wizard, schedule view, and daily tasks $\rightarrow$ shop admin dashboard $\rightarrow$ end-to-end verification.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS (class dark mode), Drizzle ORM, PGlite (`@electric-sql/pglite`), Lucide React, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-08-phase1-implementation-design.md`

## Global Constraints
- Framework: Next.js 15 App Router with React 19.
- Styling: Tailwind CSS with class-based dark mode (`darkMode: "class"`).
- Dual database schema: every change in `db/schema.ts` must be mirrored in `lib/db/schema-ddl.ts`.
- Zero external database dependency for local dev: boots embedded PGlite under `.data/pglite`, auto-seeds 30 species if empty.
- Fallback to Neon Postgres if `DATABASE_URL` is set.
- All public catalog and care features must work without login (guest-first via `guestToken`).
- Thai microclimate 3 seasons: hot (March–May), rainy (June–October), cool (November–February).
- Intervals clamped between 1 and 30 days.

---

### Task 1: Project Foundation & Environment Configuration

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `app/globals.css`
- Create: `.env.example`
- Create: `.gitignore`

**Interfaces:**
- Consumes: None
- Produces: Base configuration and dependencies for Next.js, React 19, TypeScript, Tailwind CSS, Drizzle, PGlite, and Vitest.

- [ ] **Step 1: Create package.json with scripts and dependencies**
```json
{
  "name": "tree-for-life",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@electric-sql/pglite": "^0.2.14",
    "drizzle-orm": "^0.38.3",
    "lucide-react": "^0.469.0",
    "next": "15.1.4",
    "pg": "^8.13.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.5",
    "@types/pg": "^8.11.10",
    "@types/react": "^19.0.4",
    "@types/react-dom": "^19.0.2",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create tsconfig.json, next.config.ts, postcss.config.mjs, tailwind.config.ts**
Configure path aliases (`@/*`), React compiler/support, and Tailwind class-based dark mode.

- [ ] **Step 3: Create app/globals.css, .env.example, and .gitignore**
Include Tailwind directives, smooth transitions, `.data/pglite` and `node_modules` exclusions.

- [ ] **Step 4: Install dependencies and verify environment**
Run `npm install` and verify config loading.

- [ ] **Step 5: Commit foundation setup**
```bash
git add package.json tsconfig.json next.config.ts tailwind.config.ts postcss.config.mjs app/globals.css .env.example .gitignore
git commit -m "chore: setup project foundation and dependencies"
```

---

### Task 2: Database Schema, DDL & 30-Species Seed Data

**Files:**
- Create: `db/schema.ts`
- Create: `lib/db/schema-ddl.ts`
- Create: `lib/db/index.ts`
- Create: `lib/db/seed-data.ts`

**Interfaces:**
- Consumes: `@electric-sql/pglite`, `drizzle-orm`
- Produces: `db` client, `SCHEMA_DDL`, schema tables (`users`, `species`, `speciesMedia`, `speciesProblems`, `careTemplates`, `userPlants`, `careTasks`, `careLogs`, `favorites`, `inquiries`, `searchMisses`), and 30 curated boutique plant species.

- [ ] **Step 1: Implement Drizzle schema in db/schema.ts**
Define tables, relations, and enums matching design spec §3.1.

- [ ] **Step 2: Implement matching raw SQL DDL in lib/db/schema-ddl.ts**
Provide `SCHEMA_DDL` containing `CREATE TABLE IF NOT EXISTS` matching `db/schema.ts`.

- [ ] **Step 3: Implement database bootstrap in lib/db/index.ts**
Initialize embedded PGlite under `.data/pglite`, execute `SCHEMA_DDL`, check if `species` table is empty, and seed if needed.

- [ ] **Step 4: Implement 30 curated species in lib/db/seed-data.ts**
Populate 30 species with Thai/English/scientific names, aliases, media, care templates across 3 seasons, shop notes, and common problems.

- [ ] **Step 5: Verify database bootstrap in a node script**
Run a test query asserting 30 species exist in the database.

- [ ] **Step 6: Commit database layer**
```bash
git add db/schema.ts lib/db/schema-ddl.ts lib/db/index.ts lib/db/seed-data.ts
git commit -m "feat: implement database schema, ddl bootstrap, and 30-species seed data"
```

---

### Task 3: Care Schedule Engine & Unit Testing (TDD)

**Files:**
- Create: `lib/care/scheduler.ts`
- Create: `lib/care/scheduler.test.ts`

**Interfaces:**
- Consumes: Care templates, plant configurations
- Produces: `getThaiSeason(date)`, `calculateCareInterval(params)`, `generateNextTaskDue(currentDate, interval)`, `explainCareSchedule(params)`

- [ ] **Step 1: Write Vitest tests in lib/care/scheduler.test.ts**
Cover hot/rainy/cool seasons, pot materials (terracotta 0.8x, plastic 1.0x, glazed 1.15x), pot sizes (<6" 0.85x, 6-10" 1.0x, >10" 1.2x), placements (outdoor 0.7x, indoor far 1.25x, air-con 1.2x), clamping 1-30 days, custom days override, and rollover logic.

- [ ] **Step 2: Run tests to verify failure**
Run: `npx vitest run lib/care/scheduler.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement Care Schedule Engine in lib/care/scheduler.ts**
Implement mathematical formulas, seasonal detection, explanation builder, and task rollover algorithms.

- [ ] **Step 4: Run tests to verify pass**
Run: `npx vitest run lib/care/scheduler.test.ts`
Expected: PASS all tests.

- [ ] **Step 5: Commit scheduler module**
```bash
git add lib/care/scheduler.ts lib/care/scheduler.test.ts
git commit -m "feat: implement Thai 3-season care schedule engine with tests"
```

---

### Task 4: Core Domain Services & API Routes

**Files:**
- Create: `lib/services/speciesService.ts`
- Create: `lib/services/gardenService.ts`
- Create: `lib/services/inquiryService.ts`
- Create: `lib/services/adminService.ts`
- Create: `app/api/garden/plants/route.ts`
- Create: `app/api/garden/plants/[id]/archive/route.ts`
- Create: `app/api/garden/tasks/route.ts`
- Create: `app/api/garden/merge/route.ts`
- Create: `app/api/inquiries/route.ts`
- Create: `app/api/admin/species/stock/route.ts`

**Interfaces:**
- Consumes: `db` client, `lib/care/scheduler.ts`
- Produces: Service methods and REST API handlers for species, garden plants, care tasks, inquiries, and admin inventory.

- [ ] **Step 1: Implement domain services in lib/services/**
- `speciesService.ts`: `getAllSpecies`, `getSpeciesBySlug`, `recordSearchMiss`.
- `gardenService.ts`: `getUserPlants`, `getUserPlantById`, `addUserPlant`, `updateUserPlant`, `archiveUserPlant`, `completeTask`, `snoozeTask`, `skipTask`, `mergeGuestPlants`.
- `inquiryService.ts`: `createInquiry`, `getInquiries`.
- `adminService.ts`: `updateStockStatus`, `getSearchMisses`.

- [ ] **Step 2: Implement REST API routes in app/api/**
Map client requests to service methods with proper status codes and error handling.

- [ ] **Step 3: Commit domain services and API routes**
```bash
git add lib/services/ app/api/
git commit -m "feat: implement domain services and REST API endpoints"
```

---

### Task 5: Bilingual i18n, Theming, AppContext & App Layout

**Files:**
- Create: `lib/i18n/translations.ts`
- Create: `lib/context/AppContext.tsx`
- Create: `components/layout/Navbar.tsx`
- Create: `components/layout/Footer.tsx`
- Create: `components/ui/ToastContainer.tsx`
- Create: `app/layout.tsx`

**Interfaces:**
- Consumes: Translations dictionary
- Produces: `AppContext` (`t()`, `locale`, `setLocale`, `theme`, `toggleTheme`, `user`, `role`, `setRole`, `guestToken`, `addToast`), responsive `Navbar` with demo role switcher, `Footer`, and root `layout.tsx`.

- [ ] **Step 1: Implement full bilingual translations in lib/i18n/translations.ts**
Provide complete dictionary in Thai (`th`) and English (`en`) covering all navigation, filters, plant care terms, garden wizard, tasks, admin, and toasts.

- [ ] **Step 2: Implement AppContext in lib/context/AppContext.tsx**
Provide state for language, dark mode, guest token, demo user role switcher (`guest`, `customer`, `staff`, `admin`), and toast notification dispatch.

- [ ] **Step 3: Implement Navbar, Footer, and ToastContainer**
Include responsive navigation, active route highlighting, demo role selector, dark mode toggle, and language selector.

- [ ] **Step 4: Implement root app/layout.tsx**
Wrap children in `AppContextProvider`, register metadata and viewport settings.

- [ ] **Step 5: Commit context and layout**
```bash
git add lib/i18n/translations.ts lib/context/AppContext.tsx components/layout/ components/ui/ToastContainer.tsx app/layout.tsx
git commit -m "feat: implement bilingual i18n, theme switcher, demo auth context, and layout"
```

---

### Task 6: Public Catalog, Search & Plant Detail Pages

**Files:**
- Create: `app/page.tsx`
- Create: `components/home/HomeClient.tsx`
- Create: `app/search/page.tsx`
- Create: `components/search/SearchClient.tsx`
- Create: `app/plants/[slug]/page.tsx`
- Create: `components/plants/PlantDetailClient.tsx`
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`

**Interfaces:**
- Consumes: `speciesService`, `AppContext`
- Produces: Public catalog pages, interactive search with faceted filters, and plant detail pages with SEO and care guide summaries.

- [ ] **Step 1: Implement Homepage (app/page.tsx & HomeClient.tsx)**
Render search hero with seasonal placeholders, 6 curated category shortcuts, in-stock plant carousel, and value proposition banner.

- [ ] **Step 2: Implement Search & Filters (app/search/page.tsx & SearchClient.tsx)**
Render full-text search, multi-attribute filter chips (light, water, placement, difficulty, pet safety, size, stock), zero-results state with search miss logging and LINE CTA.

- [ ] **Step 3: Implement Plant Detail (app/plants/[slug]/page.tsx & PlantDetailClient.tsx)**
Render photo gallery with "Taken at Shop" badge, botanical names, 6-card summary, care guide from template, "Shop Note" box, troubleshooting accordion, similar species, and sticky bottom bar.

- [ ] **Step 4: Implement SEO sitemap.ts and robots.ts**
Generate dynamic sitemap indexing all published species.

- [ ] **Step 5: Commit public catalog and plant pages**
```bash
git add app/page.tsx components/home/ app/search/ components/search/ app/plants/ components/plants/ app/sitemap.ts app/robots.ts
git commit -m "feat: implement public catalog, faceted search, and plant detail pages"
```

---

### Task 7: LINE Inquiry Modal & Handoff Integration

**Files:**
- Create: `components/ui/InquiryModal.tsx`

**Interfaces:**
- Consumes: `/api/inquiries`, `AppContext`
- Produces: `InquiryModal` component handling intent selection (`price`, `availability`, `care_help`), reference code generation (`TFL-XXXX`), mobile LINE deep linking, and desktop QR code with copy-to-clipboard.

- [ ] **Step 1: Implement InquiryModal in components/ui/InquiryModal.tsx**
Create modal dialog with intent selection, pre-formatted message generation, mobile deep-link redirection, and desktop QR code preview with copy button.

- [ ] **Step 2: Wire up InquiryModal to PlantDetailClient and Navbar**
Allow visitors to trigger inquiries from any plant detail page or header.

- [ ] **Step 3: Commit InquiryModal**
```bash
git add components/ui/InquiryModal.tsx components/plants/PlantDetailClient.tsx
git commit -m "feat: implement LINE handoff inquiry modal with QR code and ref code tracking"
```

---

### Task 8: My Garden Hub, Add Wizard & Care Calendar

**Files:**
- Create: `app/garden/page.tsx`
- Create: `components/garden/GardenListClient.tsx`
- Create: `app/garden/add/page.tsx`
- Create: `components/garden/AddPlantWizard.tsx`
- Create: `app/garden/[id]/page.tsx`
- Create: `components/garden/PlantGardenDetailClient.tsx`

**Interfaces:**
- Consumes: `/api/garden/*`, `AppContext`, `lib/care/scheduler.ts`
- Produces: Garden list view, 4-step wizard with live formula calculation, plant care detail with 30-day calendar preview, and care logging history.

- [ ] **Step 1: Implement Garden List (app/garden/page.tsx & GardenListClient.tsx)**
Render user's active plants, accessible status badges (Overdue, Due Today, Future), one-click "Watered" quick action, and empty state onboarding.

- [ ] **Step 2: Implement 4-Step Add Plant Wizard (app/garden/add/page.tsx & AddPlantWizard.tsx)**
Step 1: Species selection; Step 2: Nickname & origin; Step 3: Pot size & visual material; Step 4: Placement environment. Render interactive live calculation breakdown before submission.

- [ ] **Step 3: Implement Plant Care Detail & Calendar (app/garden/[id]/page.tsx & PlantGardenDetailClient.tsx)**
Display 30-day forward calendar, past care logs timeline, environmental edit form with instant interval recalculation, and plant archive action.

- [ ] **Step 4: Commit My Garden module**
```bash
git add app/garden/ components/garden/
git commit -m "feat: implement My Garden plant list, 4-step wizard, and 30-day care calendar"
```

---

### Task 9: Today's Tasks Dashboard

**Files:**
- Create: `app/today/page.tsx`
- Create: `components/today/TodayTasksClient.tsx`

**Interfaces:**
- Consumes: `/api/garden/tasks`, `AppContext`
- Produces: Daily care checklist for due and overdue tasks, batch "Mark All Done" action, individual Done, Snooze (+1 day), and Skip controls.

- [ ] **Step 1: Implement Today's Tasks (app/today/page.tsx & TodayTasksClient.tsx)**
Group tasks by overdue and due today across all active plants. Provide one-click individual task completion, snooze, and skip, alongside a batch "Mark All Done" button.

- [ ] **Step 2: Commit Today's Tasks module**
```bash
git add app/today/ components/today/
git commit -m "feat: implement Today tasks dashboard with batch actions and snooze"
```

---

### Task 10: Shop Admin Dashboard

**Files:**
- Create: `app/admin/page.tsx`
- Create: `components/admin/AdminDashboardClient.tsx`

**Interfaces:**
- Consumes: `/api/admin/*`, `AppContext`
- Produces: Admin management interface with inline stock status toggling (`in_stock`, `made_to_order`, `seasonal`), inquiry verification logs, and search misses demand ranking.

- [ ] **Step 1: Implement Admin Dashboard (app/admin/page.tsx & AdminDashboardClient.tsx)**
Provide tabbed views:
1. Inventory Management: Table of 30 species with instant inline stock toggles.
2. Inquiries Log: List of recent customer leads with `ref_code` matching.
3. Search Misses: Prioritized list of unhandled customer search terms.
Add role-based guard for `staff` / `admin`.

- [ ] **Step 2: Commit Shop Admin Dashboard**
```bash
git add app/admin/ components/admin/
git commit -m "feat: implement shop admin dashboard with stock toggles and inquiry tracking"
```

---

### Task 11: End-to-End Verification & Quality Gate

**Files:**
- Verify: Full codebase

**Interfaces:**
- Consumes: Vitest test runner, Next.js build compiler
- Produces: Verified working application with 100% passing tests and error-free production build.

- [ ] **Step 1: Run Vitest unit tests**
Run: `npm run test`
Verify all Care Schedule Engine test cases pass.

- [ ] **Step 2: Run Next.js production build**
Run: `npm run build`
Verify clean TypeScript compilation and server component route generation with zero errors.

- [ ] **Step 3: Verify local dev server boot**
Start `npm run dev`, verify embedded PGlite boots and seeds 30 species, verify homepage, search, plant detail, add wizard, and admin screens load properly.

- [ ] **Step 4: Final commit and readiness milestone**
```bash
git commit -am "chore: verify Phase 1 implementation end-to-end"
```
