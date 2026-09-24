# F12 — Analytics ของตัวเอง + หน้าสรุปให้ร้าน

> Milestone **M5** (เริ่มเก็บ event ตั้งแต่ M3) · Effort ~10 ชม. · Cost 0 · ต้องมีก่อน: F00
> SPEC §8.2–8.3 (ดึงมาบางส่วนจาก Phase 3) · ภาคผนวก A (เกณฑ์ไป Phase 2)

## 1. ทำไม

การตัดสินใจลงแรง Phase 2 (AI) ต้องใช้ตัวเลข D30 retention, จำนวน inquiry, และผลของแต่ละช่องทาง — ถ้าไม่เริ่มเก็บตั้งแต่ M3 พอถึงเวลาตัดสินใจจะไม่มีข้อมูล 3 เดือนย้อนหลังให้ดู และร้านต้องการเห็น **"ตัวเลขที่ทำเงิน"** (SPEC §8.3 บล็อก 1) ในหน้าเดียว

## 2. หลักการ

- **เก็บเท่าที่ใช้ตัดสินใจ** — 14 event ด้านล่างเท่านั้น เพิ่มต้องมีคำถามที่มันตอบ
- ไม่มี third-party tracker · ไม่มี cookie ใหม่ (ใช้ guest token / user id ที่มีอยู่) → ไม่ต้องมีแบนเนอร์ (F11)
- Vercel Analytics (Web Vitals + page views, ไม่ใช้ cookie) เปิดเพิ่มสำหรับความเร็วหน้าเว็บ — ข้อมูลธุรกิจอยู่ใน DB ของเรา

## 3. Event dictionary

| Event | Props | ยิงจาก | ตอบคำถาม |
|---|---|---|---|
| `session_start` | `source` (google/line/facebook/qr/direct/pwa จาก referrer + `src`), `ref` | client ครั้งแรกต่อวัน | คนมาจากไหน |
| `search_performed` | `q_norm`, `result_count`, `filters` | server | คนหาอะไร |
| `species_viewed` | `species_id` | server (page) | ต้นไหนน่าสนใจ |
| `inquiry_created` | `species_id`, `intent`, `ref_code`, `source_page` | server | เว็บพาลูกค้ามากี่ราย |
| `plant_added` | `species_id`, `via` (wizard/tag), `acquired_from` | server | ต้นไหนคนมีจริง |
| `care_logged` | `type`, `on_time` (bool), `via` (web/line/today_all) | server | เครื่องมือถูกใช้จริงไหม |
| `reminder_sent` | `channel`, `items` | server (F03) | |
| `reminder_opened` | `channel` (จาก `?src=push|line`) | client | ช่องทางไหนได้ผล |
| `notify_opt_in` | `channel`, `result` (granted/denied/ios_needs_pwa) | client | ขอ permission ตรงจังหวะไหม |
| `signup_completed` | `method`, `merged_plants` | server | guest → สมาชิก |
| `tag_scanned` / `tag_claimed` | `batch_id`, `species_id` | server (F05) | ป้าย QR คุ้มไหม |
| `checkin_answered` | `day_mark`, `answer` | server (F06) | ต้นจากร้านรอดไหม |
| `share_clicked` | `kind` | client (F09) | คนอยากอวดอะไร |

## 4. Data model

```sql
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  actor_key TEXT,                  -- 'u:<uuid>' | 'g:<guest token hash>' — hash guest token ด้วย SHA-256 ตัดเหลือ 16 ตัว
  props JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS events_name_time_idx ON events (name, occurred_at);
CREATE INDEX IF NOT EXISTS events_actor_time_idx ON events (actor_key, occurred_at);
```

- `lib/analytics/track.ts`: `track(name, props, actor)` — **fire-and-forget** ห้ามทำให้ request หลักช้า/ล้ม (ใช้ `after()` ของ Next.js 15 ถ้ามี หรือ `void promise.catch(log)`)
- client: `POST /api/events` (allowlist ชื่อ event ฝั่ง client เท่านั้น: `session_start`, `reminder_opened`, `notify_opt_in`, `share_clicked`) · rate limit 60/นาที · `navigator.sendBeacon`
- ขนาดประมาณ: 500 ผู้ใช้ × ~20 event/วัน × 200 bytes ≈ 60MB/ปี → อยู่ใน 500MB ได้ + retention 13 เดือน (F11)

## 5. หน้าสรุป `/admin/insights`

**ค่าเริ่มต้น: 30 วันล่าสุด เทียบ 30 วันก่อนหน้า** (แสดงข้อความนี้ชัด ๆ) · มือถือ-first · ทุกกราฟมีปุ่ม "ดูตาราง"

บล็อก 1 — **ตัวเลขที่ทำเงิน** (บนสุดเสมอ)
1. Inquiry ทั้งหมด / แยก intent / แยกว่ามาจาก "ลูกค้าที่มีต้นจากร้านแล้ว" (= ซื้อซ้ำ)
2. คำค้นไม่เจอ 20 อันดับ + แนวโน้ม
3. ต้นที่คนดูเยอะแต่ไม่ถาม (views สูง, inquiry/view ต่ำ)
4. ต้นที่รอซื้อมากที่สุด (F07)
5. ป้าย QR: พิมพ์ · สแกน · claim (F05)

บล็อก 2 — **สุขภาพเครื่องมือ**
1. ผู้ใช้ active รายวัน/เดือน (มี event ใด ๆ) · ใหม่ vs กลับมา
2. **D7 / D30 retention** ของ cohort ที่เพิ่มต้นแรก (ตัวชี้วัดหลักภาคผนวก A)
3. อัตรา guest → สมาชิก
4. อัตราเปิดแจ้งเตือน แยกช่องทาง · อัตรารดน้ำตรงรอบ
5. ช่องทางที่มา

คำนวณด้วย SQL ตรง (ไม่มี warehouse) · cache ผลใน `unstable_cache` 10 นาที · ช้า > 2 วิ ค่อยทำตารางสรุปรายวัน (`events_daily`) ด้วย cron

**ตาราง "เกณฑ์ไป Phase 2"** (ภาคผนวก A) แสดงแต่ละข้อเป็น ✅/❌ พร้อมตัวเลขจริง — ส่วนข้อ "ปิดการขายได้ ≥5 ราย" ให้ร้านกรอกเองในช่อง (เก็บใน `admin_settings`)

## 6. เทสต์ — `test/analytics.test.ts`

track ล้มไม่ทำให้ route หลักล้ม · client ส่งชื่อ event นอก allowlist → 400 · guest token ถูก hash ไม่เก็บตรง ๆ · SQL D30 retention ถูกต้องกับข้อมูลตัวอย่างที่รู้คำตอบ · หน้า insights ต้องเป็น staff

## 7. เกณฑ์ยอมรับ

- [ ] event ถูกเก็บตั้งแต่ M3 deploy
- [ ] ร้านเปิด `/admin/insights` บนมือถือแล้วเข้าใจใน 1 นาทีว่า "เดือนนี้เว็บพาลูกค้ามากี่คน และควรหาต้นอะไรเข้าร้าน"
- [ ] ตาราง "เกณฑ์ไป Phase 2" ใช้ตัดสินใจได้โดยไม่ต้อง query เอง
