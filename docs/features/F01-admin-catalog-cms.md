# F01 — หลังบ้านจัดการแคตตาล็อก + อัปรูปจริง

> Milestone **M2** · Effort ~20 ชม. · Cost 0 (Supabase Storage free 1GB) · ต้องมีก่อน: F00
> SPEC §6.9 · US-11, US-12, US-13 · หลัก P4, P6

## 1. ทำไม

- **รูปจริงคือจุดขายอันดับหนึ่ง (P6)** แต่ตอนนี้ทุกพันธุ์ใช้รูป Unsplash — ลูกค้าที่เคยเห็นรูปเดียวกันในเว็บอื่นจะไม่เชื่อว่าร้านมีของจริง
- ถ้าที่บ้านแก้ข้อมูลเองไม่ได้ ข้อมูลจะเก่า → สถานะของผิด → ลูกค้าถามของที่ไม่มี → เสียความเชื่อใจทั้งสองฝั่ง
- เกณฑ์ SPEC: **เพิ่มพันธุ์ใหม่ 1 ตัวพร้อมรูปจากมือถือได้ใน ≤ 5 นาที** ถ้าทำไม่ได้แปลว่าออกแบบผิด

## 2. ขอบเขต

**ทำ**: รายการพันธุ์ · ฟอร์มแก้พันธุ์ · อัปโหลด/เรียง/ตั้งรูปหลัก · สูตรดูแล 3 ฤดูพร้อมตัวอย่างสด · ปัญหาที่พบบ่อย · คัดลอกจากพันธุ์คล้ายกัน · บันทึกร่างอัตโนมัติ · publish/unpublish

**ไม่ทำ**: ประวัติการแก้ไข (audit log เต็มรูปแบบ), หลายภาษาในข้อมูลพันธุ์ (ภาษาอังกฤษยังใช้ `lib/i18n/species-en.ts`), ครอปรูปในเว็บ

## 3. หน้าจอ (mobile-first — ที่บ้านใช้มือถือที่ร้าน)

| Route | เนื้อหา |
|---|---|
| `/admin` | คงแท็บเดิม (สต็อก · inquiries · คำค้นไม่เจอ) + ปุ่ม "+ เพิ่มพันธุ์" ใหญ่บนสุด + การ์ดเตือน "ยังใช้รูปชั่วคราว N พันธุ์" |
| `/admin/species/new` | ฟอร์มขั้นต่ำ 4 ช่อง: ชื่อไทย · ชื่ออังกฤษ · slug (สร้างอัตโนมัติจากชื่ออังกฤษ แก้ได้) · "คัดลอกจากพันธุ์" (dropdown ค้นได้) → สร้างเป็นร่าง (`published_at = NULL`) แล้วพาไปหน้าแก้ |
| `/admin/species/[id]` | แท็บ: **ข้อมูล** · **รูป** · **สูตรดูแล** · **ปัญหา** · ปุ่ม Publish/Unpublish ติดบนสุด |

### 3.1 แท็บ "ข้อมูล"
ทุกคอลัมน์ของ `species` · enum เป็นปุ่ม chip ไม่ใช่ dropdown · `aliases` เป็น tag input · `shop_note` เป็น textarea ใหญ่พร้อม placeholder "เคล็ดลับที่หาในเน็ตไม่ได้ เช่น ..." · `price_range_internal` มีป้าย 🔒 "ไม่แสดงต่อลูกค้า"

### 3.2 แท็บ "รูป"
- ปุ่ม "ถ่ายรูป / เลือกรูป" (`<input type="file" accept="image/*" capture="environment" multiple>`)
- **บีบฝั่ง browser ก่อนอัป**: ด้านยาว 1600px, WebP q0.8 (fallback JPEG) ผ่าน `<canvas>` — ~150–300KB/รูป → 1GB เก็บได้ ~4,000 รูป
- แสดง progress ต่อรูป · ลากเรียง (หรือปุ่ม ↑↓ บนมือถือ) · ⭐ ตั้งรูปหลัก · ช่อง `alt_th` บังคับกรอก (ค่าเริ่มต้น = "{name_th} {ลำดับ}")
- `credit` ค่าเริ่มต้น "ถ่ายที่ร้าน"

### 3.3 แท็บ "สูตรดูแล" (SPEC §6.9 `/care`)
- 3 ช่องตัวเลขรดน้ำตามฤดู + ปุ๋ย + เดือนงดปุ๋ย (ปุ่ม 12 เดือน) + เปลี่ยนกระถาง + ตัดแต่ง + ตรวจแมลง + `notes_th`
- **ตัวอย่างสดด้านขวา/ล่าง**: ตาราง 3 ฤดู × 3 สถานการณ์ตัวอย่าง ("ดินเผา 6 นิ้ว ระเบียง", "พลาสติก 8 นิ้ว ใกล้หน้าต่าง", "เซรามิก 12 นิ้ว ห้องแอร์") คำนวณด้วย `calculateCareInterval` ฝั่ง client — ตัวเดียวกับที่ลูกค้าใช้ ไม่มีตรรกะซ้ำ
- บันทึกสูตรแล้ว **ไม่** เปลี่ยน task ที่มีอยู่ของลูกค้าทันที — cron `generate-tasks` (F03) ใช้ค่าใหม่ในรอบถัดไป

### 3.4 แท็บ "ปัญหา"
รายการ accordion แก้ในที่ · อาการ / สาเหตุ / วิธีแก้ / ความรุนแรง (chip 3 สี + ไอคอน) · ↑↓ เรียงลำดับ

### 3.5 บันทึกร่างอัตโนมัติ
- ทุกฟอร์ม debounce 1.5 วินาที → `PATCH` · แสดงสถานะ "กำลังบันทึก… / บันทึกแล้ว 14:02 / ออฟไลน์ — จะบันทึกเมื่อต่อเน็ต"
- เก็บสำเนาใน `localStorage('tfl_admin_draft:{id}')` ถ้า PATCH ล้ม แล้วส่งซ้ำเมื่อ `online`
- Optimistic concurrency: ส่ง `updated_at` ที่รู้ไปด้วย ถ้าไม่ตรง → 409 + แจ้ง "มีคนแก้หน้านี้จากอีกเครื่อง" + ปุ่มโหลดใหม่

### 3.6 Publish
- Publish ได้เมื่อ: มีรูป ≥1 และมีรูปหลัก · มีสูตรดูแลครบ 3 ฤดู · มี `summary` และ `shop_note` — ไม่ครบ ปุ่มจะแสดงรายการที่ขาด
- Publish/แก้ไขแล้วเรียก `revalidatePath('/plants/[slug]')`, `revalidatePath('/')`, `revalidatePath('/search')` → เห็นในหน้าสาธารณะภายใน 1 นาที (SPEC §11.2 เส้นทาง 4)
- ทุก query สาธารณะต้องกรอง `published_at IS NOT NULL AND stock_status <> 'hidden'` (ตรวจ `speciesService` ทุกฟังก์ชัน)

## 4. Storage (Supabase)

- Bucket **`species-media`** — public read (รูปสินค้าไม่ใช่ข้อมูลส่วนตัว) · สร้างครั้งเดียวด้วย `scripts/storage-setup.ts`
- อัปโหลดแบบ **signed upload URL** เพื่อไม่ให้ไฟล์ผ่าน Vercel function (จำกัด body 4.5MB):
  1. `POST /api/admin/media/upload-url` `{ speciesId, contentType }` → server ตรวจ staff + ชนิดไฟล์ (`image/webp|jpeg|png`) → สร้าง path `species/{speciesId}/{uuid}.webp` → คืน signed upload URL (อายุ 60 วิ)
  2. browser `PUT` ไฟล์ตรงไป Supabase
  3. `POST /api/admin/media` `{ speciesId, path, altTh }` → server ตรวจว่า object มีจริงและ ≤ 2MB → ตรวจ magic bytes (อ่าน 12 byte แรก) → insert `species_media`
- `lib/storage/supabase.ts`: ใช้ REST ของ Storage ด้วย `fetch` + `SUPABASE_SERVICE_ROLE_KEY` (ไม่ต้องเพิ่ม `@supabase/supabase-js` ถ้าไม่จำเป็น — ถ้าใช้ก็ import เฉพาะฝั่ง server)
- `next.config.ts` `images.remotePatterns` เพิ่ม `{ protocol: "https", hostname: "<ref>.supabase.co", pathname: "/storage/v1/object/public/**" }`
- ลบรูป: ลบแถว + ลบ object (ถ้าลบ object ล้ม ให้ log แล้วไปต่อ — cron cleanup เก็บตก)

## 5. Data model (additive)

```sql
ALTER TABLE species       ADD COLUMN IF NOT EXISTS copied_from_id UUID REFERENCES species(id) ON DELETE SET NULL;
ALTER TABLE species_media ADD COLUMN IF NOT EXISTS storage_path TEXT;           -- NULL = รูปเก่าจาก URL ภายนอก
ALTER TABLE species_media ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
CREATE UNIQUE INDEX IF NOT EXISTS species_media_one_primary ON species_media (species_id) WHERE is_primary;
```

`species.published_at` มี default `NOW()` อยู่แล้ว — พันธุ์ใหม่จากหลังบ้านต้อง insert `published_at: null` ชัดเจน

## 6. API (ทุกตัวผ่าน `requireStaff` + zod)

| Method · Route | ทำอะไร |
|---|---|
| `GET /api/admin/species?q=&status=` | รายการ (รวม hidden/ร่าง) |
| `POST /api/admin/species` | สร้างร่าง (รองรับ `copyFromId` — คัดลอก care template + placement/light/water/soil; ไม่คัดลอกรูปและชื่อ) |
| `PATCH /api/admin/species/[id]` | แก้บางฟิลด์ + `expectedUpdatedAt` |
| `POST /api/admin/species/[id]/publish` · `/unpublish` | ตรวจเงื่อนไข §3.6 |
| `PUT /api/admin/species/[id]/care` | upsert `care_templates` (1–30 วัน, pause months 1–12) |
| `POST/PATCH/DELETE /api/admin/species/[id]/problems[/pid]` | CRUD ปัญหา |
| `POST /api/admin/media/upload-url` · `POST /api/admin/media` · `PATCH /api/admin/media/[id]` · `DELETE /api/admin/media/[id]` | §4 |
| `POST /api/admin/media/reorder` | `{ speciesId, orderedIds[] }` ใน transaction |

Service ใหม่: `lib/services/catalogAdminService.ts` (แยกจาก `adminService.ts` ที่เป็นเรื่อง dashboard)

## 7. i18n

namespace `admin_cms`: ชื่อแท็บ · label ทุกช่อง · สถานะบันทึก · ข้อความ publish checklist · ข้อความ error อัปโหลด (`too_large`, `bad_type`, `offline`)

## 8. Edge cases

- อัปรูปตอนเน็ตหลุด → เก็บในคิวของหน้า แสดง "รออัป" และลองใหม่อัตโนมัติ
- slug ซ้ำ → 409 + เสนอ slug ถัดไป (`-2`)
- เปลี่ยน slug หลัง publish → เก็บ slug เก่าใน `species_slug_redirects (old_slug PK, species_id)` แล้ว `/plants/[slug]` ทำ 308 ไปอันใหม่ (กัน SEO พัง)
- รูป HEIC จาก iPhone → `<canvas>` แปลงเป็น WebP ได้บน Safari; ถ้าแปลงไม่ได้แสดงข้อความให้เปลี่ยนการตั้งค่ากล้องเป็น "Most Compatible"

## 9. เทสต์

- `test/admin-cms.test.ts`: สร้างร่าง → ไม่โผล่ในหน้าสาธารณะ · publish ไม่ผ่านถ้าไม่มีรูป · copyFrom คัดลอกสูตรดูแลถูก · 409 เมื่อ `updated_at` ไม่ตรง · reorder ใน transaction · รูปหลักได้แค่ 1
- `lib/storage/*.test.ts`: magic bytes ตรวจ webp/jpeg/png และปฏิเสธ svg/html
- E2E: เพิ่ม `e2e/07-admin-cms.spec.ts` — สร้างพันธุ์ใหม่ → อัปรูป (fixture) → ตั้งสูตร → publish → เห็นใน `/search`

## 10. เกณฑ์ยอมรับ

- [ ] ที่บ้านเพิ่มพันธุ์ใหม่พร้อม 3 รูปจากมือถือจริงได้เองใน ≤ 5 นาที (จับเวลาจริง)
- [ ] เปลี่ยนรูป Unsplash ครบ 30 พันธุ์ (การ์ดเตือนใน `/admin` เหลือ 0)
- [ ] เน็ตหลุดระหว่างกรอกแล้วข้อมูลไม่หาย
- [ ] หน้าสาธารณะอัปเดตภายใน 1 นาทีหลัง publish
