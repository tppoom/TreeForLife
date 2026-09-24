# F03 — แจ้งเตือนดูแลต้นไม้ (Web Push + LINE) + Cron + PWA

> Milestone **M3** · Effort ~20 ชม. · Cost 0–150 บาท/เดือน · ต้องมีก่อน: F02
> SPEC §5.6, §6.8, §6.10 · ADR-04, ADR-05
> **ฟีเจอร์ที่สำคัญที่สุดต่อการกลับมาใช้ซ้ำ** — ไม่มีสิ่งนี้ ตารางดูแลที่แม่นแค่ไหนก็ถูกลืม

## 1. ทำไม

ผู้ใช้ไม่เปิดเว็บเองทุกวัน แต่ **ต้นไม้ต้องการน้ำตามรอบ** — แจ้งเตือนที่มาถูกเวลาวันละครั้งคือเหตุผลให้กลับมา และทุกครั้งที่กลับมาคือโอกาสเห็นของใหม่ของร้าน ถ้าแจ้งเตือนรำคาญ คนจะปิด แล้วหายไปตลอดกาล → กติกา "ไม่เกิน 1 ข้อความ/วัน" เป็นข้อบังคับ ไม่ใช่คำแนะนำ

## 2. ขอบเขต

**ทำ**
- PWA: `app/manifest.ts`, ไอคอน, service worker (`public/sw.js`) — push + cache หน้า `/today`, `/garden` สำหรับอ่านออฟไลน์
- Web Push (VAPID) ผ่าน package `web-push`
- LINE Messaging API push + **postback "รดแล้ว"** ผ่าน webhook
- Cron 4 งาน (SPEC §5.6)
- หน้า/แผงตั้งค่าแจ้งเตือน
- ตัวนับโควตา LINE + เพดาน

**ไม่ทำ**: อีเมล · SMS · แจ้งเตือนหลายครั้งต่อวัน · แอป native (Phase 3)

## 3. UX

### 3.1 ขออนุญาต (SPEC §6.8)
- **ขอหลังเพิ่มต้นแรกสำเร็จเท่านั้น** — แผ่นล่าง (bottom sheet) บนหน้า `/garden`: "ให้เราเตือนตอนถึงรอบรดน้ำไหม?" ตัวเลือก:
  - [เตือนในเครื่องนี้] → Web Push (ถ้ารองรับ)
  - [เตือนทาง LINE] → ถ้ายังไม่ล็อกอิน พาไป F02 แล้วกลับมาเปิดให้อัตโนมัติ
  - [ไว้ทีหลัง] → ถามอีกครั้งหลังผู้ใช้กด "รดแล้ว" ครั้งที่ 3 (ไม่เกิน 2 ครั้งรวม)
- iPhone ใน Safari ปกติ (ไม่ standalone) → Web Push ใช้ไม่ได้ → แสดงวิธี Add to Home Screen 3 ขั้นแบบมีภาพ **และ** ปุ่ม LINE เสมอ
- ตรวจ: `'PushManager' in window`, `navigator.standalone` / `matchMedia('(display-mode: standalone)')`

### 3.2 ข้อความ
- **Web Push**: title "วันนี้มี 3 ต้นถึงรอบดูแล 🌿" · body "รดน้ำ: เจ้าอ้วน, ลิ้นมังกร · ใส่ปุ๋ย: มอนสเตอร่า" · คลิก → `/today`
- **LINE**: Flex Message 1 bubble — หัว "งานดูแลวันนี้" · รายการ ≤5 ต้น (เกินแสดง "+2 ต้น") · ปุ่ม **[รดครบแล้ว]** (postback `action=done_all&d=2026-09-24`) · ปุ่ม [เปิดดูในเว็บ] (URI `/today?src=line`) · ท้ายข้อความมี "ที่ร้านบอกว่า: …" 1 ประโยคของต้นแรก (ชู value ร้านทุกวัน ไม่เสียโควตาเพิ่ม)
- ไม่มีงาน = ไม่ส่งอะไร (SPEC §5.6)

### 3.3 ตั้งค่า (`/account` ส่วน "การแจ้งเตือน")
สวิตช์ Web Push (ต่อเครื่อง) · สวิตช์ LINE · เวลาสรุปประจำวัน (06:00–20:00 ทีละชั่วโมง, ค่าเริ่มต้น 07:00) · ปุ่ม "ส่งแจ้งเตือนทดสอบ"

## 4. Cron (Vercel Cron — `vercel.json`)

Vercel Cron ใช้เวลา **UTC** · Hobby รันได้วันละครั้งต่องาน และเวลาคลาดเคลื่อนได้ภายในชั่วโมงนั้น

| งาน | schedule (UTC) | เวลาไทย | ทำอะไร |
|---|---|---|---|
| `/api/cron/generate-tasks` | `0 20 * * *` | 03:00 | สร้าง task ล่วงหน้า 14 วันให้ทุกต้นที่ active (`ON CONFLICT DO NOTHING` บน unique เดิม) · ข้ามเดือนงดปุ๋ย · repot เตือนล่วงหน้า 14 วัน |
| `/api/cron/send-reminders` | `0 0 * * *` | 07:00 | ส่งสรุปรวม 1 ข้อความ/คน (ดู §5) |
| `/api/cron/season-recalc` | `0 21 1 3,6,11 *` | 04:00 วันที่ 1 มี.ค./มิ.ย./พ.ย. | คำนวณรอบใหม่ของ task รดน้ำที่ยัง pending + ใส่ข้อความ "เข้าหน้าฝนแล้ว ปรับรอบให้ห่างขึ้น" ไว้ในสรุปวันถัดไป |
| `/api/cron/cleanup` | `0 19 * * 0` | อาทิตย์ 02:00 | pending เกิน 30 วัน → skipped · ลบ `rate_limits` เก่า · ลบ push subscription ที่ตายแล้ว · ลบรูปกำพร้าใน Storage |

- ทุก route ตรวจ `Authorization: Bearer ${CRON_SECRET}` (Vercel ส่งให้อัตโนมัติเมื่อตั้ง env `CRON_SECRET`) ไม่ตรง → 401
- **Idempotent**: บันทึกการรันใน `cron_runs (job, run_date) PRIMARY KEY` → รันซ้ำในวันเดียวกันแล้ว `send-reminders` ไม่ส่งซ้ำ (เช็ค `care_tasks.notified_at` ด้วย)
- **ทำเป็น batch ละ 200 ผู้ใช้** และหยุดก่อน timeout (เหลือ < 10 วิ) → บันทึก cursor ใน `cron_runs.cursor` → รันต่อจากเดิมได้ (เรียกซ้ำด้วยมือหรือ cron ถัดไป)
- `notify_hour` ต่อคน: Hobby รัน cron ได้วันละครั้ง → **Phase นี้ส่งเวลาเดียว 07:00 สำหรับทุกคน** · ค่า `notify_hour` เก็บไว้และใช้จริงเมื่อย้ายเป็น Pro (cron รายชั่วโมง `0 * * * *` แล้วกรอง `notify_hour = ชั่วโมงไทยปัจจุบัน`) — โค้ดเขียนให้รองรับทั้งสองแบบด้วย env `REMINDER_MODE=daily|hourly`

## 5. ตรรกะส่ง (`lib/notify/dispatch.ts`)

```
สำหรับผู้ใช้แต่ละคน (user หรือ guest ที่มี push subscription):
  tasks = งาน pending ที่ due_date <= วันนี้ และ notified_at IS NULL
  ถ้า tasks ว่าง → ข้าม
  ถ้าอยู่ในช่วงเงียบ 21:00–08:00 → ข้าม (สำคัญเมื่อ REMINDER_MODE=hourly)
  sent = false
  ถ้าเปิด web push → ส่งทุก subscription ของคนนั้น; สำเร็จอย่างน้อย 1 → sent = true
     (410/404 จาก push service → ลบ subscription นั้น)
  ถ้า !sent และ notify_line และมี line_user_id และ line_friend != false และโควตา LINE เหลือ → ส่ง LINE
  ถ้าส่งได้ → UPDATE care_tasks SET notified_at = now() WHERE id IN (...)
  บันทึก notifications_log
```

**Guest** ก็รับ Web Push ได้ (subscription ผูก `guest_token`) — ไม่บังคับล็อกอิน (P3) แต่ LINE ต้องล็อกอิน

### 5.1 เพดาน LINE (P5)
- `LINE_MONTHLY_PUSH_CAP` (ค่าเริ่มต้นตั้งให้ต่ำกว่าโควตาฟรีของแพ็กเกจร้าน ~10%) · นับจาก `notifications_log` ของเดือนนี้ที่ `channel='line'`
- ถึง 80% → ส่ง LINE แจ้งแอดมิน 1 ครั้ง · ถึง 100% → หยุดส่ง LINE เดือนนั้น (Web Push ยังทำงาน) + แสดงแถบเตือนใน `/admin`
- ถ้าต้องประหยัดเพิ่ม: `LINE_DIGEST_MIN_TASKS=2` ส่ง LINE เฉพาะวันที่มีงาน ≥ 2 งาน หรือมีงานเลยกำหนด

## 6. LINE webhook — `/api/line/webhook`

- ตรวจ `x-line-signature` = HMAC-SHA256(body ดิบ, `LINE_MESSAGING_CHANNEL_SECRET`) แบบ constant-time · ไม่ตรง → 401
- `follow` / `unfollow` → อัปเดต `users.line_friend`
- `postback action=done_all&d=YYYY-MM-DD` → หา user จาก `source.userId` → ทำ `completeTask` ทุก task ของวันนั้นที่ยัง pending (`care_logs.source='line'`) → reply "บันทึกแล้ว 3 ต้น 🌿 รอบถัดไป: …" (reply ไม่นับโควตา push)
- event อื่น (ข้อความแชท) → **ไม่ตอบอัตโนมัติ** ปล่อยให้ร้านตอบใน LINE OA Manager ตามเดิม (P4) — ต้องตั้ง OA ให้ใช้ webhook ร่วมกับแชทได้ (Response mode: "Chat" + เปิด Webhook)
- ตอบ 200 ภายใน 1 วินาทีเสมอ · idempotent ด้วย `webhookEventId` ใน `line_events_seen` (ลบหลัง 7 วัน)

## 7. Data model (additive)

```sql
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guest_token TEXT,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_success_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_token TEXT,
  channel TEXT NOT NULL,          -- web_push | line
  kind TEXT NOT NULL,             -- daily_digest | aftercare | restock | test | admin_alert
  task_count INTEGER NOT NULL DEFAULT 0,
  ok BOOLEAN NOT NULL,
  error TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS notifications_log_month_idx ON notifications_log (channel, sent_at);
CREATE TABLE IF NOT EXISTS cron_runs (
  job TEXT NOT NULL,
  run_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',   -- running | done | failed
  cursor TEXT,
  stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  PRIMARY KEY (job, run_date)
);
CREATE TABLE IF NOT EXISTS line_events_seen (
  event_id TEXT PRIMARY KEY,
  seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE user_plants ADD COLUMN IF NOT EXISTS reminder_opt_in_asked_at TIMESTAMPTZ;
```

## 8. API

| Route | สิทธิ์ | ทำอะไร |
|---|---|---|
| `POST /api/notify/subscribe` | actor (guest/user) | บันทึก subscription (upsert ด้วย endpoint) |
| `DELETE /api/notify/subscribe` | actor | ลบของเครื่องนี้ |
| `PATCH /api/account/notifications` | user | `notify_web_push`, `notify_line`, `notify_hour` |
| `POST /api/notify/test` | actor · 3 ครั้ง/วัน | ส่งทดสอบ |
| `GET /api/cron/*` | `CRON_SECRET` | §4 |
| `POST /api/line/webhook` | signature | §6 |

Env ใหม่: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (`mailto:` ของร้าน), `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN`, `LINE_MESSAGING_CHANNEL_SECRET`, `LINE_MONTHLY_PUSH_CAP`, `LINE_ADMIN_USER_IDS`, `CRON_SECRET`, `REMINDER_MODE`
สร้าง VAPID: `npx web-push generate-vapid-keys`

## 9. PWA

- `app/manifest.ts`: name "TreeForLife", `display: standalone`, `start_url: /today?src=pwa`, theme สีหลักของร้าน, ไอคอน 192/512 + maskable
- `public/sw.js` (เขียนเอง ไม่ใช้ lib หนัก): `push` → `showNotification` · `notificationclick` → เปิด/โฟกัส `/today` · `fetch` → network-first สำหรับ HTML ของ `/today` `/garden*` และ fallback cache; ไม่ cache `/api/*` ที่เขียนข้อมูล · หน้า offline แสดง "ออฟไลน์อยู่ — ดูข้อมูลล่าสุดได้ แต่บันทึกไม่ได้" (SPEC §6.10)
- ลงทะเบียน SW ใน client component เล็ก ๆ ใน `layout.tsx` เฉพาะ production

## 10. เทสต์

- `lib/notify/dispatch.test.ts`: ไม่มีงาน → ไม่ส่ง · push สำเร็จ → ไม่ส่ง LINE · push ล้ม → ส่ง LINE · โควตาเต็ม → ไม่ส่ง LINE · รันซ้ำ → ไม่ส่งซ้ำ (notified_at) · 410 → ลบ subscription · ข้อความรวมหลายต้นเป็น 1
- `test/cron.test.ts`: ไม่มี secret → 401 · generate-tasks รัน 2 ครั้งจำนวน task เท่าเดิม · season-recalc เปลี่ยน due ของงาน pending ถูกต้อง · cursor ทำงานต่อได้
- `test/line-webhook.test.ts`: signature ผิด → 401 · postback done_all ปิดงานถูกวันและเป็นของ user นั้นเท่านั้น · event ซ้ำ → ทำครั้งเดียว
- Manual (บังคับ): Android Chrome · iPhone PWA (iOS 16.4+) · iPhone Safari ปกติ → เห็นคำแนะนำ + LINE

## 11. เกณฑ์ยอมรับ

- [ ] แต่ละคนได้ไม่เกิน 1 ข้อความ/วัน ไม่ว่ามีกี่ต้น
- [ ] กด "รดครบแล้ว" ใน LINE → `/today` ว่าง และรอบถัดไปถูกต้อง
- [ ] cron รันซ้ำไม่สร้าง task ซ้ำ/ไม่ส่งซ้ำ
- [ ] LINE หยุดส่งเมื่อถึงเพดาน และแอดมินได้รับแจ้งที่ 80%
- [ ] เปิด `/today` ตอนออฟไลน์เห็นข้อมูลล่าสุด ไม่ใช่จอขาว

## 12. ต้นทุน

Web Push ฟรี · Vercel Cron ฟรี (Hobby) · LINE: อยู่ในโควตาฟรีด้วยเพดาน §5.1 — ถ้าคนใช้ LINE เยอะจนชนเพดานบ่อย = สัญญาณดี ค่อยพิจารณาแพ็กเกจเสียเงินจากตัวเลขจริงใน `notifications_log`
