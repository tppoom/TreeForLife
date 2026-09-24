# F06 — ดูแลหลังการขาย (Aftercare Check-ins)

> Milestone **M4** · Effort ~8 ชม. · Cost 0 (ใช้ช่องทางแจ้งเตือนของ F03) · ต้องมีก่อน: F03

## 1. ทำไม

- ต้นไม้ที่เพิ่งย้ายจากร้านไปบ้านมัก **ช็อก** ใน 2–4 สัปดาห์แรก (ใบเหลือง ใบร่วง) — ลูกค้าคิดว่าร้านขายต้นไม่ดี แล้วไม่กลับมาอีก
- ถ้าร้าน **ถามก่อน** ว่า "เป็นยังไงบ้าง" แล้วช่วยทันเวลา → ความรู้สึกเปลี่ยนจาก "ซื้อแล้วตาย" เป็น "ร้านนี้ดูแลเรา" = เหตุผลอันดับหนึ่งที่คนกลับมาซื้อและบอกต่อ
- เป็น **สิทธิพิเศษของต้นที่ซื้อจากร้าน** (`acquired_from = 'shop'`) → เหตุผลที่ควรซื้อที่นี่ ไม่ใช่ที่อื่น (ชู value ร้านข้อ 5 ใน ROADMAP §2.2)

## 2. UX

- ต้นที่ `acquired_from='shop'` ได้ check-in อัตโนมัติ **วันที่ 3, 14, 30** นับจาก `acquired_at`
- Check-in **รวมอยู่ในสรุปประจำวันของ F03** (ไม่ส่งข้อความแยก → ไม่เกิน 1 ข้อความ/วัน) เช่น "…และ **เจ้าอ้วน** อยู่บ้านใหม่ครบ 2 สัปดาห์แล้ว เป็นยังไงบ้าง?"
- ใน `/today` และ `/garden/[id]` แสดงการ์ด check-in: **[🌿 สบายดี] [😐 ไม่แน่ใจ] [🥀 ดูไม่ค่อยดี]** (ปุ่มมีข้อความ ไม่ใช่ emoji อย่างเดียว)
  - **สบายดี** → "เยี่ยมเลย! " + เคล็ดลับช่วงนั้นจาก `species.shop_note` / `care_templates.notes_th` → จบ
  - **ไม่แน่ใจ** → checklist อาการ 4–6 ข้อจาก `species_problems` ของพันธุ์นั้น (ติ๊กได้) → แสดง "สาเหตุ/วิธีแก้" ของข้อที่ติ๊ก + ปุ่มถามร้าน
  - **ดูไม่ค่อยดี** → เปิด inquiry `care_help` ทันที โดย payload แนบ: พันธุ์ · วันที่ซื้อ (อายุกี่วัน) · กระถาง · ตำแหน่ง · รอบรดน้ำจริง 14 วันล่าสุดจาก `care_logs` · อาการที่ติ๊ก · (รูปถ้าแนบ — F10) → ข้อความ LINE "ต้น **มอนสเตอร่า** ที่ซื้อจากร้านเมื่อ 14 วันก่อน ดูไม่ค่อยดีครับ/ค่ะ อาการ: ใบเหลืองจากโคน · รดน้ำ 4 ครั้งใน 14 วัน · วางห้องแอร์ [TFL-XXXX]" → **ร้านไม่ต้องถามซ้ำ** (SPEC §7.2 หลักเดียวกับ handoff)
- ไม่ตอบ = ไม่ถามซ้ำ (ไม่ตามตื๊อ) · check-in ถัดไปมาตามรอบ

## 3. Data model

```sql
CREATE TABLE IF NOT EXISTS aftercare_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_plant_id UUID NOT NULL REFERENCES user_plants(id) ON DELETE CASCADE,
  day_mark INTEGER NOT NULL,                 -- 3 | 14 | 30
  due_date DATE NOT NULL,
  answer TEXT,                               -- good | unsure | bad | NULL (ยังไม่ตอบ)
  symptoms JSONB NOT NULL DEFAULT '[]'::jsonb, -- species_problems.id[]
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
  answered_at TIMESTAMPTZ,
  CONSTRAINT aftercare_unique UNIQUE (user_plant_id, day_mark)
);
```

- สร้างโดย cron `generate-tasks` (F03) เมื่อ `acquired_from='shop'` และ `acquired_at >= วันนี้ - 30` (ไม่ย้อนสร้างให้ต้นเก่า)
- เก็บแยกจาก `care_tasks` เพราะไม่ใช่งานดูแลที่มีรอบ และไม่ควรกระทบ streak/สถิติ "ทำตามรอบ"

## 4. API

| Route | สิทธิ์ |
|---|---|
| `GET /api/garden/checkins?due=today` | actor |
| `POST /api/garden/checkins/[id]` `{ answer, symptoms[] }` | owner · ถ้า `bad` → สร้าง inquiry คืน `{ lineUrl, refCode }` |

## 5. หลังบ้าน

แท็บใหม่ "หลังการขาย" ใน `/admin`: รายการคำตอบ `bad`/`unsure` ล่าสุด (พันธุ์ · อายุต้น · อาการ · ref code) + สถิติต่อพันธุ์ **"% สบายดีที่ 30 วัน"** → บอกร้านว่าพันธุ์ไหนลูกค้าเลี้ยงรอดยาก ควรแนะนำ/ให้ข้อมูลเพิ่มตอนขาย

## 6. i18n

namespace `aftercare`: `question_day3`/`day14`/`day30` (`{nickname}`), `answer_good`/`unsure`/`bad`, `good_reply`, `symptom_title`, `ask_shop_cta`, ข้อความ LINE template (ใน `lib/line/formatters.ts` ไม่ใช่ i18n เพราะส่งถึงร้านเป็นภาษาไทยเสมอ)

## 7. เทสต์ — `test/aftercare.test.ts`

สร้าง check-in เฉพาะต้น `shop` · ไม่ซ้ำเมื่อ cron รันซ้ำ · ต้นที่ได้มา 60 วันก่อนไม่ได้ check-in · ตอบ `bad` สร้าง inquiry ที่ payload มีรอบรดน้ำจริง · ข้อความ LINE ขึ้นต้นด้วยชื่อพันธุ์และจบด้วย ref code · สรุปประจำวันรวม check-in เป็นข้อความเดียวกับงานรดน้ำ

## 8. เกณฑ์ยอมรับ

- [ ] ลูกค้าที่ claim ป้าย QR (F05) ได้ check-in วันที่ 3 ในสรุปเช้าวันนั้น
- [ ] ตอบ "ดูไม่ค่อยดี" → เปิด LINE พร้อมบริบทครบใน ≤ 2 แตะ
- [ ] ร้านเห็นรายการต้นที่มีปัญหาในหลังบ้าน
