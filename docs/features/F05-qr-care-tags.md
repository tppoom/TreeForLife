# F05 — ป้าย QR ติดกระถาง (Care Tag)

> Milestone **M4** · Effort ~8 ชม. · Cost ~1–3 บาท/ป้าย (ค่าพิมพ์) · ต้องมีก่อน: F01 (F02 ช่วยให้ข้ามเครื่องได้)
> **ฟีเจอร์ใหม่ที่ไม่อยู่ใน SPEC เดิม — คุ้มที่สุดในเอกสารนี้**

## 1. ทำไม

- ทุกวันนี้ลูกค้าหน้าร้านซื้อต้นไม้แล้ว **หายไปเลย** ร้านไม่มีช่องทางติดต่อ ไม่รู้ว่าต้นรอดไหม ไม่มีเหตุผลให้กลับมา
- ป้ายเล็ก ๆ ติดกระถางพร้อม QR: สแกน → **ต้นนี้เข้าสวนของฉันทันที** พร้อมพันธุ์ วันที่ซื้อ และ `acquired_from = 'shop'` ถูกต้อง → ได้ตารางดูแลในไม่กี่วินาที ไม่ต้องกรอก wizard
- ได้ทั้ง 4 ขั้นของวงจร: **ใช้** (onboarding ง่ายสุด) · **กลับมา** (แจ้งเตือน F03) · **ซื้อซ้ำ** (ดูแลหลังการขาย F06 + วัดได้ว่าลูกค้าจากร้านกลับมาซื้อไหม) · **บอกต่อ** (ป้ายติดไปกับต้นไม้ที่เป็นของขวัญ — คนรับของขวัญสแกนแล้วรู้จักร้าน)
- ป้ายเองก็คือ **สื่อโฆษณาที่อยู่ในบ้านลูกค้าตลอดอายุต้นไม้**

## 2. ขอบเขต

**ทำ**: สร้างชุดป้ายในหลังบ้าน · หน้าพิมพ์ A4 · หน้า landing จาก QR · claim เข้าสวน (guest ได้) · สถิติป้าย
**ไม่ทำ**: เครื่องพิมพ์ฉลากเฉพาะ · NFC · ป้ายต่อชิ้นแบบผูกกับออเดอร์จริง (ไม่มีระบบออเดอร์ตาม P1)

## 3. แนวคิดป้าย

- ป้าย **ผูกกับพันธุ์ ไม่ผูกกับลูกค้า** → พิมพ์ล่วงหน้าเป็นชุดได้ ติดตอนจัดวางต้นไม้ในร้าน ไม่เพิ่มงานตอนขาย
- แต่ละป้ายมีโค้ดไม่ซ้ำ (`care_tags.code` 8 ตัว base32 ไม่กำกวม เช่น `K7M2Q9XA`) → รู้ว่าป้ายไหนถูกสแกน/ถูก claim และ **claim ได้ครั้งเดียว** (ครั้งต่อไปเปิดได้แต่เพิ่มเข้าสวนแบบปกติ)
- ขนาด 5×7 ซม. บนสติกเกอร์กันน้ำ 10 ป้าย/A4 · เนื้อหา: ชื่อไทย (ใหญ่) · ชื่ออังกฤษ · ไอคอนแสง/น้ำ/สัตว์เลี้ยง · "รดน้ำทุก ~X วัน" (ค่ากลางฤดูปัจจุบัน) · QR · "สแกนรับตารางดูแลฟรี + เตือนรดน้ำ" · LINE OA ID
- URL ใน QR: `https://<domain>/t/K7M2Q9XA` (สั้น → QR ใหญ่สแกนง่าย)

## 4. UX

### 4.1 หลังบ้าน `/admin/tags`
- เลือกพันธุ์ (ค้นได้) + จำนวน → "สร้างป้าย" → สร้าง `care_tag_batches` + N แถว `care_tags`
- ปุ่ม "พิมพ์" → `/admin/tags/print/[batchId]` — หน้า print CSS (`@page { size: A4; margin: 8mm }`), QR เป็น SVG สร้างฝั่ง server ด้วย package `qrcode` (ไม่พึ่งบริการภายนอก)
- ตารางสถิติต่อชุด: พิมพ์ N · สแกน · claim · อัตรา claim

### 4.2 ลูกค้าสแกน `/t/[code]`
1. บันทึก `scanned_at` (ครั้งแรก) + `scan_count++`
2. แสดงหน้าเดียวแบบมือถือ: รูปจริงของพันธุ์ · "ยินดีด้วย! คุณได้ **มอนสเตอร่า** จากร้านเรา" · "ที่ร้านบอกว่า: …"
3. คำถามเดียว (ไม่ใช่ wizard 4 ขั้น): **"วางต้นไว้ตรงไหน?"** 5 ปุ่มภาพ (placement) — กระถางใช้ค่าเริ่มต้นจากชุดป้าย (`default_pot_size_inch`, `default_pot_material` ที่ร้านตั้งตอนสร้างชุด) แก้ภายหลังได้
4. ปุ่มใหญ่ **[เพิ่มเข้าสวนของฉัน]** → สร้าง `user_plants` (`acquired_from='shop'`, `acquired_at=วันนี้`, `care_tag_id`) → ไป `/garden/[id]?welcome=1` แสดงตารางดูแล + แผ่นขอเปิดแจ้งเตือน (F03) ทันที
5. ถ้าป้ายถูก claim แล้ว → ข้อความ "ป้ายนี้ถูกใช้แล้ว" + ยังเพิ่มต้นเข้าสวนได้ปกติ (ไม่ผูกป้าย) — รองรับกรณีต้นเปลี่ยนมือ

## 5. Data model

```sql
CREATE TABLE IF NOT EXISTS care_tag_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id UUID NOT NULL REFERENCES species(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  default_pot_size_inch NUMERIC NOT NULL DEFAULT 6,
  default_pot_material TEXT NOT NULL DEFAULT 'plastic',
  note TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS care_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES care_tag_batches(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  scan_count INTEGER NOT NULL DEFAULT 0,
  first_scanned_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  claimed_user_plant_id UUID REFERENCES user_plants(id) ON DELETE SET NULL
);
ALTER TABLE user_plants ADD COLUMN IF NOT EXISTS care_tag_id UUID REFERENCES care_tags(id) ON DELETE SET NULL;
```

Claim ทำใน transaction: `UPDATE care_tags SET claimed_at = now(), claimed_user_plant_id = $1 WHERE code = $2 AND claimed_at IS NULL RETURNING id` — 0 แถว = ถูก claim ไปแล้ว (กัน race)

## 6. API

| Route | สิทธิ์ |
|---|---|
| `POST /api/admin/tags/batches` `{ speciesId, quantity ≤ 200, defaultPotSizeInch, defaultPotMaterial }` | staff |
| `GET /api/admin/tags/batches` (พร้อมสถิติ) | staff |
| `GET /t/[code]` (server page) | สาธารณะ · rate limit 30/นาที/IP |
| `POST /api/tags/[code]/claim` `{ placement }` | actor (guest/user) · 10/นาที |

## 7. i18n

namespace `care_tag`: `welcome_title` (`{species}`), `where_placed`, `add_to_garden`, `already_claimed`, `print_title`, `scan_hint`, `water_every` (`{days}`), …
**ข้อความบนป้ายพิมพ์เป็นภาษาไทยเสมอ** (ลูกค้าหน้าร้านไทย) แต่หน้า `/t/[code]` ตาม locale ผู้ใช้

## 8. Analytics (F12)

`tag_scanned`, `tag_claimed` · ตัวชี้วัด: อัตรา claim ต่อป้ายที่พิมพ์ (เป้า ≥ 40%) · % ของผู้ใช้ที่มาจากป้าย · inquiry ภายหลังจากผู้ใช้ที่ claim ป้าย (= ซื้อซ้ำ)

## 9. เทสต์ — `test/care-tags.test.ts`

สร้างชุด 10 ป้าย → โค้ดไม่ซ้ำและไม่มีตัวกำกวม (0/O/1/I) · claim ครั้งแรกสำเร็จ `acquired_from='shop'` · claim พร้อมกัน 2 request → สำเร็จ 1 · โค้ดไม่มีจริง → 404 · หน้า print render 10 QR (snapshot ของจำนวน `<svg>`)

## 10. เกณฑ์ยอมรับ

- [ ] ร้านพิมพ์ป้าย 10 ใบจากมือถือ/คอมที่ร้านได้เอง
- [ ] ลูกค้าสแกนจนเห็นตารางดูแลในไม่เกิน **3 แตะ** และ ≤ 15 วินาที
- [ ] สแกนด้วยกล้องมาตรฐาน iPhone/Android และ LINE scanner ได้
