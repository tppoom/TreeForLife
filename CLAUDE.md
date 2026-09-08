# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and other Claude-based agents when working with code in this repository.

## 1. Project Overview

TreeForLife is a bilingual (Thai/English) boutique plant shop + plant-care web app.
- **Specification:** [`docs/SPEC.md`](./docs/SPEC.md) (Full Thai product/technical spec)
- **Engineering Conventions:** [`docs/CONVENTIONS.md`](./docs/CONVENTIONS.md) (Code conventions, UI rules, design tokens)
- **Project Progress:** [`docs/PROGRESS.md`](./docs/PROGRESS.md) (Phase 1 completion, test metrics, Phase 2/3 roadmap)
- **Agent Guide:** [`AGENT.md`](./AGENT.md) (Boilerplates and golden rules for autonomous AI agents)

**Current Status:** Phase 1 is **100% complete and verified** (Catalog, faceted search, plant detail, My Garden tracking, 4-step wizard, Thai 3-season care scheduler, Today tasks dashboard, LINE inquiry handoff with ref codes, and Shop Admin inventory/inquiry/search-misses dashboard).

**Stack:** Next.js 15 (App Router), React 19, TypeScript, Drizzle ORM, Tailwind CSS (class dark mode), Vitest.

---

## 2. Essential Commands

A comprehensive `Makefile` is available. You can run `make` or `make help` to inspect all targets.

- `make dev` (or `npm run dev`) — starts Next.js dev server (self-bootstraps embedded PGlite on port 3000)
- `make test` (or `npm run test`) — runs full Vitest suite (all 158 tests)
- `make test-watch` (or `npm run test:watch`) — runs Vitest in watch mode
- `make build` (or `npm run build`) — runs Next.js production build (compiles all 12 routes, checks TS validity)
- `make typecheck` (or `npx tsc --noEmit`) — fast static TypeScript verification
- `make db-status` — inspects embedded PGlite table counts
- `make db-species` — lists 30 seeded Thai plant species
- `make check` — fast pre-commit check (`typecheck` + `test`)
- `make verify` (or `make ci`) — full pre-push verification (`typecheck` + `test` + `build`)
- Run a single test file:
  - `make test-care` (or `npx vitest run lib/care/scheduler.test.ts`)
  - `make test-admin` (or `npx vitest run test/admin.test.tsx`)
  - `make test-catalog` (or `npx vitest run test/catalog-search-detail.test.ts`)
  - `make test-garden` (or `npx vitest run test/garden.test.tsx`)
  - `make test-inquiry` (or `npx vitest run test/inquiry-modal.test.tsx`)
  - `make test-today` (or `npx vitest run test/today.test.tsx`)

---

## 3. Database: Dual DDL Synchronization Rule

TreeForLife has **two schema sources that must stay strictly in sync**:
1. `db/schema.ts` — Drizzle ORM schema, used for type-safe queries.
2. `lib/db/schema-ddl.ts` — Hand-written raw SQL `CREATE TABLE` string (`SCHEMA_DDL`), executed directly against embedded PGlite on boot (`lib/db/index.ts`).

> **CRITICAL RULE:** Any change to a table in `db/schema.ts` (new column, constraint, or enum value) **must be mirrored by hand in `lib/db/schema-ddl.ts`**. Drizzle migrations are not used for local dev.

- **Local dev:** Uses embedded PGlite (`.data/pglite`, gitignored) that self-seeds 30 boutique Thai species on first launch if empty.
- **Production / Cloud:** Setting `DATABASE_URL` switches to a pooled Neon Postgres instance with SSL via `pg.Pool`. Always acquire dedicated client connections for transaction blocks (`BEGIN` / `COMMIT`).

---

## 4. Care Schedule Engine & Timezone Rule

- `lib/care/scheduler.ts` implements SPEC.md §5:
  - Thai 3-season cycle: Hot (Mar–May), Rainy (Jun–Oct), Cool (Nov–Feb).
  - Multipliers: pot material (0.8x–1.15x), pot diameter (0.85x–1.3x), placement (0.7x–1.25x).
  - Safety bounds: All intervals clamped between **1 and 30 days**.
  - Snooze limit: Max 3 consecutive snoozes.
- **STRICT TIMEZONE RULE:** **Never use `new Date().toISOString().split('T')[0]`**. UTC midnight causes day rollback in Thailand (UTC+7). **Always use `formatDate(new Date())`** from `@/lib/care/scheduler`.

---

## 5. UI, i18n & Theming Conventions

- **Bilingual Dictionary:** All UI text must live in `lib/i18n/translations.ts` (`th` and `en`). Do not hardcode strings in components. Consume with `const { t } = useApp()`.
- **Dark Mode:** Class-based dark mode (`darkMode: "class"`). Every card, modal, and text element must include `dark:` variant classes.
- **Accessibility:** Minimum touch target size is `44px × 44px` for buttons. Status tags must pair color with icon and text (e.g. Overdue = `!` + red, Due Today = `●` + amber, Upcoming = `○` + sage).
- **Next.js 15 App Router:** Server Component page `params` and `searchParams` are Promises and must be awaited: `const { slug } = await params;`.

---

## 6. Authentication & Roles

- Auth is guest-first with demo role switching via `lib/context/AppContext.tsx`.
- Persistent `guestToken` is stored in browser `localStorage('tfl_guest_token')`.
- Roles: `'guest' | 'customer' | 'staff' | 'admin'`.
- Switching from guest to customer automatically calls `POST /api/garden/merge` to migrate plants.
- Admin dashboard (`/admin`) is gated to `staff` and `admin`.

---

## 7. Quality & Verification Protocol

Always verify the following before finishing any work:
1. `npm run test` passes 100% (all 158 tests green).
2. `npm run build` compiles cleanly with zero TypeScript errors.
3. No untracked schema discrepancies between `db/schema.ts` and `lib/db/schema-ddl.ts`.
