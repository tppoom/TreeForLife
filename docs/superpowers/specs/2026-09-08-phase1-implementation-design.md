# TreeForLife Phase 1 Implementation Design Specification

- **Date**: 2026-09-08
- **Status**: Approved by Human Partner (Ready for Implementation Planning)
- **Reference**: `docs/SPEC.md`
- **Scope**: Phase 1 Foundation & Core Applications (Bilingual TH/EN, Dark Mode, Catalog, Care Scheduler, My Garden, Admin, LINE Handoff)

---

## 1. Project Overview & Principles

TreeForLife is a boutique plant shop and plant-care platform tailored to Thai plant enthusiasts and beginners. Rather than operating as an impersonal e-commerce store with shopping carts and payment gateways, every customer inquiry leads directly into a personalized LINE Official Account chat with shop owners, backed by authentic plant knowledge and a smart microclimate care scheduler.

### Guiding Principles
- **Not a Generic E-Commerce Store**: No cart, no online checkout, no public price lists. All purchasing inquiries hand off to LINE with a short tracking reference code (`ref_code`).
- **Care Utility First**: The care calendar and plant health tracking are free and beneficial for any plant owner, regardless of whether the plant was purchased from TreeForLife.
- **Guest-First Experience**: All browsing, searching, and plant tracking work out-of-the-box without mandatory login. Data is tracked under a guest token and merged upon account creation.
- **Shop Wisdom as Differentiation**: Plant descriptions, care guides, and tips reflect actual shop experience (`shop_note`), avoiding stock web copy.
- **Thai Climate by Default**: Thai 3-season calendar (hot, rainy, cool), standard pot sizing in inches, local soil recipes, and LINE as primary communication.

---

## 2. Tech Stack & Environment Architecture

| Layer | Choice | Details |
|---|---|---|
| **Framework** | Next.js 15 (App Router), React 19 | Server Components for public SEO; Client Components for interactive wizard and task flows |
| **Language** | TypeScript | Strict mode enabled |
| **Styling** | Tailwind CSS | Class-based dark mode (`darkMode: "class"`), responsive mobile-first |
| **Database** | Embedded PGlite (`@electric-sql/pglite`) / Neon Postgres | Zero-dependency embedded PGlite for local development; switches to Neon Postgres if `DATABASE_URL` is set |
| **ORM & DDL** | Drizzle ORM + Handcrafted Raw DDL | `db/schema.ts` for type safety; `lib/db/schema-ddl.ts` for PGlite bootstrapping |
| **Icons** | Lucide React | Clean, accessible SVG iconography |
| **Testing** | Vitest | Fast unit and integration tests for care algorithms and domain logic |

---

## 3. Database Architecture & Dual-Schema Strategy

To support local zero-dependency development via PGlite without requiring external migration binaries, the database schema follows a synchronized dual-definition pattern:

### 3.1 Drizzle Schema (`db/schema.ts`)
- `users`: `id` (UUID PK), `display_name`, `email` (nullable), `line_user_id` (nullable), `avatar_url`, `role` (`customer` | `staff` | `admin`), `timezone`, `notify_web_push`, `notify_line`, `notify_hour`, timestamps.
- `species`: `id` (UUID PK), `slug` (unique), `name_th`, `name_en`, `name_sci`, `aliases` (text array), `family`, `summary`, `light` (enum), `water_need` (enum), `placement` (enum array), `difficulty` (1–5), `pet_safe` (enum), `mature_size` (enum), `mature_height_cm`, `growth_rate` (enum), `soil_mix`, `fertilizer_note`, `propagation`, `shop_note`, `stock_status` (`in_stock` | `made_to_order` | `seasonal` | `hidden`), `price_range_internal`, `published_at`.
- `species_media`: `id`, `species_id` (FK), `blob_url`, `alt_th`, `sort_order`, `is_primary`, `credit`.
- `species_problems`: `id`, `species_id` (FK), `symptom_th`, `cause_th`, `fix_th`, `severity` (`low` | `medium` | `high`), `sort_order`.
- `care_templates`: `species_id` (PK FK), `water_days_hot`, `water_days_rainy`, `water_days_cool`, `fertilize_days`, `fertilize_pause_months` (int array), `repot_months`, `prune_days`, `pest_check_days`, `notes_th`.
- `user_plants`: `id` (UUID PK), `user_id` (FK nullable), `guest_token` (nullable), `species_id` (FK), `nickname`, `photo_url`, `acquired_at`, `acquired_from` (`shop` | `elsewhere` | `gift` | `propagated`), `pot_size_inch`, `pot_material` (`terracotta` | `plastic` | `ceramic_glazed` | `cement` | `hanging`), `placement` (`outdoor_sun` | `balcony_shade` | `indoor_window` | `indoor_far` | `air_con`), `custom_water_days`, `is_active` (boolean default true), `notes`.
- `care_tasks`: `id`, `user_plant_id` (FK), `type` (`water` | `fertilize` | `repot` | `prune` | `pest_check`), `due_date`, `status` (`pending` | `done` | `skipped` | `snoozed`), `done_at`, `notified_at`. **Unique constraint on `(user_plant_id, type, due_date)`**.
- `care_logs`: `id`, `user_plant_id` (FK), `type`, `performed_at`, `note`, `photo_url`, `source` (`app` | `line` | `backfill`).
- `favorites`: `user_id` (nullable), `guest_token` (nullable), `species_id` (FK), `created_at`.
- `inquiries`: `id`, `species_id` (FK nullable), `user_id` (nullable), `guest_token` (nullable), `source_page`, `ref_code` (unique short code e.g. `TFL-4K9P`), `intent` (`price` | `availability` | `care_help` | `design_quote`), `payload` (JSONB), `created_at`.
- `search_misses`: `query` (text PK), `count` (integer), `last_seen_at`.

### 3.2 Raw DDL Bootstrap (`lib/db/schema-ddl.ts`)
- Handcrafted `SCHEMA_DDL` containing `CREATE TABLE IF NOT EXISTS` statements matching `db/schema.ts`. Enums are stored as validated `TEXT` columns for PGlite compatibility.
- Executed on startup in `lib/db/index.ts`. If `species` table is empty, auto-seeds from `lib/db/seed-data.ts`.

### 3.3 30-Species Seed Dataset (`lib/db/seed-data.ts`)
- Populates 30 complete species with Thai/English/Scientific names, aliases, rich descriptions, care templates across 3 seasons, shop notes, common problems, and stock statuses.

---

## 4. Care Schedule Engine (`lib/care/scheduler.ts`)

The scheduler computes customized watering, fertilizing, and repotting intervals based on the user's specific plant container and home microclimate:

### 4.1 Thai 3-Season Mapping
- **Hot Season (`hot`)**: March – May (months 3, 4, 5) $\rightarrow$ uses `water_days_hot`
- **Rainy Season (`rainy`)**: June – October (months 6, 7, 8, 9, 10) $\rightarrow$ uses `water_days_rainy`
- **Cool / Dry Season (`cool`)**: November – February (months 11, 12, 1, 2) $\rightarrow$ uses `water_days_cool`

### 4.2 Multiplier Adjustments
$$\text{calculated\_days} = \text{Math.round}(\text{base\_days}(\text{season}) \times \text{material\_factor} \times \text{size\_factor} \times \text{placement\_factor})$$

- **Pot Material Multipliers**:
  - Terracotta (`terracotta`): $0.80$ (breathable, dries fast)
  - Plastic / Hanging (`plastic`, `hanging`): $1.00$ (baseline)
  - Glazed Ceramic / Cement (`ceramic_glazed`, `cement`): $1.15$ (retains moisture)
- **Pot Size Multipliers**:
  - $< 6$ inches: $0.85$ (small soil volume)
  - $6 - 10$ inches: $1.00$ (medium baseline)
  - $> 10$ inches: $1.20$ (large soil mass, retains moisture longer)
- **Placement Multipliers**:
  - Full Sun Outdoor (`outdoor_sun`): $0.70$
  - Balcony / Partial Shade (`balcony_shade`): $0.90$
  - Bright Indoor Window (`indoor_window`): $1.00$
  - Dim Indoor / Far from Window (`indoor_far`): $1.25$
  - Air-Conditioned Room (`air_con`): $1.20$ (lower temperature, slower dry time)

### 4.3 Clamping and Overrides
- Final interval is clamped between **1 and 30 days**.
- If `custom_water_days` is provided, all multipliers are bypassed.
- Provides an explanation object returning the formula factors and readable Thai/English breakdown string.

### 4.4 Task Lifecycle Transitions
- **Mark Complete**: Updates current task to `done`, creates `care_logs` entry, and schedules next task for `current_date + interval`.
- **Snooze**: Postpones `due_date` by $+1$ day (maximum 3 consecutive snoozes).
- **Skip**: Marks task `skipped`, schedules next regular cycle without writing to care logs.

---

## 5. Screen Specifications & User Experience

### 5.1 Homepage (`/`)
- Hero search bar with animated seasonal placeholders.
- 6 Curated shortcut chips (Indoor, Sun-loving, Pet-safe, Beginner-friendly, Air-purifying, Desk/Compact).
- "In Stock at Shop" carousel displaying 8 available species with real stock tags.
- Value proposition and "Start My Garden" call to action.

### 5.2 Search & Filter Hub (`/search`)
- Full-text & fuzzy search on Thai, English, Latin names, and aliases.
- Faceted multi-select filters: light, water need, placement, difficulty (1–5 stars), pet safety, size, stock status.
- URL query parameter synchronization (`?q=...&light=...`).
- Automatic logging of zero-result queries into `search_misses` with a fallback LINE chat inquiry CTA.

### 5.3 Plant Details (`/plants/[slug]`)
- Authentic photo gallery with "Taken at Shop" (`ถ่ายที่ร้าน`) badges.
- Botanical header (Thai, English, Scientific name, aliases) and stock status badge.
- 6-metric summary grid (Light, Water, Placement, Difficulty, Pet Safety, Size).
- Human-readable seasonal care instructions derived from `care_templates`.
- Prominent "Shop Note" box containing exclusive plant care wisdom.
- FAQ and troubleshooting accordion (`species_problems`).
- Sticky bottom mobile/desktop action bar with [ Ask Shop on LINE ] and [ + Add to My Garden ].

### 5.4 LINE Handoff & Inquiry Modal
- Prepares inquiry record in `inquiries` and issues unique code `TFL-XXXX`.
- Generates pre-formatted inquiry text tailored to intent (`price`, `availability`, `care_help`).
- Deep-links directly to LINE OA on mobile; renders high-res QR code and text copy on desktop.

### 5.5 My Garden (`/garden`)
- Plant cards with colorblind-safe status badges (Overdue, Due Today, Future).
- One-click "Watered" (`รดแล้ว`) quick-action button on each card.
- Empty state with onboarding prompt to add first plant.

### 5.6 4-Step Add Plant Wizard (`/garden/add`)
1. **Species Search & Selection**: Choose from 30 catalog species or enter a custom name.
2. **Plant Nickname & Origin**: Nickname, date acquired, and acquisition source.
3. **Pot Sizing & Material**: Diameter in inches and visual pot material selection.
4. **Placement Environment**: 5 visual microclimate options.
- **Live Calculation Card**: Displays calculated interval with formula breakdown in real-time before saving.

### 5.7 Plant Care Details & Calendar (`/garden/[id]`)
- 30-day interactive calendar preview of scheduled care tasks.
- Care history timeline (`care_logs`) with timestamps.
- Quick environmental settings editor with instant interval recalculation.
- Plant archive button (`is_active = false`).

### 5.8 Today's Care Dashboard (`/today`)
- Consolidated list of pending and overdue tasks across all active plants.
- "Mark All Complete" batch action.
- Per-task Done, Snooze, and Skip actions.

### 5.9 Shop Admin Dashboard (`/admin`)
- Accessible to staff and admin roles.
- **Inventory Control**: Instant inline toggle for species stock status (`in_stock`, `made_to_order`, `seasonal`).
- **Inquiry Logs**: List of customer inquiries with timestamps and reference codes.
- **Search Misses Analytics**: High-priority list of unhandled customer search queries.

---

## 6. Global State, Internationalization & Theming

- **Bilingual Support (`lib/i18n/translations.ts`)**: Thai (default) and English translation dictionary accessible via `AppContext`'s `t(key)` helper.
- **Theme Management**: Dark and light mode toggle using Tailwind's `class` strategy, stored in `localStorage`.
- **Demo & Guest Authentication**:
  - Role switcher in UI allowing instant toggling between `guest`, `customer`, `staff`, and `admin`.
  - Automatic `guestToken` generation and storage in `localStorage`.
  - Automatic guest-to-account data migration upon customer login.

---

## 7. Error Handling, Accessibility & Quality Assurance

- **Database Reliability**: PGlite self-boots with idempotent DDL statements and auto-seeding.
- **Clamping & Bounds**: Strict 1–30 day clamping on calculated care schedules.
- **Accessibility**: WCAG AA color contrast, touch targets $\ge 44 \times 44\text{px}$, accessible SVG icons and multi-modal status indicators.
- **Typography**: Thai typography configured to prevent vowel and tone mark truncation.
- **Testing**:
  - Comprehensive unit test suite in `lib/care/scheduler.test.ts` covering seasons, pot materials, sizes, placements, clamping, and task rollover.
  - End-to-end type validation (`npm run build`).
