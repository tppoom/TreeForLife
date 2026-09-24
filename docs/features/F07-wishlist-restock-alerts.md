# F07 — ต้นที่อยากได้ + แจ้งเมื่อของเข้า

> Milestone **M4** · Effort ~8 ชม. · Cost 0–50 บาท/เดือน (ส่วนแบ่งโควตา LINE) · ต้องมีก่อน: F03
> US-05 (บันทึกต้นที่สนใจ) · US-13

## 1. ทำไม

- พันธุ์ `made_to_order` / `seasonal` คือ **ความต้องการที่ร้านเสียไปเงียบ ๆ** — ลูกค้าเห็นว่ายังไม่มี แล้วก็ลืม
- "แจ้งเมื่อของเข้า" เปลี่ยนความต้องการนั้นเป็นรายชื่อคนรอซื้อ → ร้านรู้ว่าควรสั่งของเข้ากี่ต้น **ก่อน** สั่ง (ลดของค้าง) และตอนของเข้ามีคนพร้อมซื้อทันที
- Favorites ตาราง `favorites` มีอยู่แล้วแต่ยังไม่มี UI

## 2. UX

- หน้าต้นไม้ + การ์ดในหน้าค้นหา: ปุ่มหัวใจ **[♡ อยากได้]** (guest ใช้ได้ — ผูก guest token)
- ถ้าพันธุ์นั้น **ไม่ใช่ `in_stock`**: หลังกดหัวใจ แสดงสวิตช์ "แจ้งฉันเมื่อมีที่ร้าน" (เปิดเป็นค่าเริ่มต้นถ้าผู้ใช้เปิดแจ้งเตือนไว้แล้ว)
- หน้า `/favorites` (มีลิงก์ใน nav อยู่แล้วใน i18n `nav.favorites`): รายการที่อยากได้ แยก "มีที่ร้านตอนนี้" ไว้บนสุดพร้อมปุ่มถามร้าน `availability` · ปุ่ม **"ถามร้านทีเดียวทั้งหมด"** → inquiry เดียวแนบรายการทั้งหมด (ลูกค้าอยากได้หลายต้น = ออเดอร์ใหญ่)
- **เมื่อร้านเปลี่ยนสถานะเป็น `in_stock`** (F01 หรือ toggle เดิม):
  - ไม่ส่งทันที — ใส่คิว `restock_events` แล้ว **รวมเข้าสรุปประจำวันถัดไปของ F03** ("ข่าวดี! **มอนสเตอร่าด่าง** ที่คุณรอ มีที่ร้านแล้ว" + ปุ่มถามร้าน) — ไม่เพิ่มจำนวนข้อความ
  - ผู้ใช้ที่ไม่มีงานรดน้ำวันนั้น → ข่าวของเข้าทำให้สรุปวันนั้น "ไม่ว่าง" จึงส่งได้ (F03 `dispatch` ต้องนับ **รายการในสรุป** = งาน + check-in F06 + ของเข้า F07 ไม่ใช่นับแค่งาน) · ช่องทาง LINE สำหรับสรุปที่มีแค่ข่าวของเข้า ส่งเฉพาะเมื่อโควตาเหลือ > 30%
  - แจ้งแต่ละคน **ครั้งเดียวต่อรอบของเข้า** (ถ้าเปลี่ยนเป็น in_stock ซ้ำภายใน 7 วันไม่แจ้งอีก)
- หลังบ้าน: คอลัมน์ **"รอซื้อ N คน"** ในตารางสต็อก + เรียงได้ → ร้านรู้ว่าควรหาอะไรเข้าร้าน (คู่กับ "คำค้นไม่เจอ")

## 3. Data model

```sql
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS notify_restock BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS last_restock_notified_at TIMESTAMPTZ;
CREATE TABLE IF NOT EXISTS restock_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id UUID NOT NULL REFERENCES species(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);
```

- `updateStockStatus` → ถ้าเปลี่ยนจาก non-`in_stock` เป็น `in_stock` → insert `restock_events` (ใน transaction เดียวกัน)
- `send-reminders` (F03) อ่าน `restock_events` ที่ยังไม่ process → หาผู้ใช้ที่ `notify_restock` และ `last_restock_notified_at` < 7 วันก่อนหรือ NULL → เพิ่มเข้าข้อความสรุป → ตั้ง `processed_at`, `last_restock_notified_at`

## 4. API

| Route | สิทธิ์ |
|---|---|
| `GET /api/favorites` | actor |
| `PUT /api/favorites/[speciesId]` `{ notifyRestock }` | actor (idempotent) |
| `DELETE /api/favorites/[speciesId]` | actor |
| `POST /api/favorites/inquiry` | actor → inquiry `availability` แนบ `payload.species[]` |

## 5. i18n

namespace `favorites`: `add`, `remove`, `notify_restock`, `restock_notice` (`{species}`), `in_stock_now`, `ask_all`, `empty_title`, `empty_body`, `waiting_count` (`{count}`)

## 6. เทสต์ — `test/favorites.test.ts`

หัวใจซ้ำไม่สร้างแถวซ้ำ · guest → login merge แล้ว favorites ไม่ซ้ำ (F02) · เปลี่ยนเป็น in_stock สร้าง restock_event 1 แถว · สรุปประจำวันมีข้อความของเข้า และแต่ละคนได้ครั้งเดียว · เปลี่ยนสถานะไป-กลับภายใน 7 วันไม่แจ้งซ้ำ · "ถามทั้งหมด" สร้าง inquiry เดียวที่ข้อความ LINE มีทุกชื่อ

## 7. เกณฑ์ยอมรับ

- [ ] ร้านเห็นจำนวนคนรอต่อพันธุ์
- [ ] ผู้รอได้รับแจ้งในสรุปเช้าหลังของเข้า และไม่มีใครได้ข้อความเกิน 1 ข้อความ/วัน
