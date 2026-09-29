# Design Spec: Milestone 1 — Production Hardening & PDPA Privacy Compliance

**Date:** 2026-09-29  
**Status:** Approved by User  
**Target Repository:** `tppoom/TreeForLife` (`/Users/tppoom/Desktop/Projects/TreeForLife`)  
**Milestone:** M1 (Security, Trust & Privacy Baseline)  
**Covers:** `docs/features/F00-production-hardening.md` + `docs/features/F11-pdpa-privacy.md`  

---

## 1. Executive Summary & Goals

TreeForLife currently possesses functional core features for Phase 1 (Plant Catalog, 3-Season Care Scheduler, My Garden, Today's Tasks, LINE Handoff), but lacks critical production-grade security and privacy controls:
1. **Garden Plant Ownership**: Any caller who knows a `user_plant_id` can modify or archive another person's plant.
2. **Actor Impersonation**: API routes accept `userId` or `guestToken` from request body/query params without server-side verification.
3. **Missing Rate Limiting**: Malicious actors or crawlers can flood inquiry and write routes without restriction.
4. **Missing Request Validation**: Input structures rely on informal checks rather than strict schema validation.
5. **Raw Database Error Leakage**: 500 error responses currently expose internal database error messages.
6. **PDPA Legal Compliance**: Thai PDPA (B.E. 2562) mandates explicit privacy disclosures, terms of service, right to access/download personal data, and right to be forgotten (data deletion).

Milestone 1 delivers a secure, robust foundation with zero external API fees or third-party service dependencies.

---

## 2. Architecture & Request Lifecycle

```
[ Incoming HTTP Request ]
            │
            ▼
[ Security Headers Middleware (next.config.ts) ]
            │  X-Content-Type-Options: nosniff
            │  X-Frame-Options: DENY
            │  Referrer-Policy: strict-origin-when-cross-origin
            │  Permissions-Policy: camera=(self), geolocation=()
            ▼
[ Rate Limiter (lib/http/rate-limit.ts) ]
            │  Check/increment window count in `rate_limits` table
            │  Exceeded? ──▶ Return 429 Too Many Requests (Retry-After)
            ▼
[ Actor Extraction (lib/auth/actor.ts) ]
            │  Extract `x-guest-token` header (NEVER trust body.userId / query.guestToken)
            │  Resolves Actor: { kind: "guest", guestToken } | { kind: "anonymous" }
            ▼
[ Schema Validation (lib/validation/*.ts) ]
            │  Zod parse request body / query parameters
            │  Invalid? ──▶ Return 400 Bad Request ({ error: { code: "VALIDATION", message } })
            ▼
[ Ownership Verification (lib/auth/actor.ts: requireOwner) ]
            │  Check if userPlant.guestToken === actor.guestToken (or user_id match)
            │  Mismatch? ──▶ Return 404 Not Found (Never reveal whether resource ID exists)
            ▼
[ Database Services (Drizzle ORM + PostgreSQL / PGlite) ]
            │  Optimized with database indexes (user_id, guest_token, due_date)
            ▼
[ Unified Error Formatting (lib/http/errors.ts) ]
            │  Catch all exceptions: sanitize message, log server-side
            ▼
[ HTTP Response ({ success: true, data } or { error: { code, message } }) ]
```

---

## 3. Detailed Component Specifications

### 3.1. Unified Error Handling & HTTP Statuses (`lib/http/errors.ts`)

Create a unified error abstraction to ensure all API responses adhere to a consistent JSON structure and never leak raw SQL or stack traces to clients.

```ts
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function toErrorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return Response.json(
      { error: { code: error.code, message: error.message, details: error.details } },
      { status: error.statusCode }
    );
  }

  // Sanitize internal server errors
  console.error("[Internal Server Error]:", error);
  return Response.json(
    { error: { code: "INTERNAL_ERROR", message: "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง" } },
    { status: 500 }
  );
}
```

Standard Error Codes:
- `400`: `VALIDATION_ERROR`
- `401`: `UNAUTHORIZED`
- `403`: `FORBIDDEN`
- `404`: `NOT_FOUND`
- `429`: `RATE_LIMITED`
- `500`: `INTERNAL_ERROR`

---

### 3.2. Actor & Ownership System (`lib/auth/actor.ts`)

Define authenticated/guest identity from request metadata:

```ts
export type Actor =
  | { kind: "user"; userId: string; role: "customer" | "staff" | "admin"; guestToken: string | null }
  | { kind: "guest"; guestToken: string }
  | { kind: "anonymous"; ip: string };

export async function getActor(req: Request): Promise<Actor> {
  const guestToken = req.headers.get("x-guest-token");
  if (guestToken && guestToken.trim().length > 0) {
    return { kind: "guest", guestToken: guestToken.trim() };
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  return { kind: "anonymous", ip };
}

export function requireOwner(
  actor: Actor,
  plant: { userId?: string | null; guestToken?: string | null }
): void {
  if (actor.kind === "guest" && plant.guestToken && actor.guestToken === plant.guestToken) {
    return;
  }
  if (actor.kind === "user" && plant.userId && actor.userId === plant.userId) {
    return;
  }
  // Respond with 404 instead of 403 to prevent ID enumeration attacks
  throw new HttpError(404, "NOT_FOUND", "ไม่พบต้นไม้ที่ระบุ");
}
```

---

### 3.3. Database Schema Hardening & Rate Limiting (`db/schema.ts`, `lib/http/rate-limit.ts`)

#### 1. Schema Additions & Indexes in `db/schema.ts`:
- **`rate_limits` table**:
  ```ts
  export const rateLimits = pgTable("rate_limits", {
    key: text("key").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(1),
  }, (t) => [
    primaryKey({ columns: [t.key, t.windowStart] }),
  ]);
  ```
- **Indexes**:
  - `user_plants_user_idx` on `user_plants(user_id)` where `is_active`
  - `user_plants_guest_idx` on `user_plants(guest_token)` where `is_active`
  - `care_tasks_due_idx` on `care_tasks(due_date, status)`
  - `care_logs_plant_idx` on `care_logs(user_plant_id, performed_at DESC)`
  - `inquiries_created_idx` on `inquiries(created_at DESC)`
  - `species_stock_idx` on `species(stock_status)`
  - `favorites_user_species_uq` on `favorites(user_id, species_id)`
  - `favorites_guest_species_uq` on `favorites(guest_token, species_id)`

#### 2. Rate Limiting Engine (`lib/http/rate-limit.ts`):
- Sliding/fixed 60-second window.
- Limits:
  - Write operations (`POST /api/garden/plants`, task actions): 30 req/min per actor.
  - Inquiries (`POST /api/inquiries`): 10 req/min per IP.
  - Search queries: 60 req/min per IP.
  - Account export: 3 req/day per actor.
- Exceeding limit returns HTTP 429 with `Retry-After: 60` header and `{ error: { code: "RATE_LIMITED", message: "คุณส่งคำขอถี่เกินไป กรุณารอสักครู่" } }`.

---

### 3.4. Input Validation with Zod (`lib/validation/`)

Add `zod` dependency to `package.json`. Define strict schemas:
1. `lib/validation/garden.ts`:
   - `AddPlantSchema`:
     - `speciesId`: UUID string
     - `nickname`: string (1–40 chars)
     - `potMaterial`: enum (`terracotta`, `plastic`, `ceramic_glazed`, `cement`, `hanging`)
     - `potSizeInch`: integer (1–40)
     - `placement`: enum (`outdoor_sun`, `balcony_shade`, `indoor_window`, `indoor_far`, `air_con`)
     - `customWaterDays`: optional integer (1–30)
     - `notes`: optional string (max 500 chars)
   - `UpdatePlantSchema`: partial of AddPlantSchema + `isActive` boolean.
   - `TaskActionSchema`: `taskId` (UUID), `action` (`done` | `snooze` | `skip`).
2. `lib/validation/inquiry.ts`:
   - `InquiryCreateSchema`:
     - `speciesId`: optional UUID
     - `sourcePage`: string (1–50 chars)
     - `intent`: enum (`price`, `availability`, `care_help`, `design_quote`)
     - `payload`: record with max size check (<= 4KB).

---

### 3.5. API Routes Security & Ownership Enforcement

Update existing routes:
1. `app/api/garden/plants/route.ts`:
   - `GET`: Read `actor` from `getActor(req)`. Filter `userPlants` strictly by `actor.guestToken` or `actor.userId`. If anonymous, return `[]`.
   - `POST`: Parse body with `AddPlantSchema`. Associate plant strictly with `actor.guestToken` or `actor.userId`. Rate limit check.
2. `app/api/garden/plants/[id]/route.ts`:
   - `GET`: Fetch plant by id. Call `requireOwner(actor, plant)`.
   - `PATCH`: Parse body with `UpdatePlantSchema`. Fetch plant, call `requireOwner(actor, plant)`. Update record.
3. `app/api/garden/plants/[id]/archive/route.ts`:
   - `POST`: Fetch plant, call `requireOwner(actor, plant)`. Set `isActive = false`.
4. `app/api/garden/tasks/route.ts`:
   - `GET`: Fetch tasks only for user's/guest's active plants.
   - `POST`: Verify that the task being marked done/snoozed/skipped belongs to a plant owned by the caller.
5. `app/api/garden/merge/route.ts`:
   - Before full F02 LINE login: Return 404 in production to prevent arbitrary guest-to-user reassignment.
6. `app/api/inquiries/route.ts`:
   - Apply rate limit (10 req/min per IP). Validate with `InquiryCreateSchema`.

---

### 3.6. Security Headers & User-Friendly Error Pages

1. `next.config.ts`:
   Configure `headers()`:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(self), geolocation=(), microphone=()`
2. `app/not-found.tsx`:
   Botanical luxury 404 page with search bar, link to home, and LINE OA contact button.
3. `app/error.tsx`:
   Client boundary error page with "ลองใหม่อีกครั้ง" (Retry) and LINE contact link.

---

### 3.7. PDPA Privacy, Terms & Data Rights (`/privacy`, `/terms`, `/api/account/*`)

1. **Content**:
   - `content/privacy.th.md` & `content/privacy.en.md`:
     - Data collected (guest token, plant collection, care logs, inquiries).
     - Storage locations & data processors (Supabase in Singapore, Vercel in Singapore/US).
     - Data retention terms (guest data active 180 days, inquiry logs retained for shop service).
     - User rights under Thai PDPA (Access, Rectification, Erasure, Portability).
     - Contact details (Shop LINE OA, contact email).
   - `content/terms.th.md`:
     - Botanical advice disclaimer (general care guidelines, environmental variations).
     - Non-e-commerce clarification (consultations & orders fulfilled via LINE OA).
2. **Pages**:
   - `app/privacy/page.tsx` & `app/terms/page.tsx`:
     - Markdown reader components with Botanical styling and language switcher.
     - Footer links updated in `components/layout/Footer.tsx`.
3. **Data Portability (`GET /api/account/export`)**:
   - Downloads a single JSON file containing:
     - Plants, care tasks, care logs, inquiries, favorites associated with the caller's guest token or user ID.
   - Response header: `Content-Disposition: attachment; filename="treeforlife-data-YYYY-MM-DD.json"`.
   - Rate limit: 3 times/day per actor.
4. **Data Erasure & Reset (`POST /api/account/delete`)**:
   - Server-side deletion of all plants, tasks, care logs, and favorites for the caller's token.
   - For guest users: provides an interactive "ล้างข้อมูลในเครื่องนี้" button in `/garden` that triggers the API deletion and clears `localStorage`.

---

## 4. Test Strategy & Verification Matrix

### 1. `test/hardening.test.ts` (Automated Security & Ownership Suite)
- **Actor Resolution**: `x-guest-token` header parses correctly; body `userId` is ignored.
- **Ownership Protection**: Caller A cannot view, update, or archive Caller B's plant (returns HTTP 404).
- **Task Protection**: Caller A cannot modify care tasks of Caller B's plant (returns HTTP 404).
- **Zod Validation**: Invalid payloads (e.g. `potSizeInch: -5`, `placement: "space"`, extra large payload) return HTTP 400 with `VALIDATION_ERROR`.
- **Rate Limiting**: 11th inquiry within 60 seconds returns HTTP 429 with `Retry-After`.
- **Unified Error Responses**: Server error does not leak database error message.

### 2. `test/privacy.test.ts` (PDPA & Data Rights Suite)
- **Data Export**: `GET /api/account/export` returns complete JSON with caller's plants, tasks, logs, and zero data from other tokens.
- **Data Deletion**: `POST /api/account/delete` removes all records associated with caller's token.
- **Privacy & Terms Pages**: Verify `/privacy` and `/terms` render markdown content cleanly with required legal sections.

### 3. Regression Suite
- Run `npm test` across all existing 14 test suites + new suites (expecting ~200+ passing tests).
- Run `npm run build` to verify 0 Next.js 15 build errors.

---

## 5. Success Criteria & Verification Checklist

- [ ] All API routes under `/api/garden/*` strictly authenticate via `getActor(req)` and enforce `requireOwner()`.
- [ ] No API route accepts `userId` or `guestToken` from request body or query parameters to authorize access.
- [ ] Accessing someone else's plant returns HTTP 404 (Not Found).
- [ ] Zod schema validation is active on all POST/PATCH endpoints.
- [ ] Database rate limiter blocks excessive requests with HTTP 429.
- [ ] Security headers are active in HTTP response headers.
- [ ] `/privacy` and `/terms` pages are published with bilingual markdown content.
- [ ] `GET /api/account/export` downloads user/guest JSON data.
- [ ] Guest data reset button in `/garden` deletes server records and clears local storage.
- [ ] All Vitest tests pass with 0 errors (`npm test`).
- [ ] Next.js production build completes with 0 errors (`npm run build`).
