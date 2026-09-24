# F10 — สมุดบันทึกการเติบโต (Growth Journal)

> Milestone **M5 (ถ้ามีเวลา)** · Effort ~8 ชม. · Cost 0 (Supabase Storage ภายในโควตาฟรี) · ต้องมีก่อน: F01 (storage), F09 (แชร์)

## 1. ทำไม

- การเห็นต้นไม้ **โตขึ้นจริง** เป็นรางวัลทางใจที่ทำให้คนเลี้ยงต่อ (และกลับมาเปิดแอป) มากกว่าตัวเลขรอบรดน้ำ
- รูปก่อน/หลังคือคอนเทนต์ที่คนอยากแชร์ที่สุด (ดัน F09) และเป็นประวัติสุขภาพที่ร้านใช้ช่วยวิเคราะห์ปัญหาได้ (F06, Phase 2 หมอต้นไม้)
- ทำหลัง M4 เพราะมูลค่าขึ้นกับว่ามีคนใช้แจ้งเตือนสม่ำเสมอแล้ว

## 2. UX

- `/garden/[id]` แท็บ "บันทึก": timeline รวม `care_logs` + รูป + โน้ต (มีอยู่แล้วบางส่วน — เพิ่มรูป)
- ปุ่ม **[📷 ถ่ายรูปวันนี้]** · แนบรูปได้ตอนกด "รดแล้ว" แบบไม่บังคับ (ไอคอนกล้องเล็กข้างปุ่ม)
- **ชวนถ่ายเดือนละครั้ง**: วันที่ครบเดือนของ `acquired_at` ใส่บรรทัดเดียวในสรุปประจำวัน F03 "ครบ 3 เดือนกับเจ้าอ้วนแล้ว ถ่ายรูปเก็บไว้ไหม?" (ไม่ใช่ข้อความแยก)
- มุมมอง **ก่อน/หลัง**: เลือก 2 รูป → slider เทียบ → ปุ่มแชร์ (F09 — การ์ดใช้รูปคู่)
- รูปแรกที่ผู้ใช้ถ่าย → ตั้งเป็น `user_plants.photo_url` อัตโนมัติ (การ์ดในสวนเป็นต้นของเขาเอง ไม่ใช่รูปร้าน)

## 3. รูปและความเป็นส่วนตัว

- บีบฝั่ง browser: ด้านยาว 1280px WebP q0.75 (~100–200KB) · ลบ EXIF (canvas re-encode ลบให้อยู่แล้ว — **รวมพิกัด GPS**)
- Bucket **`user-photos` แบบ private** · path `u/{ownerKey}/{plantId}/{uuid}.webp` · อ่านผ่าน **signed URL อายุ 1 ชม.** ที่ server สร้างให้หลังตรวจ owner (SPEC §9.1 ถือว่ารูปในบ้านเป็นข้อมูลอ่อนไหว)
- การ์ดที่แชร์ (F09) ใช้รูปที่ผู้ใช้ **เลือกเอง** เท่านั้น → คัดลอกไปไว้ใน path สาธารณะ `shared/{shareId}/…` ตอนกดแชร์ และลบเมื่อยกเลิกแชร์
- โควตา: ≤ 60 รูป/ต้น, ≤ 500 รูป/ผู้ใช้ · guest ≤ 20 รูปรวม (ชวนล็อกอินเมื่อถึง)
- ลบต้น/ลบบัญชี (F11) → ลบรูปทั้งหมด

## 4. Data model

```sql
CREATE TABLE IF NOT EXISTS plant_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_plant_id UUID NOT NULL REFERENCES user_plants(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  taken_at DATE NOT NULL,
  care_log_id UUID REFERENCES care_logs(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS plant_photos_plant_idx ON plant_photos (user_plant_id, taken_at DESC);
```

## 5. API

`POST /api/garden/plants/[id]/photos/upload-url` · `POST /api/garden/plants/[id]/photos` · `GET /api/garden/plants/[id]/photos` (คืน signed URLs) · `DELETE /api/garden/photos/[photoId]` — ทุกตัว `requireOwner` + rate limit 20 อัป/ชม.

## 6. เทสต์

owner อื่นขอ signed URL → 404 · โควตาเต็ม → 409 พร้อมข้อความ · ลบต้นแล้ว object ถูกลบ (mock storage) · magic bytes ตรวจแบบเดียวกับ F01

## 7. เกณฑ์ยอมรับ

- [ ] ถ่าย → เห็นใน timeline ภายใน 3 วินาทีบน 4G
- [ ] ไม่มี URL สาธารณะของรูปผู้ใช้ ยกเว้นรูปที่เลือกแชร์เอง
