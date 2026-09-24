# F13 — หน้าคอลเลกชันเพื่อ SEO + OG image

> Milestone **M2** · Effort ~6 ชม. · Cost 0 · ต้องมีก่อน: — (ดีขึ้นมากหลัง F01 มีรูปจริง)
> SPEC §3.2 (เหตุผลที่ทำเว็บ = Google) · §6.3 SEO

## 1. ทำไม

คนไทยค้น Google ด้วย **ปัญหา/สถานการณ์** มากกว่าชื่อพันธุ์: "ต้นไม้ห้องแอร์", "ต้นไม้ปลอดภัยกับแมว", "ต้นไม้ในห้องน้ำ", "ต้นไม้ฟอกอากาศ มือใหม่" — หน้า `/search?...` ถูก index ได้ไม่ดี (query string, เนื้อหาบาง) แต่ **หน้าคอลเลกชันที่มี URL สวย + ย่อหน้าอธิบายจากร้าน + รายการต้นจริง** ติดอันดับได้ และทุกหน้าจบที่ปุ่มถามร้าน = ลูกค้าใหม่ต้นทุน 0

## 2. การออกแบบ

- `lib/collections.ts` — รายการคอลเลกชันเป็น **โค้ด** (ไม่ต้องมี CMS): `{ slug, titleTh, titleEn, introTh, introEn, filter: SpeciesFilterParams, faq: [{q,a}] }`
- เริ่ม 8 หน้า (ตรงกับทางลัดหน้าแรก + คำค้นยอดนิยม):
  `ต้นไม้ห้องแอร์` (`/collections/air-con-plants`) · `ปลอดภัยกับสัตว์เลี้ยง` (`pet-safe-plants`) · `มือใหม่เลี้ยงง่าย` (`beginner-plants`) · `ต้นไม้ทนแดด` (`full-sun-plants`) · `ต้นไม้ในห้องน้ำ` (`bathroom-plants`) · `ต้นไม้แสงน้อย` (`low-light-plants`) · `ต้นเล็กวางโต๊ะ` (`desk-plants`) · `ต้นไม้ระเบียงคอนโด` (`balcony-plants`)
- `app/collections/[slug]/page.tsx` — Server Component · `generateStaticParams` · `revalidate = 3600`
  - H1 = `titleTh` · ย่อหน้าแนะนำ 80–150 คำ **เขียนโดยร้าน** (ร่างให้ แล้วที่บ้านแก้ให้เป็นเสียงร้าน)
  - กริดต้นไม้จาก `getAllSpecies(filter)` เรียง `in_stock` ก่อน
  - FAQ 3–5 ข้อ + JSON-LD `FAQPage` · `ItemList` ของต้นไม้ · `BreadcrumbList`
  - ปุ่มลอย "ไม่แน่ใจว่าต้นไหนเหมาะ? ถามร้าน" → inquiry `care_help` `source_page=/collections/...`
- หน้าแรก: ทางลัด 6 อัน ลิงก์ไปคอลเลกชัน (แทน `/search?…`) · `/collections` หน้ารวม
- `sitemap.ts`: เพิ่มคอลเลกชัน + `lastModified` จริงของ species (ตอนนี้อาจเป็นเวลาปัจจุบัน — ตรวจ)
- `canonical`: หน้า `/search` ที่ filter ตรงกับคอลเลกชันพอดี → `<link rel="canonical">` ชี้ไปคอลเลกชัน · `/search` ทั่วไป `noindex, follow`

## 3. OG image

- `app/opengraph-image.tsx` (หน้าแรก) · `app/collections/[slug]/opengraph-image.tsx` · `app/plants/[slug]/opengraph-image.tsx` (ใช้ร่วมกับ F09)
- ฟอนต์ไทยฝังจาก `app/fonts/` (ดู F09 §4)

## 4. Metadata ที่ต้องตรวจทุกหน้า

`title` ≤ 60 ตัวอักษรแบบ SPEC §6.3 · `description` จาก summary/intro ≤ 155 · `alternates.canonical` · `openGraph.locale = 'th_TH'` · `<html lang="th">` · รูปทุกใบมี `alt` ไทย

## 5. เทสต์

`test/collections.test.ts`: ทุก collection slug ไม่ซ้ำ · ทุก filter คืนผล ≥ 3 ต้นจาก seed (กันหน้าบาง) · JSON-LD parse ได้ และ escape `<` แบบเดียวกับหน้าต้นไม้ · sitemap มีทุกคอลเลกชัน
Lighthouse มือถือบนหน้าคอลเลกชัน: SEO ≥ 95, Performance ≥ 85 (SPEC §11.3)

## 6. เกณฑ์ยอมรับ

- [ ] 8 หน้าคอลเลกชันออนไลน์ มี intro จากร้าน และส่ง sitemap ใน Google Search Console แล้ว
- [ ] Rich results test ผ่านสำหรับ FAQ
