# TreeForLife — AI Agent Working Guide (AGENT.md)

> **Audience:** Autonomous AI coding agents (Antigravity, Claude Code, Cursor, Copilot, Windsurf) working in this repository.  
> **Repository:** TreeForLife — Boutique Plant Catalog & Thai 3-Season Care Platform.  
> **Specification Reference:** [`docs/SPEC.md`](./docs/SPEC.md)  
> **Conventions & Standards:** [`docs/CONVENTIONS.md`](./docs/CONVENTIONS.md)  
> **Project Progress & Roadmap:** [`docs/PROGRESS.md`](./docs/PROGRESS.md)

---

## 1. Golden Rules (Non-Negotiable)

When writing or modifying code in this codebase, you **must strictly adhere** to these rules:

1. **Dual DDL Parity:**
   - Any modification to `db/schema.ts` (Drizzle) **must be mirrored 1-to-1** in `lib/db/schema-ddl.ts` (raw SQL DDL).
   - The embedded PGlite instance executes `SCHEMA_DDL` from `lib/db/schema-ddl.ts` on boot; Drizzle migrations are not used for local dev.
2. **Asia/Bangkok Date Generation:**
   - **NEVER use `new Date().toISOString().split('T')[0]`**. This creates UTC midnight date rollover bugs in Thailand (UTC+7).
   - **ALWAYS use `formatDate(new Date())`** from `@/lib/care/scheduler`.
3. **Zero Hardcoded Display Strings:**
   - Never write hardcoded Thai or English UI strings in components.
   - Always define both Thai (`th`) and English (`en`) keys in `lib/i18n/translations.ts` and consume them with `const { t } = useApp()`.
4. **Next.js 15 App Router Async Params:**
   - In Next.js 15, page `params` and `searchParams` are Promises.
   - **Always await them:** `const { slug } = await params;` or `const { q } = await searchParams;`.
5. **Database Client Acquisition:**
   - Always access the database using `const db = await getDb()` from `@/lib/db`.
   - Never instantiate a raw database client manually in services or route handlers.
6. **Resilient Batch Operations:**
   - In API handlers that process batches of items (e.g. marking all tasks done), wrap each item in an isolated `try/catch` block. Return `{ success: true, succeeded: [...], failed: [...] }`. Never fail an entire batch because of one bad record.
7. **Verification Evidence Before Completion:**
   - Never claim a task or feature is complete without running:
     1. `npm run test` (all 158+ tests must pass)
     2. `npm run build` (all 12 routes must compile with 0 TypeScript errors)

---

## 2. Tech Stack Overview

- **Framework:** Next.js 15 (App Router, Server & Client Components)
- **UI & Styling:** React 19, Tailwind CSS (class-based dark mode `darkMode: "class"`)
- **Database:** Drizzle ORM + embedded PGlite (`@electric-sql/pglite`) under `.data/pglite`; automatic fallback to Neon PostgreSQL when `DATABASE_URL` is set.
- **Testing:** Vitest + `@testing-library/react` + JSDOM.
- **i18n:** Custom bilingual context (`AppContext.tsx` + `lib/i18n/translations.ts`), default Thai (`th`).

---

## 3. Standard Code Recipes & Boilerplates

### 3.1 New Server Component Page (`app/feature/page.tsx`)

```tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSpeciesBySlug } from "@/lib/services/speciesService";
import FeatureClient from "@/components/feature/FeatureClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const plant = await getSpeciesBySlug(slug);
  if (!plant) return { title: "Plant Not Found | TreeForLife" };
  return { title: `${plant.nameTh} (${plant.nameEn}) | TreeForLife` };
}

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getSpeciesBySlug(slug);
  if (!data) notFound();

  return <FeatureClient data={data} />;
}
```

### 3.2 New Client Component (`components/feature/FeatureClient.tsx`)

```tsx
"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context/AppContext";

interface FeatureClientProps {
  initialCount?: number;
}

export default function FeatureClient({ initialCount = 0 }: FeatureClientProps) {
  const { t, theme } = useApp();
  const [count, setCount] = useState(initialCount);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-forest-800 dark:text-emerald-300">
        {t("feature.title")}
      </h2>
      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        className="min-h-[44px] min-w-[44px] px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-xl transition"
      >
        {t("common.save")} ({count})
      </button>
    </div>
  );
}
```

### 3.3 New Domain Service Method (`lib/services/exampleService.ts`)

```typescript
import { getDb } from "@/lib/db";
import { userPlants } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getActivePlant(plantId: string) {
  const db = await getDb();
  const [plant] = await db
    .select()
    .from(userPlants)
    .where(eq(userPlants.id, plantId))
    .limit(1);

  return plant || null;
}
```

### 3.4 New API Route Handler (`app/api/example/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getActivePlant } from "@/lib/services/exampleService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.plantId) {
      return NextResponse.json(
        { error: "plantId is required" },
        { status: 400 }
      );
    }

    const plant = await getActivePlant(body.plantId);
    if (!plant) {
      return NextResponse.json(
        { error: "Plant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, plant });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

### 3.5 Writing an Integration Test (`test/example.test.ts`)

```typescript
import { describe, it, expect } from "vitest";
import { getAllSpecies } from "@/lib/services/speciesService";
import { getSearchMisses } from "@/lib/services/adminService";

describe("Example Service Test Suite", () => {
  it("retrieves species with correct data structure", async () => {
    const speciesList = await getAllSpecies({ limit: 5 });
    expect(speciesList.length).toBeGreaterThan(0);
    expect(speciesList[0]).toHaveProperty("slug");
    expect(speciesList[0]).toHaveProperty("nameTh");
  });

  it("handles pagination when asserting accumulated records", async () => {
    // Note: Always use a high limit (e.g. 1000) when searching for recent items
    const misses = await getSearchMisses(1000);
    expect(Array.isArray(misses)).toBe(true);
  });
});
```

---

## 4. Key Project Commands

| Command | Action | Notes |
|---|---|---|
| `npm run dev` | Start Next.js dev server | Boots PGlite at `http://localhost:3000` |
| `npm run test` | Run full test suite | Vitest in single-run mode (158 tests) |
| `npm run test:watch` | Run tests in watch mode | Vitest interactive mode |
| `npm run build` | Production Next.js build | Compiles all 12 routes & verifies TS types |
| `npx tsc --noEmit` | Check TypeScript errors | Fast static type check |

---

## 5. Verification Checklist for Agents

Before completing any task or claiming code is ready:
- [ ] Added translation strings to `lib/i18n/translations.ts` for both `th` and `en`
- [ ] Mirrored any schema change from `db/schema.ts` to `lib/db/schema-ddl.ts`
- [ ] Checked that all interactive buttons have `min-h-[44px]` for mobile touch accessibility
- [ ] Confirmed date operations use `formatDate(new Date())` from `@/lib/care/scheduler`
- [ ] Confirmed all client components have corresponding `dark:` classes
- [ ] Executed `npm run test` and confirmed all tests are green
- [ ] Executed `npm run build` and confirmed zero build errors
