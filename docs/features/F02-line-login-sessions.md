# F02 — LINE Login + Server Sessions + Guest Merge

> Milestone **M3** · Effort ~12 ชม. · Cost 0 · ต้องมีก่อน: F00
> SPEC §6.5 · ADR-02 · แทนที่ role switcher เดโมและ Basic Auth ของหลังบ้าน

## 1. ทำไม

- ข้อมูลสวนของ guest อยู่แค่ในเครื่องเดียว — เปลี่ยนมือถือ/ล้างเบราว์เซอร์ = ต้นไม้หายหมด = ผู้ใช้เลิกใช้
- **ต้องมี `line_user_id` ถึงจะส่งแจ้งเตือนทาง LINE ได้ (F03)** — LINE Login จึงเป็นประตูของ retention
- ลูกค้าไทยมี LINE ทุกคน → กดปุ่มเดียวจบ ไม่ต้องจำรหัสผ่าน

## 2. ขอบเขต

**ทำ**: LINE Login (web) · session cookie · logout · merge guest → บัญชี · role จาก DB · หน้า `/account` (ชื่อ รูป ตั้งค่าแจ้งเตือน ลบบัญชีจาก F11)
**ไม่ทำ**: อีเมล/รหัสผ่าน (SPEC ให้เป็นทางเลือกรอง — เลื่อนไปจนมีคนขอ; ลดพื้นผิวความปลอดภัย), LIFF

## 3. ตั้งค่าภายนอก

1. LINE Developers Console → Provider เดียวกับ LINE OA ของร้าน → สร้าง channel **LINE Login**
2. Callback URL: `https://<domain>/api/auth/line/callback` (+ `http://localhost:3000/api/auth/line/callback` สำหรับ dev)
3. เปิด **"Link a LINE Official Account"** (bot_prompt) → ตอนล็อกอินผู้ใช้ถูกชวนเพิ่มเพื่อน OA ของร้านไปด้วย — **จำเป็นต่อการ push ข้อความ** เพราะ push ได้เฉพาะคนที่เป็นเพื่อน OA
4. Env: `LINE_LOGIN_CHANNEL_ID`, `LINE_LOGIN_CHANNEL_SECRET`, `SESSION_SECRET` (≥32 bytes random), `NEXT_PUBLIC_SITE_URL`

## 4. Flow

```
[ปุ่ม "เข้าสู่ระบบด้วย LINE"] → GET /api/auth/line/login?next=/garden
   - สร้าง state (random 32B) + nonce + PKCE code_verifier
   - เก็บใน cookie tfl_oauth (httpOnly, 10 นาที, SameSite=Lax) พร้อม next
   - redirect → https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=…
       &redirect_uri=…&state=…&scope=openid%20profile&nonce=…&bot_prompt=aggressive
       &code_challenge=…&code_challenge_method=S256
LINE → GET /api/auth/line/callback?code&state
   - ตรวจ state ตรงกับ cookie · แลก token ที่ https://api.line.me/oauth2/v2.1/token
   - ตรวจ id_token ด้วย https://api.line.me/oauth2/v2.1/verify (client_id + nonce)
   - upsert users ด้วย line_user_id (sub) · อัปเดต display_name, avatar_url, last_seen_at
   - ถ้า request มี guest token (cookie tfl_guest ที่ client ตั้งไว้ก่อน redirect) → mergeGuestData ใน transaction
   - ตั้ง cookie session → redirect next (ตรวจว่าเป็น path ภายใน ขึ้นต้น "/" และไม่ใช่ "//")
```

- `next` ต้องผ่าน allowlist path ภายในเท่านั้น (กัน open redirect)
- ถ้าผู้ใช้กดยกเลิกที่ LINE → กลับ `next` พร้อม toast "ยกเลิกการเข้าสู่ระบบ"

## 5. Session

- Cookie `tfl_session`: JWT HS256 ด้วย `jose` `{ sub: userId, role, sv: sessionVersion, iat, exp }` อายุ 90 วัน · `httpOnly; Secure; SameSite=Lax; Path=/`
- ต่ออายุแบบ sliding เมื่อเหลือ < 30 วัน
- `users.session_version` ใช้ "ออกจากระบบทุกเครื่อง" และตอนลบบัญชี — `getActor` ตรวจ `sv` กับ DB แบบ cache ต่อ request
- `POST /api/auth/logout` ลบ cookie
- `role` ใน JWT ใช้แสดงผลเท่านั้น — การตรวจสิทธิ์หลังบ้านอ่าน role จาก DB ทุกครั้ง (มีแค่ staff ไม่กี่คน ต้นทุนต่ำ)

## 6. Guest merge

- ย้าย `user_plants`, `favorites`, `inquiries` ที่มี `guest_token` นั้น → ตั้ง `user_id`, คง `guest_token` ไว้เพื่อ trace
- favorites ซ้ำ → `ON CONFLICT DO NOTHING` (อาศัย unique index จาก F00)
- ทำใน transaction เดียว · คืนจำนวนที่ย้าย → toast "ย้ายต้นไม้ 3 ต้นเข้าบัญชีแล้ว" (SPEC §6.5)
- หลัง merge client เก็บ guest token เดิมไว้ (ไม่ต้องสร้างใหม่) — ถ้า logout แล้วใช้ต่อแบบ guest จะเริ่มสวนว่างจาก token ใหม่

## 7. Data model (additive)

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS line_friend BOOLEAN;           -- จาก friendship_status_changed / webhook follow
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;        -- F11
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;     -- F09 (สร้างตอนสมัคร)
```

แต่งตั้ง staff/admin: `scripts/grant-role.ts <line_user_id|user_id> staff` (ไม่มี UI — ป้องกันการยกระดับสิทธิ์ผ่านเว็บ)

## 8. เปลี่ยนใน client

- `AppContext`: `role`/`user` มาจาก `GET /api/auth/me` ไม่ใช่ state ในเครื่อง · เดโม switcher อยู่หลัง `NEXT_PUBLIC_DEMO_MODE` (F00)
- `Navbar`: guest → ปุ่ม LINE สีเขียว (#06C755, ข้อความขาว, ≥44px) · สมาชิก → avatar + เมนู (บัญชี · ออกจากระบบ)
- จุดที่ **ชวน** ล็อกอิน (ไม่บังคับ — P3): หลังเพิ่มต้นแรก ("เก็บสวนไว้ไม่ให้หาย + รับแจ้งเตือน"), ตอนเปิดแจ้งเตือน (F03), ตอน claim ป้าย QR (F05)
- `middleware.ts`: เปลี่ยนจาก Basic Auth เป็นตรวจ cookie มีอยู่ (เร็ว) แล้ว route/page ตรวจ `requireStaff` จาก DB จริง

## 9. i18n

namespace `auth`: `login_with_line`, `logout`, `login_prompt_after_first_plant`, `merge_success` (มี `{count}`), `login_cancelled`, `account_title`, …

## 10. ความปลอดภัย

state + nonce + PKCE · ตรวจ id_token ฝั่ง server · cookie `httpOnly/Secure` · ไม่มี token LINE เก็บใน DB (ใช้แค่ตอนล็อกอิน) · rate limit `/api/auth/*` 20/นาที/IP · CSRF: route ที่เปลี่ยนข้อมูลต้องเป็น `POST/PATCH/DELETE` และตรวจ `Origin` ตรงกับ `NEXT_PUBLIC_SITE_URL`

## 11. เทสต์

- `lib/auth/*.test.ts`: sign/verify session · session_version ไม่ตรง → anonymous · `next` แบบ `//evil.com` ถูกปฏิเสธ
- `test/auth-callback.test.ts` (mock fetch ของ LINE): state ไม่ตรง → 400 · user ใหม่ถูกสร้าง · user เดิมอัปเดตชื่อ · merge ย้ายต้นไม้ 3 ต้นและ favorites ซ้ำไม่ error
- E2E ทำได้แค่ถึง redirect ไป `access.line.me` (ไม่ล็อกอินจริงใน CI) + ทดสอบ flow หลังล็อกอินด้วย cookie ที่เซ็นเองใน test

## 12. เกณฑ์ยอมรับ

- [ ] ล็อกอินด้วย LINE บน iPhone Safari, Android Chrome, เดสก์ท็อป (QR login ของ LINE) ได้
- [ ] Guest ที่มี 3 ต้น → ล็อกอิน → เห็น 3 ต้นในบัญชี และเปิดจากอีกเครื่องก็เห็น (SPEC §11.2 เส้นทาง 3)
- [ ] ผู้ใช้ถูกชวนเพิ่มเพื่อน OA ระหว่างล็อกอิน
- [ ] `/admin` เข้าได้เฉพาะ role staff/admin จาก DB · Basic Auth ถูกถอดออก
