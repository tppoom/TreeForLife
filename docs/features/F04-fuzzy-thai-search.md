# F04 — ค้นหาภาษาไทยแบบพิมพ์ผิดก็เจอ

> Milestone **M2** · Effort ~5 ชม. · Cost 0 · ต้องมีก่อน: F00
> SPEC §6.2 ("มอนสเตอร่า" / "มอนสเตอรา" / "มอนสะเตอร่า" ต้องเจอเหมือนกัน)

## 1. ทำไม

คนไทยสะกดชื่อต้นไม้ทับศัพท์ไม่ตรงกันแทบทุกคน ค้นไม่เจอ 1 ครั้ง = ปิดเว็บ และคำค้นนั้นไปโผล่ใน `search_misses` เป็น false positive ทำให้ร้านเข้าใจตลาดผิด

## 2. การออกแบบ

### 2.1 Normalize (`lib/search/normalize.ts`) — ใช้ทั้งตอนสร้าง index และตอนค้น
1. `NFC` → ตัวพิมพ์เล็ก → ตัดช่องว่าง/ขีด/จุด
2. ตัดวรรณยุกต์และเครื่องหมาย: `่ ้ ๊ ๋ ็ ์ ํ ฺ` (U+0E47–U+0E4E, U+0E3A)
3. ตัด `ะ` กลางคำ (มอนสะเตอร่า → มอนสเตอรา)
4. **ยังไม่ต้องรวมพยัญชนะเสียงเดียวกัน** (ซ/ส, ท/ธ ฯลฯ) — trigram รับมือส่วนใหญ่ได้แล้ว เริ่มจากข้อ 1–3 แล้วค่อยเพิ่มกติกาจากคำค้นจริงใน `search_misses` (อย่าเดา)

### 2.2 Index
- คอลัมน์ `species.search_text TEXT` = normalize(name_th ‖ name_en ‖ name_sci ‖ aliases ทั้งหมด) คั่นด้วยช่องว่าง · อัปเดตใน service ทุกครั้งที่แก้พันธุ์ (F01) + backfill ครั้งเดียวตอนบูต (`UPDATE ... WHERE search_text IS NULL`)
- ใช้ **pg_trgm**: `CREATE EXTENSION IF NOT EXISTS pg_trgm;` + `CREATE INDEX IF NOT EXISTS species_search_trgm ON species USING gin (search_text gin_trgm_ops);`
  - Supabase: เปิดได้ด้วยคำสั่งเดียวกัน (อยู่ใน schema `extensions` — ใช้ `extensions.gin_trgm_ops` ถ้าหาไม่เจอ)
  - PGlite: ต้องโหลด contrib `import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm"` แล้วส่ง `extensions: { pg_trgm }` ตอนสร้าง `new PGlite(...)` ใน `lib/db/index.ts` และในเทสต์

### 2.3 Query
```sql
SELECT id, ...,
  GREATEST(similarity(search_text, $q), word_similarity($q, search_text)) AS score
FROM species
WHERE published_at IS NOT NULL AND stock_status <> 'hidden'
  AND (search_text ILIKE '%' || $q || '%' OR $q <% search_text)
  -- + ฟิลเตอร์เดิมทั้งหมด
ORDER BY (search_text ILIKE $q || '%') DESC, score DESC, <sort ที่ผู้ใช้เลือก>
LIMIT 50;
```
- `$q` = normalize(input) · ตั้ง `SET pg_trgm.word_similarity_threshold = 0.3` ต่อ session หรือใช้ `word_similarity(...) > 0.3` ตรง ๆ
- ถ้าไม่เจอ **แต่มีตัวที่ score 0.2–0.3** → แสดง "หมายถึง **มอนสเตอร่า** ใช่ไหม?" (ลิงก์ค้นใหม่) และ **ยังนับเป็น search miss** แต่ตั้ง `search_misses.suggested_species_id`
- คำค้นสั้น ≤ 1 ตัวอักษร → ไม่ค้น

### 2.4 Search miss ให้มีประโยชน์ขึ้น
```sql
ALTER TABLE search_misses ADD COLUMN IF NOT EXISTS normalized_query TEXT;
ALTER TABLE search_misses ADD COLUMN IF NOT EXISTS suggested_species_id UUID REFERENCES species(id) ON DELETE SET NULL;
ALTER TABLE search_misses ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
```
- รวมคำค้นที่ normalize แล้วเหมือนกันเป็นแถวเดียว (upsert ด้วย `normalized_query`)
- หลังบ้านแท็บ "คำค้นไม่เจอ": ปุ่ม **"เพิ่มเป็นชื่อเล่นของ…"** (เพิ่ม alias ให้พันธุ์ที่มีอยู่ → คำนี้ค้นเจอทันที) และ **"สร้างพันธุ์ใหม่จากคำนี้"** (ไป F01) → ตั้ง `resolved_at`

## 3. เทสต์ — `lib/search/normalize.test.ts`, `test/search-fuzzy.test.ts`

- `มอนสเตอร่า`, `มอนสเตอรา`, `มอนสะเตอร่า`, `monstera`, `Monstera deliciosa` → เจอ monstera เป็นอันดับแรก
- `ลิ้นมังกร` / `ลิ้นมังกอน` → sansevieria
- ค้นด้วย alias ที่เพิ่งเพิ่มจากหลังบ้าน → เจอ
- คำที่ไม่เกี่ยวเลย (`รถยนต์`) → 0 ผล + มีแถวใน `search_misses`
- ประสิทธิภาพ: 1,000 species ปลอม → query < 50ms บน PGlite

## 4. เกณฑ์ยอมรับ

- [ ] 3 คำตัวอย่างใน SPEC §6.2 เจอผลเดียวกัน
- [ ] หลังบ้านแปลงคำค้นไม่เจอเป็น alias ได้ในคลิกเดียว
- [ ] ไม่มีการเรียกบริการค้นหาภายนอก (ต้นทุน 0)
