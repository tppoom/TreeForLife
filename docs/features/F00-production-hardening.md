# F00 — Production Hardening

> Milestone **M1** · Effort ~10 ชม. · Cost 0 · ต้องมีก่อน: —
> ปิดช่องโหว่ที่ทำให้ยังส่งลิงก์ให้ลูกค้าจริงไม่ได้ (SPEC §9.3)

## 1. ทำไม

ตอนนี้ API เชื่อข้อมูลจาก client ทั้งหมด: ใครรู้ `id` ของต้นไม้ก็แก้/archive ได้, `POST /api/garden/merge` รับ `userId` จาก body ทำให้ย้ายสวนของ guest คนอื่นเข้าบัญชีตัวเองได้, role switcher เดโมโผล่ใน production และตารางไม่มี index ทำให้ช้าเมื่อข้อมูลโต ถ้าลูกค้าจริงเจอบั๊กข้อมูลหาย = ความเชื่อใจร้านหาย

## 2. ขอบเขต

**ทำ**
1. `lib/auth/actor.ts` — ตัวตนผู้เรียกจาก server เท่านั้น
2. ตรวจ ownership ทุก route ใต้ `/api/garden/*`
3. Validation ด้วย `zod` ทุก route ที่รับ body/query
4. Rate limit แบบ fixed-window บน Postgres
5. ปิด role switcher เดโมใน production (`NEXT_PUBLIC_DEMO_MODE`)
6. Index ที่ขาด + unique ของ `favorites`
7. Security headers + หน้า error/404 ที่เป็นมิตร
8. แทนที่ Basic Auth ชั่วคราวใน `middleware.ts` ด้วย `requireStaff` เมื่อ F02 เสร็จ (ตอนนี้คง Basic Auth ไว้)

**ไม่ทำ**: ระบบล็อกอินจริง (F02), CAPTCHA

## 3. การออกแบบ

### 3.1 ตัวตนผู้เรียก — `lib/auth/actor.ts`

```ts
export type Actor =
  | { kind: "user"; userId: string; role: "customer" | "staff" | "admin"; guestToken: string | null }
  | { kind: "guest"; guestToken: string }
  | { kind: "anonymous" };

export async function getActor(req: Request): Promise<Actor>;
export function requireOwner(actor: Actor, plant: { userId: string | null; guestToken: string | null }): void; // throws HttpError(404)
export function requireStaff(actor: Actor): void; // throws HttpError(403)
```

- ก่อน F02: guest token มาจาก header `x-guest-token` (client ส่งจาก `localStorage('tfl_guest_token')`) — **ไม่รับจาก query/body อีกต่อไป**
- หลัง F02: `user` มาจาก session cookie · guest token ยังส่งมาได้เพื่อ merge
- ต้นที่ไม่ใช่ของผู้เรียก ตอบ **404 ไม่ใช่ 403** (ไม่บอกว่ามี id นี้อยู่)
- สร้าง `lib/http/errors.ts` (`HttpError`, `toResponse(err)`) ให้ทุก route ใช้รูปแบบ error เดียวกัน `{ error: { code, message } }` · **ห้ามส่ง `error.message` ดิบจาก DB กลับไปให้ client** (ตอนนี้ทุก route ทำอยู่)

### 3.2 Route ที่ต้องแก้

| Route | ปัจจุบัน | หลังแก้ |
|---|---|---|
| `GET/PATCH /api/garden/plants/[id]` | ไม่ตรวจเจ้าของ | `requireOwner` |
| `POST /api/garden/plants/[id]/archive` | ไม่ตรวจ | `requireOwner` |
| `GET/POST /api/garden/plants` | รับ `userId`/`guestToken` จาก query/body | ใช้ `actor` |
| `GET/POST /api/garden/tasks` | รับ `userId`/`guestToken` จาก query | ใช้ `actor` · action กับ task ต้องตรวจว่า task เป็นของต้นที่ผู้เรียกเป็นเจ้าของ |
| `POST /api/garden/merge` | รับ `userId` จาก body | **ต้องเป็น `actor.kind === "user"`** (หลัง F02) · ก่อน F02 ปิด route นี้ใน production (คืน 404) |
| `POST /api/inquiries` | ไม่จำกัด | rate limit 10/นาที/IP |
| `/api/admin/*` | Basic Auth ใน middleware | คงไว้ + `requireStaff` หลัง F02 |

Server component ที่อ่านข้อมูลสวน (`app/garden/[id]/page.tsx`) ต้องไม่ render ข้อมูลต้นของคนอื่น — ย้ายการโหลดข้อมูลส่วนตัวไปฝั่ง client ผ่าน API ที่ตรวจสิทธิ์แล้ว หรืออ่าน cookie session (หลัง F02)

### 3.3 Validation — `lib/validation/`

- เพิ่ม dependency `zod`
- 1 ไฟล์ต่อโดเมน: `garden.ts`, `inquiry.ts`, `admin.ts` — export schema + type ที่ infer ได้ แล้วให้ service ใช้ type จาก zod แทน interface ที่เขียนมือ
- ข้อจำกัดสำคัญ: `nickname` 1–40 ตัวอักษร · `potSizeInch` 1–40 · `customWaterDays` 1–30 · `notes` ≤ 500 · enum ทุกตัวตรงกับ union ใน `lib/care/scheduler.ts` · `payload` ของ inquiry ≤ 4KB

### 3.4 Rate limit — `lib/http/rate-limit.ts`

```sql
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT NOT NULL,              -- เช่น 'inquiry:ip:1.2.3.4'
  window_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_start)
);
```

- `INSERT ... ON CONFLICT (key, window_start) DO UPDATE SET count = rate_limits.count + 1 RETURNING count` — 1 query ต่อคำขอ
- IP จาก `x-forwarded-for` ตัวแรก (Vercel ตั้งให้)
- เกิน → 429 + header `Retry-After`
- cron `stale-cleanup` (F03) ลบแถวเก่ากว่า 1 วัน
- ค่าเริ่มต้น: เขียนข้อมูล 30/นาที/actor · inquiry 10/นาที/IP · search-miss 60/นาที/IP

### 3.5 โหมดเดโม

- `NEXT_PUBLIC_DEMO_MODE=true` เท่านั้นที่แสดง role switcher ใน `Navbar` และ `DEMO_USERS`
- production ไม่ตั้งค่านี้ → ผู้ใช้เห็นแค่ guest (และปุ่ม "เข้าสู่ระบบด้วย LINE" หลัง F02)
- เทสต์และ E2E ตั้ง `NEXT_PUBLIC_DEMO_MODE=true` ใน `vitest.config.ts` / `playwright.config.ts`

### 3.6 Index (ต่อท้าย `SCHEMA_DDL`)

```sql
CREATE INDEX IF NOT EXISTS user_plants_user_idx   ON user_plants (user_id)     WHERE is_active;
CREATE INDEX IF NOT EXISTS user_plants_guest_idx  ON user_plants (guest_token) WHERE is_active;
CREATE INDEX IF NOT EXISTS care_tasks_due_idx     ON care_tasks (due_date, status);
CREATE INDEX IF NOT EXISTS care_logs_plant_idx    ON care_logs (user_plant_id, performed_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_created_idx  ON inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS species_stock_idx      ON species (stock_status);
CREATE UNIQUE INDEX IF NOT EXISTS favorites_user_species_uq  ON favorites (user_id, species_id)     WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS favorites_guest_species_uq ON favorites (guest_token, species_id) WHERE guest_token IS NOT NULL;
```

Drizzle: เพิ่ม `index()`/`uniqueIndex()` ใน callback ตัวที่ 3 ของ `pgTable` ให้ตรงกัน

### 3.7 Security headers — `next.config.ts` `headers()`

`X-Content-Type-Options: nosniff` · `Referrer-Policy: strict-origin-when-cross-origin` · `X-Frame-Options: DENY` · `Permissions-Policy: camera=(self), geolocation=()` · CSP แบบ report-only ก่อน 1 สัปดาห์แล้วค่อยบังคับ

### 3.8 หน้า error

`app/not-found.tsx` (มีช่องค้นหา + ลิงก์หน้าแรก + ปุ่ม LINE) · `app/error.tsx` (ปุ่มลองใหม่ + ปุ่ม LINE) · ข้อความจาก i18n namespace `errors`

## 4. i18n

`errors.not_found_title`, `errors.not_found_body`, `errors.generic_title`, `errors.generic_body`, `errors.try_again`, `errors.rate_limited`

## 5. เทสต์ — `test/hardening.test.ts`

- guest A แก้ต้นของ guest B → 404 และข้อมูลไม่เปลี่ยน
- task action กับ task ของคนอื่น → 404
- body ผิด (`potSizeInch: -1`, `placement: "moon"`) → 400 พร้อม `code: "VALIDATION"`
- inquiry ครั้งที่ 11 ในนาทีเดียว → 429
- error 500 ไม่มีข้อความจาก DB หลุดออกไป
- `NEXT_PUBLIC_DEMO_MODE` ไม่ตั้ง → Navbar ไม่ render role switcher
- DDL รันซ้ำ 2 รอบบน PGlite ไม่ error (idempotent)

## 6. เกณฑ์ยอมรับ

- [ ] ไม่มี route ใดรับ `userId` จาก client
- [ ] ทุก route ใต้ `/api/garden/*` ผ่าน `getActor` + `requireOwner`
- [ ] ทุก route ที่รับ input ผ่าน zod
- [ ] 429 ทำงานบน production (ทดสอบด้วย `curl` วน 15 ครั้ง)
- [ ] production ไม่มี role switcher
- [ ] `make verify` ผ่าน
