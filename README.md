# 🌿 TreeForLife (ทรี ฟอร์ ไลฟ์)
> **Boutique Plant Nursery Catalog & Thai 3-Season Smart Care Platform**  
> เว็บแอปพลิเคชันคลังพันธุ์ไม้และระบบจัดตารางดูแลต้นไม้อัจฉริยะตามฤดูกาลไทยแบบ 3 ฤดู พร้อมระบบส่งต่อ LINE Official Account

[![Next.js](https://img.shields.io/badge/Next.js-15.1.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## ✨ ไฮไลท์และฟีเจอร์เด่น (Key Features)

- 🌱 **30 คัดสรรพันธุ์ไม้เรือนเพาะชำ (Curated Plant Catalog)**:
  - ข้อมูลพฤกษศาสตร์ครบถ้วน (ชื่อไทย, อังกฤษ, วิทยาศาสตร์, วงศ์, แสง, น้ำ, ดินผสมเฉพาะ)
  - รูปถ่ายจริงจากเรือนเพาะชำ พร้อมป้าย "ถ่ายที่ร้าน" (Authentic Shop Credit)
  - ป้ายระบุความปลอดภัยต่อสัตว์เลี้ยง (Pet Safe) และฟอกอากาศ (Air Purifying)
- 🌦️ **ระบบคำนวณการดูแลตามสภาพอากาศไทย 3 ฤดู (Thai 3-Season Care Engine)**:
  - คำนวณรอบรดน้ำตามฤดูร้อน (มี.ค.–พ.ค.), ฤดูฝน (มิ.ย.–ต.ค.), และฤดูหนาว/แล้ง (พ.ย.–ก.พ.)
  - ปรับตัวคูณตามวัสดุกระถาง (Terracotta, Plastic, Glazed, Cement) และตำแหน่งแสง (Indoor/Outdoor/Air-con)
- 🏡 **สวนของฉัน & ปฏิทินดูแล 30 วัน (My Garden & Care Calendar)**:
  - Wizard 4 ขั้นตอนพร้อม Live Preview สูตรคำนวณก่อนบันทึก
  - ป้ายเตือนตามกำหนดแบบเข้าถึงได้ (Overdue, Due Today, Upcoming)
  - ปฏิทินพรีวิวรอบดูแลล่วงหน้า 30 วัน และบันทึกประวัติการดูแล (Care Logs)
- ✅ **แดชบอร์ดงานดูแลประจำวัน (Today's Tasks Dashboard)**:
  - แยกหมวดหมู่งานที่ต้องทำและงานที่เลยกำหนด
  - ปุ่มจัดการด่วน: รดแล้ว (Done), เลื่อน +1 วัน (Snooze ได้สูงสุด 3 ครั้ง), ข้ามรอบนี้ (Skip)
  - ปุ่มรดน้ำครบทุกต้นในคลิกเดียว (Batch Mark All Done)
- 💬 **LINE Inquiry & Handoff Integration**:
  - สร้างรหัสอ้างอิงอัตโนมัติ `TFL-XXXX` เพื่อส่งต่อความต้องการไปยัง LINE Official Account
  - Deep Link เข้า LINE แอปพลิเคชันบนมือถือ และ QR Code สแกนบนคอมพิวเตอร์
- 🛠️ **ระบบจัดการร้าน (Shop Admin Dashboard)**:
  - ระบบล็อกอินจำลอง (Guest, Customer, Staff, Admin)
  - ปรับสถานะสต็อกแบบเรียลไทม์ (In Stock, Made to Order, Seasonal)
  - ตารางบันทึกการสอบถามของลูกค้า และ Demand Analytics จากคำค้นหาที่ไม่พบ
- 🔒 **ระบบความปลอดภัยระดับ Production & PDPA (Milestone 1 — v1.2.0)**:
  - **Resource Ownership**: ตรวจสอบความเป็นเจ้าของต้นไม้ (`requireOwner`) ผ่าน `x-guest-token` header และตอบกลับ 404 NOT_FOUND เมื่อไม่ได้รับอนุญาตเพื่อป้องกันการสุ่มเจาะดูข้อมูล
  - **Database Rate Limiting**: ป้องกันการ Flood API ด้วยตาราง `rate_limits` ตอบกลับ HTTP 429 พร้อม header `Retry-After`
  - **Zod Schema Validation**: ตรวจสอบความถูกต้องของข้อมูล Request Body/Query ทุกจุด (`lib/validation/`)
  - **HTTP Security Headers & Error Boundaries**: ป้องกัน XSS/Clickjacking และมีหน้า Error/404 สไตล์ Botanical Luxury
  - **PDPA Privacy Compliance**: หน้านโยบายความเป็นส่วนตัวสองภาษา `/privacy`, ข้อกำหนด `/terms`, สิทธิขอรับข้อมูล JSON (`GET /api/account/export`), และสิทธิขอให้ลบข้อมูล (`POST /api/account/delete` พร้อมปุ่มล้างข้อมูลในเครื่อง)
- 🌐 **รองรับ 2 ภาษา 100% (Bilingual TH / EN) & Dark Mode**:
  - คลังความรู้ภาษาอังกฤษสมบูรณ์ครบ 30 ชนิด ไร้ปัญหาข้อความหลุด
  - ธีมสีสไตล์ Botanical Luxury (#faf8f5 Warm Sand / #0b1a13 Deep Forest)

---

## 🌟 สถาปัตยกรรม 2 เวอร์ชัน (Dual-Version Setup)

TreeForLife ถูกออกแบบให้สามารถรันได้ 2 โหมดจาก Codebase เดียวกัน ผ่านตัวแปรสภาพแวดล้อม `NEXT_PUBLIC_APP_MODE`:

1. **เวอร์ชันใช้งานจริง (Phase 1 Production Ready)**:
   - เหมาะสำหรับลูกค้าและผู้เยี่ยมชมทั่วไป: UI สะอาด ไม่มีป้าย Mock/เดโม และซ่อนเมนูสลับบทบาท
   - หน้า `/demo` จะถูกจำกัดสิทธิ์และ redirect สู่หน้าหลักทันที
   - กำหนดใน Vercel: `NEXT_PUBLIC_APP_MODE=production` (หรือปล่อยว่าง โค้ดจะใช้ค่านี้เป็น Default)

2. **เวอร์ชันศูนย์รวมต้นแบบทุกเฟส (All-Phases Prototype Showcase Hub)**:
   - เหมาะสำหรับการนำเสนอวิสัยทัศน์โครงการต่อคนในครอบครัว นักลงทุน หรือทดสอบ UI ล่วงหน้า
   - เปิดแถบแจ้งเตือน Demo Mode พร้อมปุ่มนำทางเข้าสู่ **Showcase Hub (`/demo`)**
   - รวมโปรโตไทป์แบบ Interactive ครบถ้วน:
     - **Phase 1: ระบบหลัก** — คลัง 30 พันธุ์ไม้, สวน 3 ฤดู, งานดูแลประจำวัน, ติดต่อ LINE OA
     - **Phase 2: AI อัจฉริยะ** — หมอต้นไม้ AI (วินิจฉัยโรค), ออกแบบมุมสวน AI (Before/After slider), แชทผู้ช่วยพฤกษศาสตร์, คำนวณงบประมาณ
     - **Phase 3: ชุมชนและการเติบโต** — ขอใบเสนอราคาจัดสวนพร้อมแจกแจงค่าใช้จ่าย, กระดานบันทึกการเติบโตและกดไลก์/คอมเมนต์, บัตรสมาชิก Green Club และแต้มสะสม, แดชบอร์ดสถิติร้านค้า
   - กำหนดใน Vercel: `NEXT_PUBLIC_APP_MODE=demo`

---

## 🚀 เริ่มต้นใช้งานในเครื่อง (Local Development)

### ความต้องการของระบบ:
- Node.js 18+ (แนะนำ Node 20+)
- npm หรือ pnpm

### ติดตั้งและเปิดเซิร์ฟเวอร์:
```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. คัดลอกไฟล์ Environment (ค่าเริ่มต้นใช้ Local Embedded PGlite อัตโนมัติ ไม่ต้องลง Postgres)
cp .env.example .env.local

# 3. รัน Development Server
npm run dev
```
เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

---

## 🧪 การทดสอบและตรวจสอบคุณภาพ (Testing & Quality)

```bash
# รัน Unit & Integration Tests ทั้งหมด (217 การทดสอบ ผ่าน 100%)
npm run test

# รัน End-to-End Playwright Tests (6 Flow ผ่าน 100%)
npm run test:e2e

# ตรวจสอบ Type Safety
npx tsc --noEmit

# ทดสอบ Production Build
npm run build

# ทดสอบและตรวจสอบสถานะ Database
npm run db:setup
```

---

## 🌐 การ Deploy ขึ้นใช้งานจริง (100% Free Deployment)

อ่านคู่มือฉบับเต็มได้ที่ [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

1. **สร้าง Database ฟรี**: สมัคร [Neon.tech](https://neon.tech) (เลือก Region: Singapore) แล้วคัดลอก **Pooled Connection String**
2. **Import โปรเจกต์บน Vercel**: เข้า [Vercel.com](https://vercel.com) แล้ว Import จาก Repository นี้
3. **กำหนด Environment Variables บน Vercel**:
   - `DATABASE_URL` = Connection String จาก Neon
   - `NEXT_PUBLIC_SITE_URL` = URL เว็บของคุณ
4. กด **Deploy** 🚀 (ระบบจะรัน DDL และ Auto-Seed ข้อมูล 30 ชนิดเข้าสู่ Cloud ให้โดยอัตโนมัติ)

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
TreeForLife/
├── app/                  # Next.js 15 App Router (Pages, Layouts, API Routes)
│   ├── admin/            # หน้า Shop Admin Dashboard
│   ├── api/              # REST API Routes (plants, tasks, inquiries, stock)
│   ├── garden/           # หน้า My Garden Hub, Add Wizard, Plant Detail
│   ├── plants/           # หน้ารายละเอียดพฤกษศาสตร์สาธารณะ (/plants/[slug])
│   ├── search/           # หน้าค้นหาและกรองพันธุ์ไม้ Faceted Search
│   └── today/            # หน้าแดชบอร์ดงานดูแลประจำวัน
├── components/           # React Components แยกตามหมวดหมู่
├── db/                   # Drizzle ORM Schema Definitions
├── docs/                 # เอกสารระบบ (SPEC, CONVENTIONS, PROGRESS, DEPLOYMENT)
├── lib/                  # Core Business Logic & Services
│   ├── care/             # Thai 3-Season Care Scheduler Engine
│   ├── context/          # AppContext (Auth, Theme, i18n, Toast)
│   ├── db/               # Database Engine (PGlite & Postgres DDL + Auto-seed)
│   ├── i18n/             # Bilingual Dictionary & English Knowledge Base
│   └── services/         # Domain Services
├── scripts/              # Automated Audit & Setup Utilities
└── test/                 # Vitest & Playwright E2E Test Suites
```

---

## 📄 ใบอนุญาต (License)
MIT License © 2026 TreeForLife Boutique Plant Nursery.
