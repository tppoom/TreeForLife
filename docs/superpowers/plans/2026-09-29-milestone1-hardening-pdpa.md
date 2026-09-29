# Milestone 1: Production Hardening & PDPA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement production-grade security, actor ownership verification, rate limiting, Zod validation, and PDPA privacy compliance for TreeForLife.

**Architecture:** A layered security pipeline: client requests pass through security headers, database-backed rate limiting, and an actor extraction layer reading `x-guest-token`. Zod parses inputs, `requireOwner()` enforces 404 resource isolation, unified error handling prevents SQL/stack-trace leakage, and `/privacy`, `/terms`, and `/api/account/*` provide data transparency, export, and erasure under Thai PDPA.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.7, Drizzle ORM, PostgreSQL (pg / PGlite), Zod 3, Vitest 2.

**Spec:** `docs/superpowers/specs/2026-09-29-milestone1-hardening-pdpa-design.md`

## Global Constraints

- Target repository: `tppoom/TreeForLife` (`/Users/tppoom/Desktop/Projects/TreeForLife`)
- Do NOT touch `/Users/tppoom/Desktop/tree-for-life`
- Zero regressions on existing 185 tests across 14 test files
- All API routes under `/api/garden/*` must authenticate callers via `getActor(req)` and verify ownership via `requireOwner()`
- Accessing another user's or guest's plant must return HTTP 404 (Not Found), never 403 or DB leak
- Rate limiting must return HTTP 429 with `Retry-After`
- All customer and legal copy in Thai (with English translation where specified)
- Botanical luxury theme tokens (`forest-*`, `sand-*`, `emerald-*`, `gold-*`) preserved

---

### Task 1: Unified HTTP Errors & Unified Error Response

**Files:**
- Create: `lib/http/errors.ts`
- Test: `test/errors.test.ts`

**Interfaces:**
- Produces: `HttpError`, `toErrorResponse(error: unknown): Response`, standard error codes (`VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `RATE_LIMITED`, `INTERNAL_ERROR`).

- [ ] **Step 1: Write test for unified HTTP errors**

```ts
// test/errors.test.ts
import { describe, it, expect } from "vitest";
import { HttpError, toErrorResponse } from "../lib/http/errors";

describe("Unified HTTP Errors", () => {
  it("creates HttpError with status code, code, and message", () => {
    const err = new HttpError(404, "NOT_FOUND", "ไม่พบต้นไม้ที่ระบุ", { id: "123" });
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("ไม่พบต้นไม้ที่ระบุ");
    expect(err.details).toEqual({ id: "123" });
  });

  it("toErrorResponse formats HttpError into standard JSON response", async () => {
    const err = new HttpError(400, "VALIDATION_ERROR", "ข้อมูลไม่ถูกต้อง", [{ field: "nickname" }]);
    const res = toErrorResponse(err);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "ข้อมูลไม่ถูกต้อง",
        details: [{ field: "nickname" }],
      },
    });
  });

  it("toErrorResponse sanitizes unknown internal errors to 500 without leaking raw details", async () => {
    const rawSqlError = new Error("syntax error at or near 'SELECT * FROM secrets'");
    const res = toErrorResponse(rawSqlError);
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error.code).toBe("INTERNAL_ERROR");
    expect(json.error.message).toContain("เกิดข้อผิดพลาด");
    expect(JSON.stringify(json)).not.toContain("secrets");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/errors.test.ts`
Expected: FAIL (Cannot find module '../lib/http/errors')

- [ ] **Step 3: Implement `lib/http/errors.ts`**

```ts
// lib/http/errors.ts
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
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details !== undefined ? { details: error.details } : {}),
        },
      },
      { status: error.statusCode }
    );
  }

  // Never leak raw DB error messages or stack traces in production
  console.error("[Internal Server Error]:", error);
  return Response.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง",
      },
    },
    { status: 500 }
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/errors.test.ts`
Expected: PASS (3 tests passed)

- [ ] **Step 5: Commit**

```bash
git add lib/http/errors.ts test/errors.test.ts
git commit -m "feat(security): add unified HTTP errors and response formatter"
```

---

### Task 2: Actor Extraction & Ownership Enforcement

**Files:**
- Create: `lib/auth/actor.ts`
- Test: `test/actor.test.ts`

**Interfaces:**
- Consumes: `HttpError` from `lib/http/errors.ts`
- Produces: `Actor` type, `getActor(req: Request): Promise<Actor>`, `requireOwner(actor: Actor, plant: { userId?: string | null; guestToken?: string | null }): void`, `requireStaff(actor: Actor): void`.

- [ ] **Step 1: Write test for Actor & Ownership**

```ts
// test/actor.test.ts
import { describe, it, expect } from "vitest";
import { getActor, requireOwner, requireStaff, type Actor } from "../lib/auth/actor";
import { HttpError } from "../lib/http/errors";

describe("Actor & Ownership Enforcement", () => {
  it("resolves guest actor from x-guest-token header", async () => {
    const req = new Request("https://example.com/api/garden/plants", {
      headers: { "x-guest-token": "guest-token-1234" },
    });
    const actor = await getActor(req);
    expect(actor.kind).toBe("guest");
    if (actor.kind === "guest") {
      expect(actor.guestToken).toBe("guest-token-1234");
    }
  });

  it("resolves anonymous actor with IP when no token is present", async () => {
    const req = new Request("https://example.com/api/garden/plants", {
      headers: { "x-forwarded-for": "203.0.113.195, 10.0.0.1" },
    });
    const actor = await getActor(req);
    expect(actor.kind).toBe("anonymous");
    if (actor.kind === "anonymous") {
      expect(actor.ip).toBe("203.0.113.195");
    }
  });

  it("requireOwner allows matching guestToken", () => {
    const actor: Actor = { kind: "guest", guestToken: "my-token" };
    expect(() => requireOwner(actor, { guestToken: "my-token", userId: null })).not.toThrow();
  });

  it("requireOwner throws 404 NOT_FOUND when guestToken mismatches", () => {
    const actor: Actor = { kind: "guest", guestToken: "my-token" };
    try {
      requireOwner(actor, { guestToken: "other-token", userId: null });
      expect.fail("Should have thrown HttpError");
    } catch (err: any) {
      expect(err).toBeInstanceOf(HttpError);
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe("NOT_FOUND");
    }
  });

  it("requireStaff throws 403 FORBIDDEN for non-staff", () => {
    const actor: Actor = { kind: "guest", guestToken: "my-token" };
    expect(() => requireStaff(actor)).toThrow(HttpError);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/actor.test.ts`
Expected: FAIL (Cannot find module '../lib/auth/actor')

- [ ] **Step 3: Implement `lib/auth/actor.ts`**

```ts
// lib/auth/actor.ts
import { HttpError } from "@/lib/http/errors";

export type Actor =
  | { kind: "user"; userId: string; role: "customer" | "staff" | "admin"; guestToken: string | null }
  | { kind: "guest"; guestToken: string }
  | { kind: "anonymous"; ip: string };

export async function getActor(req: Request): Promise<Actor> {
  const guestToken = req.headers.get("x-guest-token");
  if (guestToken && guestToken.trim().length > 0) {
    return { kind: "guest", guestToken: guestToken.trim() };
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
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

  // Always return 404 NOT_FOUND instead of 403 to prevent resource enumeration
  throw new HttpError(404, "NOT_FOUND", "ไม่พบต้นไม้ที่ระบุ");
}

export function requireStaff(actor: Actor): void {
  if (actor.kind === "user" && (actor.role === "staff" || actor.role === "admin")) {
    return;
  }
  throw new HttpError(403, "FORBIDDEN", "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/actor.test.ts`
Expected: PASS (5 tests passed)

- [ ] **Step 5: Commit**

```bash
git add lib/auth/actor.ts test/actor.test.ts
git commit -m "feat(auth): implement actor extraction and resource ownership verification"
```

---

### Task 3: Database Schema Hardening & Rate Limiting Engine

**Files:**
- Modify: `db/schema.ts`
- Create: `lib/http/rate-limit.ts`
- Test: `test/rate-limit.test.ts`

**Interfaces:**
- Produces: `rateLimits` table in Drizzle schema, `checkRateLimit({ key: string; limit: number; windowSeconds?: number }): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }>`, `assertRateLimit(opts): Promise<void>`.

- [ ] **Step 1: Write test for rate limiting**

```ts
// test/rate-limit.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../lib/db";
import { checkRateLimit, assertRateLimit } from "../lib/http/rate-limit";
import { HttpError } from "../lib/http/errors";

describe("Database-Backed Rate Limiting", () => {
  beforeAll(async () => {
    await getDb();
  });

  it("allows requests under the limit", async () => {
    const key = `test-ip-${Date.now()}`;
    const result1 = await checkRateLimit({ key, limit: 3, windowSeconds: 60 });
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = await checkRateLimit({ key, limit: 3, windowSeconds: 60 });
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(1);
  });

  it("blocks requests over the limit and calculates retry-after", async () => {
    const key = `test-block-${Date.now()}`;
    await checkRateLimit({ key, limit: 2, windowSeconds: 60 });
    await checkRateLimit({ key, limit: 2, windowSeconds: 60 });

    const blocked = await checkRateLimit({ key, limit: 2, windowSeconds: 60 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("assertRateLimit throws HttpError(429) when limit exceeded", async () => {
    const key = `test-assert-${Date.now()}`;
    await assertRateLimit({ key, limit: 1, windowSeconds: 60 });

    await expect(assertRateLimit({ key, limit: 1, windowSeconds: 60 })).rejects.toThrow(HttpError);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/rate-limit.test.ts`
Expected: FAIL (Cannot find module '../lib/http/rate-limit')

- [ ] **Step 3: Update `db/schema.ts` and implement `lib/http/rate-limit.ts`**

In `db/schema.ts`, add `primaryKey` import from `drizzle-orm/pg-core` and define `rateLimits` table and indexes:
```ts
// In db/schema.ts:
export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(1),
  },
  (table) => [
    primaryKey({ columns: [table.key, table.windowStart] }),
  ]
);

export type RateLimit = InferSelectModel<typeof rateLimits>;
export type NewRateLimit = InferInsertModel<typeof rateLimits>;
```
Also update `SCHEMA_DDL` in `lib/db/index.ts` to ensure `CREATE TABLE IF NOT EXISTS rate_limits (key TEXT NOT NULL, window_start TIMESTAMPTZ NOT NULL, count INTEGER NOT NULL DEFAULT 1, PRIMARY KEY (key, window_start));` is executed on boot.

Then create `lib/http/rate-limit.ts`:
```ts
// lib/http/rate-limit.ts
import { getDb } from "@/lib/db";
import { rateLimits } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { HttpError } from "@/lib/http/errors";

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { key, limit, windowSeconds = 60 } = options;
  const db = await getDb();
  const now = new Date();

  // Align windowStart to the current window interval
  const windowMs = windowSeconds * 1000;
  const windowStartTime = new Date(Math.floor(now.getTime() / windowMs) * windowMs);
  const nextWindowTime = new Date(windowStartTime.getTime() + windowMs);
  const retryAfterSeconds = Math.max(1, Math.ceil((nextWindowTime.getTime() - now.getTime()) / 1000));

  // Upsert rate limit row
  const result = await db
    .insert(rateLimits)
    .values({
      key,
      windowStart: windowStartTime,
      count: 1,
    })
    .onConflictDoUpdate({
      target: [rateLimits.key, rateLimits.windowStart],
      set: {
        count: sql`${rateLimits.count} + 1`,
      },
    })
    .returning({ count: rateLimits.count });

  const currentCount = result[0]?.count ?? 1;
  const allowed = currentCount <= limit;
  const remaining = Math.max(0, limit - currentCount);

  return {
    allowed,
    remaining,
    retryAfterSeconds,
  };
}

export async function assertRateLimit(options: RateLimitOptions): Promise<void> {
  const result = await checkRateLimit(options);
  if (!result.allowed) {
    throw new HttpError(
      429,
      "RATE_LIMITED",
      "คุณส่งคำขอถี่เกินไป กรุณารอสักครู่แล้วลองใหม่",
      { retryAfter: result.retryAfterSeconds }
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/rate-limit.test.ts`
Expected: PASS (3 tests passed)

- [ ] **Step 5: Commit**

```bash
git add db/schema.ts lib/db/index.ts lib/http/rate-limit.ts test/rate-limit.test.ts
git commit -m "feat(security): implement database-backed rate limiting and schema indexes"
```

---

### Task 4: Zod Input Validation Schemas

**Files:**
- Modify: `package.json` (add `zod`)
- Create: `lib/validation/garden.ts`
- Create: `lib/validation/inquiry.ts`
- Test: `test/validation.test.ts`

**Interfaces:**
- Produces: `AddPlantSchema`, `UpdatePlantSchema`, `TaskActionSchema`, `InquiryCreateSchema`.

- [ ] **Step 1: Install Zod and write validation tests**

Run: `npm install zod`

Write test in `test/validation.test.ts`:
```ts
// test/validation.test.ts
import { describe, it, expect } from "vitest";
import { AddPlantSchema, TaskActionSchema } from "../lib/validation/garden";
import { InquiryCreateSchema } from "../lib/validation/inquiry";

describe("Zod Validation Schemas", () => {
  it("validates AddPlantSchema with valid data", () => {
    const valid = {
      speciesId: "11111111-1111-1111-1111-111111111111",
      nickname: "น้องมอนเดลี่",
      potMaterial: "terracotta",
      potSizeInch: 8,
      placement: "indoor_window",
      customWaterDays: 3,
    };
    const result = AddPlantSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects AddPlantSchema with invalid pot size or negative water days", () => {
    const invalid = {
      speciesId: "not-a-uuid",
      nickname: "",
      potMaterial: "unobtanium",
      potSizeInch: -5,
      placement: "outer_space",
    };
    const result = AddPlantSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("validates InquiryCreateSchema within payload limit", () => {
    const valid = {
      speciesId: "11111111-1111-1111-1111-111111111111",
      sourcePage: "/plants/monstera-deliciosa",
      intent: "price",
      payload: { message: "มีของพร้อมส่งไหม" },
    };
    const result = InquiryCreateSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/validation.test.ts`
Expected: FAIL (Cannot find modules)

- [ ] **Step 3: Implement validation schemas**

Create `lib/validation/garden.ts`:
```ts
// lib/validation/garden.ts
import { z } from "zod";

export const AddPlantSchema = z.object({
  speciesId: z.string().uuid("รหัสพันธุ์ไม้ไม่ถูกต้อง"),
  nickname: z.string().trim().min(1, "กรุณาระบุชื่อต้นไม้").max(40, "ชื่อยาวเกิน 40 ตัวอักษร"),
  potMaterial: z.enum(["terracotta", "plastic", "ceramic_glazed", "cement", "hanging"], {
    errorMap: () => ({ message: "ประเภทกระถางไม่ถูกต้อง" }),
  }),
  potSizeInch: z.coerce.number().int().min(1, "ขนาดกระถางต้องอย่างน้อย 1 นิ้ว").max(40, "ขนาดกระถางสูงสุด 40 นิ้ว"),
  placement: z.enum(["outdoor_sun", "balcony_shade", "indoor_window", "indoor_far", "air_con"], {
    errorMap: () => ({ message: "ตำแหน่งวางไม่ถูกต้อง" }),
  }),
  customWaterDays: z.coerce.number().int().min(1).max(30).optional().nullable(),
  notes: z.string().max(500, "บันทึกยาวเกิน 500 ตัวอักษร").optional().nullable(),
});

export const UpdatePlantSchema = AddPlantSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const TaskActionSchema = z.object({
  taskId: z.string().uuid("รหัสงานไม่ถูกต้อง"),
  action: z.enum(["done", "snooze", "skip"], {
    errorMap: () => ({ message: "คำสั่งงานไม่ถูกต้อง" }),
  }),
  notes: z.string().max(500).optional().nullable(),
});

export type AddPlantInput = z.infer<typeof AddPlantSchema>;
export type UpdatePlantInput = z.infer<typeof UpdatePlantSchema>;
export type TaskActionInput = z.infer<typeof TaskActionSchema>;
```

Create `lib/validation/inquiry.ts`:
```ts
// lib/validation/inquiry.ts
import { z } from "zod";

export const InquiryCreateSchema = z.object({
  speciesId: z.string().uuid("รหัสพันธุ์ไม้ไม่ถูกต้อง").optional().nullable(),
  sourcePage: z.string().trim().min(1).max(100),
  intent: z.enum(["price", "availability", "care_help", "design_quote"], {
    errorMap: () => ({ message: "ประเภทคำถามไม่ถูกต้อง" }),
  }),
  payload: z
    .record(z.unknown())
    .default({})
    .refine((val) => JSON.stringify(val).length <= 4096, {
      message: "ข้อมูลประกอบมีขนาดเกินกำหนด (สูงสุด 4KB)",
    }),
});

export type InquiryCreateInput = z.infer<typeof InquiryCreateSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/validation.test.ts`
Expected: PASS (3 tests passed)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json lib/validation/garden.ts lib/validation/inquiry.ts test/validation.test.ts
git commit -m "feat(validation): add Zod validation schemas for garden and inquiries"
```

---

### Task 5: API Routes Ownership & Security Hardening

**Files:**
- Modify: `app/api/garden/plants/route.ts`
- Modify: `app/api/garden/plants/[id]/route.ts`
- Modify: `app/api/garden/plants/[id]/archive/route.ts`
- Modify: `app/api/garden/tasks/route.ts`
- Modify: `app/api/garden/merge/route.ts`
- Modify: `app/api/inquiries/route.ts`
- Create: `test/hardening.test.ts`

**Interfaces:**
- Consumes: `getActor`, `requireOwner` from `lib/auth/actor.ts`; `assertRateLimit` from `lib/http/rate-limit.ts`; `toErrorResponse`, `HttpError` from `lib/http/errors.ts`; schemas from `lib/validation/`.
- Produces: Protected endpoints with ownership checks and rate limits.

- [ ] **Step 1: Write comprehensive security integration test**

```ts
// test/hardening.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../lib/db";
import { GET as getPlants, POST as postPlant } from "../app/api/garden/plants/route";
import { GET as getPlant, PATCH as patchPlant } from "../app/api/garden/plants/[id]/route";
import { POST as archivePlant } from "../app/api/garden/plants/[id]/archive/route";
import { POST as postInquiry } from "../app/api/inquiries/route";

describe("API Security & Ownership Hardening", () => {
  let guestTokenA: string;
  let guestTokenB: string;
  let plantAId: string;
  let testSpeciesId: string;

  beforeAll(async () => {
    const db = await getDb();
    guestTokenA = `guest-alice-${Date.now()}`;
    guestTokenB = `guest-bob-${Date.now()}`;

    // Get any existing species id
    const res = await db.query.species.findFirst();
    if (!res) throw new Error("Seed species required for test");
    testSpeciesId = res.id;

    // Create plant for guest A
    const createReq = new Request("https://example.com/api/garden/plants", {
      method: "POST",
      headers: { "x-guest-token": guestTokenA, "content-type": "application/json" },
      body: JSON.stringify({
        speciesId: testSpeciesId,
        nickname: "Alice Tree",
        potMaterial: "terracotta",
        potSizeInch: 8,
        placement: "indoor_window",
      }),
    });
    const createRes = await postPlant(createReq);
    expect(createRes.status).toBe(201);
    const createJson = await createRes.json();
    plantAId = createJson.data.id;
  });

  it("Guest B cannot view Guest A's plant (returns 404 NOT_FOUND)", async () => {
    const req = new Request(`https://example.com/api/garden/plants/${plantAId}`, {
      headers: { "x-guest-token": guestTokenB },
    });
    const res = await getPlant(req, { params: Promise.resolve({ id: plantAId }) });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.code).toBe("NOT_FOUND");
  });

  it("Guest B cannot update Guest A's plant (returns 404 NOT_FOUND)", async () => {
    const req = new Request(`https://example.com/api/garden/plants/${plantAId}`, {
      method: "PATCH",
      headers: { "x-guest-token": guestTokenB, "content-type": "application/json" },
      body: JSON.stringify({ nickname: "Hacked by Bob" }),
    });
    const res = await patchPlant(req, { params: Promise.resolve({ id: plantAId }) });
    expect(res.status).toBe(404);
  });

  it("Guest B cannot archive Guest A's plant (returns 404 NOT_FOUND)", async () => {
    const req = new Request(`https://example.com/api/garden/plants/${plantAId}/archive`, {
      method: "POST",
      headers: { "x-guest-token": guestTokenB },
    });
    const res = await archivePlant(req, { params: Promise.resolve({ id: plantAId }) });
    expect(res.status).toBe(404);
  });

  it("Rejects invalid payload with 400 VALIDATION_ERROR", async () => {
    const req = new Request("https://example.com/api/garden/plants", {
      method: "POST",
      headers: { "x-guest-token": guestTokenA, "content-type": "application/json" },
      body: JSON.stringify({
        speciesId: testSpeciesId,
        nickname: "", // invalid empty nickname
        potMaterial: "gold",
        potSizeInch: -1,
        placement: "nowhere",
      }),
    });
    const res = await postPlant(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/hardening.test.ts`
Expected: FAIL (Ownership checks not yet implemented on endpoints)

- [ ] **Step 3: Update API routes with ownership, rate-limit, and validation**

1. Update `app/api/garden/plants/route.ts`:
   - Use `getActor(req)`.
   - In `GET`: If `actor.kind === 'anonymous'`, return `{ success: true, data: [] }`. Otherwise query where `guestToken = actor.guestToken` or `userId = actor.userId`.
   - In `POST`: Call `assertRateLimit({ key: 'plant:write:' + actorId, limit: 30 })`. Validate body with `AddPlantSchema`. Associate plant with actor.
   - Wrap in `try/catch` and return `toErrorResponse(err)`.

2. Update `app/api/garden/plants/[id]/route.ts`:
   - `GET` & `PATCH`: Look up plant by ID. If not found or `requireOwner(actor, plant)` fails, return 404.
   - In `PATCH`: Validate body with `UpdatePlantSchema`.

3. Update `app/api/garden/plants/[id]/archive/route.ts`:
   - Look up plant by ID. Call `requireOwner(actor, plant)`.
   - Set `isActive = false`.

4. Update `app/api/garden/tasks/route.ts`:
   - `GET`: Query tasks only for plants owned by the current actor.
   - `POST`: Validate with `TaskActionSchema`. Verify the task's plant is owned by the caller before updating task status.

5. Update `app/api/garden/merge/route.ts`:
   - Return 404 in production mode or when not authenticated as user to prevent unauthorized merges before F02.

6. Update `app/api/inquiries/route.ts`:
   - Get client IP. Call `assertRateLimit({ key: 'inquiry:ip:' + ip, limit: 10, windowSeconds: 60 })`.
   - Validate body with `InquiryCreateSchema`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/hardening.test.ts`
Expected: PASS (All 4 security tests passed)

- [ ] **Step 5: Commit**

```bash
git add app/api/garden/plants/route.ts app/api/garden/plants/[id]/route.ts app/api/garden/plants/[id]/archive/route.ts app/api/garden/tasks/route.ts app/api/garden/merge/route.ts app/api/inquiries/route.ts test/hardening.test.ts
git commit -m "feat(security): enforce actor ownership, Zod validation, and rate limits on all garden routes"
```

---

### Task 6: Security Headers & Error Boundary Pages

**Files:**
- Modify: `next.config.ts`
- Create: `app/not-found.tsx`
- Create: `app/error.tsx`

**Interfaces:**
- Produces: Standard security headers (`nosniff`, `DENY`, `strict-origin`), botanical luxury 404 and 500 error boundaries.

- [ ] **Step 1: Update `next.config.ts` with security headers**

In `next.config.ts`:
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), geolocation=(), microphone=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 2: Create `app/not-found.tsx`**

Botanical luxury 404 page:
- Heading: "404 — ไม่พบหน้าที่คุณต้องการ"
- Subtitle: "หน้าที่คุณกำลังค้นหาอาจถูกย้าย หรือที่อยู่เว็บไซต์อาจไม่ถูกต้อง"
- Quick search bar linking to `/search`
- "กลับสู่หน้าแรก" button + LINE OA contact link.

- [ ] **Step 3: Create `app/error.tsx`**

Client error boundary:
- Heading: "เกิดข้อผิดพลาดชั่วคราว"
- "ลองใหม่อีกครั้ง" button (`reset()`)
- LINE OA inquiry link for customer support.

- [ ] **Step 4: Verify Next.js build succeeds**

Run: `npm run build`
Expected: Build passes with new routes and headers.

- [ ] **Step 5: Commit**

```bash
git add next.config.ts app/not-found.tsx app/error.tsx
git commit -m "feat(ui): add HTTP security headers and botanical luxury error pages"
```

---

### Task 7: PDPA Markdown Content & Legal Pages

**Files:**
- Create: `content/privacy.th.md`
- Create: `content/privacy.en.md`
- Create: `content/terms.th.md`
- Create: `app/privacy/page.tsx`
- Create: `app/terms/page.tsx`
- Modify: `components/layout/Footer.tsx`

**Interfaces:**
- Produces: `/privacy` and `/terms` public pages compliant with Thai PDPA, updated Footer links.

- [ ] **Step 1: Create Markdown content files**

Create `content/privacy.th.md`:
- Data collection disclosure: Guest token, plant records, watering schedules, inquiry reference codes.
- Processing locations: Supabase (Singapore), Vercel (Singapore/US).
- Retention policy: Active guest records kept 180 days.
- User rights: Right to access, download data, and erase records.
- Contact: TreeForLife Nursery Team, LINE OA `@TreeForLife`.

Create `content/terms.th.md`:
- Botanical care guidance disclaimer: Advice is customized by Thai seasons and pot material, but local humidity/light conditions may vary.
- Consultation fulfillment terms.

- [ ] **Step 2: Create `app/privacy/page.tsx` and `app/terms/page.tsx`**

Render the markdown content cleanly within botanical luxury container (`max-w-4xl mx-auto py-12 px-4`).
Provide language switcher toggle (TH / EN).

- [ ] **Step 3: Update `components/layout/Footer.tsx`**

Ensure footer contains working links to `/privacy` ("นโยบายความเป็นส่วนตัว") and `/terms` ("ข้อกำหนดการใช้งาน").

- [ ] **Step 4: Verify build and routes**

Run: `npm run build`
Expected: `/privacy` and `/terms` generated successfully.

- [ ] **Step 5: Commit**

```bash
git add content/privacy.th.md content/privacy.en.md content/terms.th.md app/privacy/page.tsx app/terms/page.tsx components/layout/Footer.tsx
git commit -m "feat(legal): add PDPA privacy policy and terms of service pages"
```

---

### Task 8: Account Data Portability & Erasure (`/api/account/*` & Guest Reset)

**Files:**
- Create: `app/api/account/export/route.ts`
- Create: `app/api/account/delete/route.ts`
- Modify: `components/garden/GardenPlantsClient.tsx`
- Test: `test/privacy.test.ts`

**Interfaces:**
- Consumes: `getActor` from `lib/auth/actor.ts`, `assertRateLimit` from `lib/http/rate-limit.ts`.
- Produces: `GET /api/account/export` (downloads JSON data file), `POST /api/account/delete` (erases data and clears guest records), interactive "ล้างข้อมูลในเครื่องนี้" button in `/garden`.

- [ ] **Step 1: Write test for PDPA export and deletion**

```ts
// test/privacy.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../lib/db";
import { GET as exportData } from "../app/api/account/export/route";
import { POST as deleteData } from "../app/api/account/delete/route";
import { POST as postPlant } from "../app/api/garden/plants/route";

describe("PDPA Data Rights (Export & Erasure)", () => {
  let guestToken: string;
  let testSpeciesId: string;

  beforeAll(async () => {
    const db = await getDb();
    guestToken = `guest-pdpa-${Date.now()}`;
    const res = await db.query.species.findFirst();
    if (!res) throw new Error("Seed species required for test");
    testSpeciesId = res.id;

    // Create a plant
    await postPlant(
      new Request("https://example.com/api/garden/plants", {
        method: "POST",
        headers: { "x-guest-token": guestToken, "content-type": "application/json" },
        body: JSON.stringify({
          speciesId: testSpeciesId,
          nickname: "Privacy Plant",
          potMaterial: "plastic",
          potSizeInch: 6,
          placement: "balcony_shade",
        }),
      })
    );
  });

  it("exports customer data as JSON file attachment", async () => {
    const req = new Request("https://example.com/api/account/export", {
      headers: { "x-guest-token": guestToken },
    });
    const res = await exportData(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(res.headers.get("content-disposition")).toContain("attachment; filename=");

    const json = await res.json();
    expect(json.guestToken).toBe(guestToken);
    expect(json.plants.length).toBeGreaterThan(0);
    expect(json.plants[0].nickname).toBe("Privacy Plant");
  });

  it("deletes all data for caller token and returns success", async () => {
    const req = new Request("https://example.com/api/account/delete", {
      method: "POST",
      headers: { "x-guest-token": guestToken },
    });
    const res = await deleteData(req);
    expect(res.status).toBe(200);

    // Verify plants are gone
    const exportReq = new Request("https://example.com/api/account/export", {
      headers: { "x-guest-token": guestToken },
    });
    const exportRes = await exportData(exportReq);
    const json = await exportRes.json();
    expect(json.plants.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/privacy.test.ts`
Expected: FAIL (Cannot find modules)

- [ ] **Step 3: Implement export and delete routes**

Create `app/api/account/export/route.ts`:
- Enforce rate limit (3 exports/day).
- Query `user_plants`, `care_tasks`, `care_logs`, `inquiries`, `favorites` matching `actor.guestToken` or `actor.userId`.
- Return `Response.json(data, { headers: { 'Content-Disposition': 'attachment; filename="treeforlife-data-YYYY-MM-DD.json"' } })`.

Create `app/api/account/delete/route.ts`:
- Delete plants, tasks, care logs, and favorites matching `actor.guestToken` or `actor.userId`.
- Return `{ success: true, message: "ลบข้อมูลทั้งหมดเรียบร้อยแล้ว" }`.

In `components/garden/GardenPlantsClient.tsx`:
- Add "การจัดการข้อมูลส่วนบุคคล (PDPA)" collapsible / button section with:
  - "ดาวน์โหลดข้อมูลของฉัน (JSON)"
  - "ล้างข้อมูลในเครื่องนี้" (confirms with user, calls `/api/account/delete`, clears `localStorage`, and reloads).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/privacy.test.ts`
Expected: PASS (2 tests passed)

- [ ] **Step 5: Commit**

```bash
git add app/api/account/export/route.ts app/api/account/delete/route.ts components/garden/GardenPlantsClient.tsx test/privacy.test.ts
git commit -m "feat(pdpa): implement data export and erasure API with garden reset button"
```

---

### Task 9: Full Milestone 1 Verification & Release

**Files:**
- Modify: `package.json` (bump version to `1.2.0`)
- Modify: `docs/DEPLOYMENT.md` (add security and PDPA verification instructions)
- Modify: `README.md` (document security and privacy capabilities)

- [ ] **Step 1: Bump version in `package.json` to `1.2.0`**

- [ ] **Step 2: Run complete test suite**

Run: `npm test`
Expected: 100% tests passing across all test suites (~200+ tests).

- [ ] **Step 3: Run production build verification**

Run: `npm run build`
Expected: Build passes with 0 TypeScript/ESLint errors and all routes compiled.

- [ ] **Step 4: Commit and create Git Release Tag**

```bash
git add package.json docs/DEPLOYMENT.md README.md
git commit -m "chore(release): bump version to 1.2.0 with production hardening and PDPA"
git tag -a v1.2.0-milestone1-hardening -m "Release v1.2.0: Milestone 1 Production Hardening & PDPA Compliance"
git push origin main --tags
```
