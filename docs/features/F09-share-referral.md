# F09 — แชร์และแนะนำเพื่อน

> Milestone **M4** · Effort ~8 ชม. · Cost 0 (`next/og` บน Vercel) · ต้องมีก่อน: F13

## 1. ทำไม

- ลูกค้าต้นไม้ชอบอวดต้นไม้ และถามเพื่อนเรื่องต้นไม้ — ทุกการแชร์ที่ **มีรูปสวย + ชื่อร้าน** คือโฆษณาฟรีใน LINE กลุ่ม / Facebook
- ร้านอยากรู้ว่าใครพาลูกค้าใหม่มา เพื่อขอบคุณ (ส่วนลดใน LINE ตามที่ร้านตัดสินใจเอง) โดย **ไม่ต้องทำระบบแต้ม**

## 2. สิ่งที่แชร์ได้

| อะไร | จากไหน | ปลายทาง |
|---|---|---|
| หน้าต้นไม้ | ปุ่ม "แชร์" บน `/plants/[slug]` | `/plants/[slug]?ref=CODE` — OG image: รูปจริงของร้าน + ชื่อไทย + ไอคอนแสง/น้ำ + โลโก้ร้าน |
| **การ์ดต้นของฉัน** | `/garden/[id]` ปุ่ม "อวดต้นนี้" | `/p/[shareId]` หน้าสาธารณะอ่านอย่างเดียว: รูปที่ผู้ใช้ถ่าย (หรือรูปพันธุ์) · ชื่อเล่น · "เลี้ยงมา 132 วัน · รดน้ำตรงรอบ 94%" · ปุ่ม "ดูวิธีเลี้ยงต้นนี้" (→ หน้าพันธุ์ + ref) · ปุ่ม "เริ่มสวนของฉัน" |
| คอลเลกชัน (F13) | ปุ่มแชร์ | URL คอลเลกชัน + ref |

- ใช้ **Web Share API** (`navigator.share`) บนมือถือ → เลือก LINE/Facebook ได้เอง · เดสก์ท็อป fallback: คัดลอกลิงก์ + ปุ่ม LINE share (`https://social-plugins.line.me/lineit/share?url=`)
- การ์ดต้นของฉัน **ปิดเป็นค่าเริ่มต้น** — ผู้ใช้ต้องกดแชร์เองจึงสร้าง `shareId` (PDPA: ไม่เปิดข้อมูลโดยไม่ตั้งใจ) · ยกเลิกแชร์ได้ (ลิงก์ตาย 404)
- หน้า `/p/[shareId]` ไม่แสดง: ตำแหน่งในบ้าน · ชื่อจริง · รูปโปรไฟล์ LINE (แสดงแค่ "สวนของ {ชื่อที่ผู้ใช้ตั้งเอง หรือ 'คนรักต้นไม้'}") · `noindex`

## 3. Referral

- ทุกคนที่ล็อกอิน (F02) มี `users.referral_code` 6 ตัว (สร้างตอนสมัคร) · guest ไม่มี (ลิงก์แชร์ไม่มี `ref` ก็ได้)
- เข้าเว็บด้วย `?ref=CODE` → เก็บ cookie `tfl_ref` 30 วัน (first-touch — ไม่ทับถ้ามีแล้ว)
- ใช้ `tfl_ref` ที่ 2 จุด:
  1. **สมัครสมาชิก** → `users.referred_by = <user id เจ้าของโค้ด>` (ห้ามแนะนำตัวเอง)
  2. **สร้าง inquiry** → `inquiries.referral_code` + ข้อความ LINE ต่อท้าย `(แนะนำโดย CODE)` ก่อน ref code → **ร้านเห็นในแชทและตัดสินใจให้ส่วนลดเองได้ทันที**
- หน้า `/account`: "โค้ดแนะนำของคุณ: **AB12CD**" + ปุ่มแชร์ + "มีเพื่อนมาจากคุณ N คน"
- ข้อความชวน: ร้านกำหนดเองได้ใน env/config (`NEXT_PUBLIC_REFERRAL_BLURB`) เช่น "แนะนำเพื่อนมาซื้อ รับส่วนลด 5% ทั้งคู่ — แจ้งโค้ดในแชท" — **ระบบไม่คำนวณส่วนลด** (ไม่มีตะกร้าตาม P1)

## 4. OG image — `app/plants/[slug]/opengraph-image.tsx`, `app/p/[shareId]/opengraph-image.tsx`

- `ImageResponse` จาก `next/og` 1200×630 · ฟอนต์ไทยต้องโหลดเอง (ไฟล์ .ttf ของ Noto Sans Thai/IBM Plex Sans Thai subset ใน `app/fonts/`) — ไม่อย่างนั้นสระ/วรรณยุกต์จะแตก
- แคชตาม `updated_at` (static ต่อ slug + revalidate เมื่อแก้ใน F01)

## 5. Data model

```sql
ALTER TABLE users       ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE inquiries   ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE user_plants ADD COLUMN IF NOT EXISTS share_id TEXT UNIQUE;      -- NULL = ไม่ได้แชร์
ALTER TABLE user_plants ADD COLUMN IF NOT EXISTS share_display_name TEXT;
```
(`users.referral_code` เพิ่มใน F02)

## 6. i18n

namespace `share`: `share`, `share_my_plant`, `copied`, `unshare`, `days_with_me` (`{days}`), `on_time_rate` (`{pct}`), `start_your_garden`, `your_code`, `friends_joined` (`{count}`)

## 7. เทสต์ — `test/share-referral.test.ts`

cookie ref แบบ first-touch · แนะนำตัวเองไม่นับ · inquiry แนบ referral_code และข้อความ LINE ลำดับถูก (`… (แนะนำโดย AB12CD) [TFL-XXXX]`) · ยกเลิกแชร์แล้ว `/p/[id]` → 404 · หน้าแชร์ไม่มี placement/ชื่อจริง · OG route คืน `image/png`

## 8. เกณฑ์ยอมรับ

- [ ] แชร์หน้าต้นไม้ลง LINE แล้วเห็นการ์ดรูปจริง + ชื่อไทยถูกต้อง (สระไม่แตก)
- [ ] ร้านเห็น "(แนะนำโดย …)" ในแชท LINE จาก inquiry ของเพื่อนที่มาจากลิงก์
