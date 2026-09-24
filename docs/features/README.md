# Feature Specs — พร้อม implement

> ภาพรวม ลำดับ และเหตุผลอยู่ใน [`../ROADMAP.md`](../ROADMAP.md) · กติกาโค้ดอยู่ใน [`../CONVENTIONS.md`](../CONVENTIONS.md)
> สั่ง implement ทีละไฟล์ได้เลย เช่น "implement docs/features/F00-production-hardening.md"

## ลำดับการทำ (มี dependency)

```
M1  F00 ──┬──► F11
          │
M2        ├──► F01 ──► F13
          ├──► F04
          │
M3        └──► F02 ──► F03 ──┬──► F06
                             ├──► F07
M4                F01 ──► F05 (ต้องมี F02 สำหรับ claim ข้ามเครื่อง แต่ทำงานกับ guest ได้)
                             ├──► F08
                  F13 ──► F09
M5                F12 (เริ่มเก็บ event ตั้งแต่ M3) · F10
```

| ID | ไฟล์ | ต้องมีก่อน |
|---|---|---|
| F00 | [production-hardening](./F00-production-hardening.md) | — |
| F01 | [admin-catalog-cms](./F01-admin-catalog-cms.md) | F00 |
| F02 | [line-login-sessions](./F02-line-login-sessions.md) | F00 |
| F03 | [care-reminders](./F03-care-reminders.md) | F02 |
| F04 | [fuzzy-thai-search](./F04-fuzzy-thai-search.md) | F00 |
| F05 | [qr-care-tags](./F05-qr-care-tags.md) | F01 |
| F06 | [aftercare-checkins](./F06-aftercare-checkins.md) | F03 |
| F07 | [wishlist-restock-alerts](./F07-wishlist-restock-alerts.md) | F03 |
| F08 | [supplies-nudges](./F08-supplies-nudges.md) | F03 |
| F09 | [share-referral](./F09-share-referral.md) | F13 |
| F10 | [growth-journal](./F10-growth-journal.md) | F01 (storage) |
| F11 | [pdpa-privacy](./F11-pdpa-privacy.md) | F00 |
| F12 | [first-party-analytics](./F12-first-party-analytics.md) | F00 |
| F13 | [seo-collections](./F13-seo-collections.md) | — |

## โครงของทุกไฟล์

1. **ทำไม** — ดันขั้นไหนของ growth loop, value ต่อร้าน
2. **ขอบเขต** — ทำ / ไม่ทำ
3. **UX flow** — ทีละขั้นจากมุมผู้ใช้
4. **Data model** — SQL ที่ต้องต่อท้าย `lib/db/schema-ddl.ts` + ของคู่กันใน `db/schema.ts`
5. **API / Server** — route, input, output, สิทธิ์
6. **i18n** — namespace ใหม่ใน `translations.ts`
7. **Edge cases & ความปลอดภัย**
8. **เทสต์** — ไฟล์และเคสที่ต้องมี
9. **เกณฑ์ยอมรับ** — checklist ที่ใช้ปิดงาน
10. **ต้นทุน**

## กติการ่วมที่ทุกไฟล์อ้างถึง

- **Additive schema (ADR-03)**: ตารางใหม่ใช้ `CREATE TABLE IF NOT EXISTS` · คอลัมน์ใหม่ใช้ `ALTER TABLE x ADD COLUMN IF NOT EXISTS` · index ใช้ `CREATE INDEX IF NOT EXISTS` · ห้าม rename/drop ในรอบเดียวกับที่โค้ดยังอ่านของเก่า
- **Enum เก็บเป็น `TEXT` ธรรมดา** ตามแบบเดิมของ DDL (ไม่มี `CHECK`) — ค่าที่ถูกต้องบังคับด้วย zod ใน `lib/validation/` (F00) · เพิ่มค่าใหม่ = แก้ union type + zod schema + คอมเมนต์ใน `db/schema.ts`
- **ตัวตนผู้เรียก** หลัง F00/F02 มาจาก `getActor(req)` ใน `lib/auth/actor.ts` เท่านั้น ห้ามรับ `userId` จาก body/query
- **วันที่**: `formatDate(new Date())` จาก `@/lib/care/scheduler` เสมอ · เวลาส่งแจ้งเตือนคิดใน `Asia/Bangkok`
- **ข้อความไป LINE** สร้างผ่าน `lib/line/` เท่านั้น และลงท้ายด้วย ref code เสมอ (SPEC §6.4)
