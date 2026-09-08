# TreeForLife — Engineering & Design Conventions

> **Status:** Active Standard  
> **Applies to:** Entire TreeForLife codebase, all contributors, and AI assistants.  
> **Goal:** Ensure 100% uniformity, maintainability, type safety, and UX consistency across the application.

---

## 1. Core Principles

1. **Thai Boutique Identity:** The platform is designed around Thai microclimates, Thai 3 seasons, local plant care practices, and LINE OA communication. Thai (`th`) is the primary default locale; English (`en`) is the secondary locale.
2. **Zero-Dependency Local DX:** Any engineer or AI agent should be able to run `npm run dev` and `npm run test` immediately after cloning, without running Docker or an external PostgreSQL instance.
3. **Guest-First Architecture:** Users can browse, filter, inspect plants, track their garden, and initiate inquiries without mandatory registration. Data is tied to a client-generated persistent `guestToken` until converted to a user account.
4. **Dual DDL Parity:** Every schema change in Drizzle ORM (`db/schema.ts`) must be mirrored 1-to-1 in the raw SQL DDL file (`lib/db/schema-ddl.ts`).

---

## 2. Directory Structure

```
TreeForLife/
├── app/                        # Next.js 15 App Router
│   ├── layout.tsx              # Root Layout (wraps AppContextProvider, Navbar, Footer, Toasts)
│   ├── globals.css             # Tailwind CSS & design tokens
│   ├── page.tsx                # Homepage (Hero, Categories, Carousel, Value Prop)
│   ├── search/                 # Faceted Search (/search)
│   ├── plants/[slug]/          # Plant Detail (/plants/[slug])
│   ├── garden/                 # My Garden Hub (/garden)
│   │   ├── add/                # 4-Step Add Plant Wizard (/garden/add)
│   │   └── [id]/               # Plant Care Detail & 30-Day Calendar (/garden/[id])
│   ├── today/                  # Daily Care Tasks Dashboard (/today)
│   ├── admin/                  # Shop Admin Dashboard (/admin)
│   ├── api/                    # Next.js 15 Route Handlers (REST endpoints)
│   │   ├── garden/             # /api/garden/{plants, tasks, merge}
│   │   ├── inquiries/          # /api/inquiries
│   │   └── admin/              # /api/admin/{species/stock}
│   ├── sitemap.ts              # Dynamic sitemap
│   └── robots.ts               # Robots.txt
├── components/                 # React UI Components
│   ├── layout/                 # Navbar, Footer, navigation drawers
│   ├── ui/                     # Reusable modals, toast container, buttons
│   ├── home/                   # Homepage client views
│   ├── search/                 # Search & filter client views
│   ├── plants/                 # Plant detail client views
│   ├── garden/                 # Garden list, wizard, and care detail clients
│   ├── today/                  # Today tasks client view
│   └── admin/                  # Admin dashboard client view
├── db/                         # Database Schema (Drizzle ORM)
│   └── schema.ts               # Drizzle table definitions, relations, and enums
├── lib/                        # Core Domain & Shared Utilities
│   ├── db/                     # DB client instances, schema-ddl.ts, seed-data.ts
│   ├── care/                   # Care schedule engine (scheduler.ts, scheduler.test.ts)
│   ├── services/               # Domain services (speciesService, gardenService, etc.)
│   ├── context/                # AppContext.tsx (theme, i18n, auth, toasts)
│   └── i18n/                   # translations.ts (complete bilingual dictionary)
├── test/                       # Vitest integration test suites
│   ├── admin.test.tsx
│   ├── catalog-search-detail.test.ts
│   ├── garden.test.tsx
│   ├── inquiry-modal.test.tsx
│   └── today.test.tsx
└── docs/                       # Technical specs, plans, and architectural docs
```

---

## 3. Server vs. Client Component Conventions

### 3.1 Server Components by Default
- All `page.tsx` files inside `app/` should be **Server Components** by default.
- Server components handle server-side data fetching directly using domain services (e.g. `await speciesService.getSpeciesBySlug(slug)`), metadata generation (`generateMetadata`), and SEO JSON-LD injection.
- **Next.js 15 Requirement:** Dynamic params and searchParams are Promises and **must always be awaited**:
  ```typescript
  // ✅ Correct in Next.js 15
  export default async function PlantDetailPage({
    params,
  }: {
    params: Promise<{ slug: string }>;
  }) {
    const { slug } = await params;
    const plant = await getSpeciesBySlug(slug);
    if (!plant) notFound();
    return <PlantDetailClient plant={plant} />;
  }
  ```

### 3.2 Client Components (`'use client'`)
- Place `'use client'` at the very top of files in `components/**/*.tsx` that use:
  - React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`)
  - Browser APIs (`localStorage`, `window`, `navigator.clipboard`)
  - AppContext (`useApp()`)
  - DOM event listeners (`onClick`, `onChange`, `onSubmit`)
- Keep client components focused on interactive UI and delegating data mutations via `/api/*` endpoints.

---

## 4. Design System & Styling Conventions

### 4.1 Color Palette
Tailwind CSS custom colors configured in `tailwind.config.ts`:
- **Forest (`forest-*`):** Deep natural greens (`forest-800: #1a3826`, `forest-900: #102418`) for headings, primary buttons, and hero accents.
- **Sage (`sage-*`):** Calming botanical tones (`sage-50: #f4f7f4`, `sage-500: #628c68`, `sage-700: #3b573f`) for backgrounds, borders, and upcoming task badges.
- **Earth (`earth-*`):** Warm terracotta and soil tones (`earth-500: #a46d47`, `earth-700: #6d4224`) for secondary accents and pot details.
- **Amber (`amber-*`):** Due today warnings and caution highlights.
- **Rose (`rose-*`):** Overdue alerts, pest tags, and destructive actions.

### 4.2 Dark Mode
- Dark mode is class-based (`darkMode: "class"` in `tailwind.config.ts`).
- Toggled by adding/removing the `dark` class on `document.documentElement` and persisted in `localStorage('tfl_theme')`.
- **Every interactive element and card MUST provide dark styles:**
  ```tsx
  <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
  ```

### 4.3 Due-Status Badges (Colorblind-Safe)
Status badges must never rely on color alone. Always pair color with an icon and clear label:
- **Overdue:** Red tag + exclamation icon (`!`) + `เลยกำหนด {days} วัน` / `Overdue {days}d`
- **Due Today:** Amber tag + solid dot (`●`) + `รดน้ำวันนี้` / `Due today`
- **Upcoming:** Sage tag + outlined circle (`○`) + `อีก {days} วัน` / `In {days}d`

### 4.4 Mobile-First & Touch Accessibility
- Minimum interactive touch target size: **44px × 44px** (use `min-h-[44px] min-w-[44px]` or adequate padding).
- Sticky bottom mobile action bars on plant detail and wizard (`fixed bottom-0 left-0 right-0 z-30 p-4 border-t`).

---

## 5. Bilingual i18n Conventions

### 5.1 Single Source of Truth: `lib/i18n/translations.ts`
- **Zero hardcoded user-facing strings in UI components.**
- All UI labels, placeholders, titles, error messages, and tooltips must be added to `lib/i18n/translations.ts`.

### 5.2 Key Hierarchy & Namespaces
Organize translation keys hierarchically:
- `nav.*`: Navigation, role switcher, links
- `home.*`: Homepage hero, shortcuts, value props
- `search.*`: Search filters, sorting, zero-state
- `plant.*`: Botanical metrics, care accordions, shop notes
- `garden.*`: Garden list, empty state, status tags
- `wizard.*`: 4-step wizard forms, hints, formula preview
- `today.*`: Daily tasks, snooze actions, batch complete
- `admin.*`: Stock management, inquiries, demand analytics
- `inquiry.*`: LINE inquiry modal intents, copy buttons
- `toast.*`: Success/error feedback messages
- `common.*`: Shared actions (Save, Cancel, Close, Loading)

### 5.3 Translation Function & Interpolation
Use the `t(key, params)` helper from `useApp()`:
```tsx
const { t } = useApp();

// Simple translation
<h1>{t("today.title")}</h1>

// Parameter interpolation: "อีก {days} วัน" -> "อีก 3 วัน"
<span>{t("garden.upcoming_days", { days: 3 })}</span>
```

---

## 6. Database & Dual DDL Parity Rules

### 6.1 The Dual DDL Golden Rule
TreeForLife maintains **two schema representations** that must stay strictly synchronized:
1. **Drizzle Schema:** `db/schema.ts` — TypeScript types and relational queries.
2. **Raw SQL DDL:** `lib/db/schema-ddl.ts` — Handcrafted SQL executed on embedded PGlite boot.

> **Whenever you add or modify a column, table, index, or enum in `db/schema.ts`, you MUST immediately replicate the exact same change in `lib/db/schema-ddl.ts`.**

### 6.2 Schema Naming Conventions
- Table names: `plural_snake_case` (`species`, `user_plants`, `care_tasks`, `search_misses`).
- Database columns: `snake_case` (`species_id`, `water_days_hot`, `is_active`, `last_seen_at`).
- TypeScript schema properties: `camelCase` (`speciesId`, `waterDaysHot`, `isActive`, `lastSeenAt`).
- Primary keys: UUID v4 generated via `uuid().defaultRandom().primaryKey()` or raw SQL `gen_random_uuid()`.
- Complex arrays: Stored as PostgreSQL `jsonb` (`aliases`, `placement`, `tags`).

### 6.3 Seeding Standard
- The seed dataset in `lib/db/seed-data.ts` contains **30 boutique Thai species** with complete botanical information, care templates, media, and troubleshooting guides.
- New seed entries must adhere to the `SeedSpecies` type interface and provide both Thai and English names.

---

## 7. Care Schedule Engine & Timezone Conventions

### 7.1 Location of Core Logic
- All care calculation formulas live exclusively in `lib/care/scheduler.ts`.
- Calculations are covered by extensive unit tests in `lib/care/scheduler.test.ts`.

### 7.2 Strict Timezone Rule (Asia/Bangkok)
- **NEVER use `new Date().toISOString().split('T')[0]`** for current date calculations. UTC timestamps cause dates to roll back or forward prematurely relative to Thai local time (UTC+7).
- **ALWAYS use `formatDate(new Date())`** imported from `@/lib/care/scheduler`.
  ```typescript
  // ❌ NEVER:
  const today = new Date().toISOString().split("T")[0];

  // ✅ ALWAYS:
  import { formatDate } from "@/lib/care/scheduler";
  const today = formatDate(new Date());
  ```

### 7.3 Calculation Formula & Clamping
- Base seasonal days: Hot (Mar–May), Rainy (Jun–Oct), Cool (Nov–Feb).
- Computed interval formula:
  $$\text{Interval} = \text{round}(\text{base\_days} \times \text{material\_factor} \times \text{size\_factor} \times \text{placement\_factor})$$
- Safety boundaries: Clamped to $[1, 30]$ days (`Math.min(30, Math.max(1, rawDays))`).
- Snooze limit: Maximum 3 consecutive snoozes (`snooze_count >= 3` throws error).

---

## 8. Domain Services & API Route Conventions

### 8.1 Domain Services (`lib/services/*`)
- Put business logic, database queries, and data mutations in domain services, not inside API Route Handlers or components.
- Service functions must be single-responsibility and accept plain objects.
- Always obtain the database handle via `const db = await getDb()`.

### 8.2 API Route Handlers (`app/api/*`)
- Follow REST conventions:
  - `GET /api/garden/plants?guestToken=...`
  - `POST /api/garden/plants`
  - `POST /api/garden/plants/[id]/archive`
  - `POST /api/garden/tasks` (with action: `complete` | `snooze` | `skip`)
  - `POST /api/garden/merge`
  - `POST /api/inquiries`
  - `POST /api/admin/species/stock`
- Always return standard JSON responses:
  - Success: `NextResponse.json({ success: true, ...data })`
  - Error: `NextResponse.json({ error: "Human-readable message" }, { status: 400 | 403 | 404 | 500 })`

### 8.3 Resilient Batch Operations
- When processing batch actions (e.g. batch task completion), iterate through items with per-item `try/catch` error isolation. Return `{ success: true, succeeded: string[], failed: { id: string; error: string }[] }`.

---

## 9. State Management & Authentication Conventions

### 9.1 AppContext (`lib/context/AppContext.tsx`)
- Provides global client state:
  - `locale`: `'th'` | `'en'`
  - `t(key, params)`: Translation helper
  - `theme`: `'light'` | `'dark'`
  - `guestToken`: Persistent UUID generated once and saved in `localStorage('tfl_guest_token')`
  - `user`: Demo user object `{ id, role, name, email }`
  - `setRole(role)` / `loginAsDemoUser(role)`: Switches role between `'guest'`, `'customer'`, `'staff'`, and `'admin'`
  - `addToast(message, type)`: Triggers toast alerts
- Automatically invokes `POST /api/garden/merge` when transitioning from `'guest'` to `'customer'`.

---

## 10. Testing Standards

### 10.1 Test Framework
- **Vitest** with JSDOM environment and `@testing-library/react`.
- Run all tests with `npm run test`.
- Run a single file: `npx vitest run test/admin.test.tsx`.

### 10.2 Database in Tests
- Tests interact with the local embedded PGlite database without needing mocks.
- When asserting paginated database queries (e.g. `getSearchMisses()`), always pass a large limit (e.g. `getSearchMisses(1000)`) so accumulated historical rows from previous test runs do not truncate newly created test records.

---

## 11. Git & Commit Conventions

Follow Conventional Commits format:
- `feat: ...` for new user-facing capabilities
- `fix: ...` for bug fixes and corrective changes
- `chore: ...` for config, builds, and maintenance
- `docs: ...` for documentation updates
- `test: ...` for adding or refining tests
- `refactor: ...` for internal restructuring without behavior changes
