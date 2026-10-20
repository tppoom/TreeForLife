# TreeForLife — Deployment Guide

> Production stack: **Vercel (Next.js, region `sin1`) + Supabase Postgres (Singapore)**
> ทางเลือกอื่น (Neon, Docker) อยู่ท้ายเอกสาร · ภาพรวมการตัดสินใจอยู่ใน [`ROADMAP.md` §5](./ROADMAP.md)

## 0. Production ปัจจุบัน

| | |
|---|---|
| URL | https://treeforlife-app.vercel.app |
| Vercel project | `treeforlife-app` (team `tppooms-projects`, region `sin1`) — **ไม่ใช่** project `tree-for-life` ซึ่งเป็นโค้ดอีกชุด |
| Supabase project | `treeforlife-app` (ref `bhjearzlvtydtopaqpmg`, Singapore) · RLS เปิดทุกตาราง (Data API อ่านไม่ได้) |
| Credentials | อยู่ในเครื่องผู้ดูแลที่ `~/.treeforlife-prod-credentials` (ย้ายเข้า password manager) |
| Demo (Showcase) | https://treeforlife-demo.vercel.app — project `treeforlife-demo` (`NEXT_PUBLIC_APP_MODE=demo`) · **เชื่อม GitHub แล้ว: push เข้า `main` = deploy production อัตโนมัติ** |

> ⚠️ **Vercel Hobby บล็อก deployment (`TEAM_ACCESS_REQUIRED`) ถ้าอีเมลผู้ commit ไม่ใช่อีเมลที่ยืนยันในบัญชี Vercel** — เพิ่มอีเมล git (`git config user.email`) ใน Vercel → Account Settings → Emails (ทำแล้วสำหรับ `tp.thanapoom@gmail.com`)
>
> `treeforlife-app` ยังไม่ได้เชื่อม GitHub — deploy ด้วย `vercel deploy --prod` จนกว่าจะเชื่อมใน Vercel → Project → Settings → Git

---

## 0.1 สถาปัตยกรรม 2 เวอร์ชัน (Dual-Mode Deployment)

ระบบ TreeForLife รองรับการ deploy แยกเป็น 2 เวอร์ชันจาก codebase เดียวกัน ควบคุมผ่านตัวแปร `NEXT_PUBLIC_APP_MODE`:

```
                    ┌────────────────────────┐
                    │  Codebase: TreeForLife │
                    └───────────┬────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌───────────────────────────────┐       ┌───────────────────────────────┐
│ 1. Production (พร้อมใช้งานจริง) │       │ 2. Prototype Showcase (เดโม)   │
├───────────────────────────────┤       ├───────────────────────────────┤
│ URL: treeforlife-app.vercel.app│      │ URL: treeforlife-demo.vercel...│
│ NEXT_PUBLIC_APP_MODE=production│      │ NEXT_PUBLIC_APP_MODE=demo     │
│                               │       │                               │
│ • UI สะอาด ไม่มีป้าย Mock/เดโม  │       │ • แถบแจ้งเตือน Demo Mode      │
│ • ซ่อน Role Switcher ทั้งหมด   │       │ • เมนูสลับบทบาท (RoleSwitcher)│
│ • ป้องกัน /admin ด้วยรหัสผ่าน    │       │ • Showcase Hub ที่ /demo      │
│ • เข้า /demo จะถูก redirect ออก │       │ • จำลองครบทั้ง Phase 1, 2, 3  │
└───────────────────────────────┘       └───────────────────────────────┘
```

### การตั้งค่า Vercel สำหรับทั้ง 2 โปรเจกต์:

1. **Production Project (`treeforlife-app`)**:
   - `NEXT_PUBLIC_APP_MODE=production` (หรือปล่อยว่าง โค้ดจะ default เป็น production อัตโนมัติ)
   - `ADMIN_PASSWORD=<รหัสผ่านที่ปลอดภัย>`
   - `DATABASE_URL=<Supabase production pooler>`

2. **Prototype Showcase Project (`treeforlife-demo`)**:
   - `NEXT_PUBLIC_APP_MODE=demo`
   - `DATABASE_URL=<Supabase pooler>` (สามารถใช้ DB ร่วมกันหรือแยก read-only ได้)

---

## 1. สถาปัตยกรรม

```
ผู้ใช้ ──HTTPS──▶ Vercel (Next.js 15, sin1)
                    │  middleware.ts ── Basic Auth ป้องกัน /admin, /api/admin (ADMIN_PASSWORD)
                    │  lib/db/index.ts ── DATABASE_URL มี → pg.Pool + Drizzle
                    ▼
               Supabase Postgres (ap-southeast-1) ผ่าน Supavisor pooler
                    └─ บูตครั้งแรก: รัน SCHEMA_DDL (CREATE ... IF NOT EXISTS) + seed 30 พันธุ์
                       (advisory lock กัน function หลายตัว seed พร้อมกัน)
```

- ไม่มี `DATABASE_URL` → ใช้ PGlite ใน `.data/pglite` (**ใช้ได้เฉพาะเครื่อง dev** — บน Vercel filesystem เป็น read-only/ชั่วคราว ข้อมูลจะหาย)
- Schema เปลี่ยนได้แบบ **additive เท่านั้น** (ADR-03): คอลัมน์ใหม่ต้องใช้ `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` ต่อท้าย `SCHEMA_DDL` เพราะ `CREATE TABLE IF NOT EXISTS` ไม่แก้ตารางที่มีอยู่แล้วใน production

---

## 2. Environment variables

| ตัวแปร | จำเป็น | ใช้ที่ | รายละเอียด |
|---|:---:|---|---|
| `DATABASE_URL` | ✅ prod | server | Supabase **Transaction pooler** (port `6543`) — ดู §3 |
| `DB_POOL_MAX` | แนะนำ | server | ตั้ง `3` บน Vercel (serverless หลาย instance × pool เล็ก) |
| `ADMIN_PASSWORD` | ✅ prod | middleware | รหัสเข้า `/admin` (username อะไรก็ได้) · **ไม่ตั้ง = หลังบ้านถูกปิดใน production** |
| `SESSION_SECRET` | ✅ prod | auth, middleware | กุญแจเซ็น session cookie (HS256) ยาว **≥ 32 ตัวอักษร** สุ่มด้วย `openssl rand -base64 48` · **ไม่ตั้งใน production = ปฏิเสธทุก session (login LINE ใช้ไม่ได้)** เพราะค่า default ใน repo เป็นสาธารณะ |
| `NEXT_PUBLIC_SITE_URL` | ✅ | sitemap, robots, OG | เช่น `https://tree-for-life.vercel.app` หรือโดเมนจริง |
| `NEXT_PUBLIC_LINE_OA_ID` | ✅ | ปุ่มถามร้าน | ID ของ LINE OA **ไม่ต้องมี `@`** (โค้ดเติมให้ในลิงก์) |
| `NEXT_PUBLIC_APP_MODE` | เสริม | client/server | `production` (default สะอาดจริง) หรือ `demo` (เปิด Showcase Hub ที่ `/demo`) — ดู §0.1 |
| `NEXT_PUBLIC_SUPABASE_URL` | แนะนำ (รูป CMS) | client/server | Supabase Project URL (`https://<project-ref>.supabase.co`) สำหรับดึงรูปภาพสาธารณะ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ prod (รูป CMS) | server | Service Role Key ใช้สร้าง Signed Upload URL และลบรูปใน bucket `species-media` (หากไม่ตั้งจะใช้ Mock Provider ใน dev อัตโนมัติ) |
| ตัวแปรของ F02/F03 (LINE Login, VAPID, CRON_SECRET, …) | ภายหลัง | | ดูไฟล์ฟีเจอร์นั้น ๆ |

> ตัวแปร `NEXT_PUBLIC_*` ถูกฝังตอน build — แก้แล้วต้อง redeploy

---

## 3. ตั้งค่า Supabase

1. สร้าง project region **Southeast Asia (Singapore)** · ตั้ง database password แล้วเก็บไว้ใน password manager
2. **Project Settings → Data API**: ปิด (หรือไม่ expose schema `public`) — แอปต่อ Postgres ตรง ไม่ใช้ PostgREST และตารางไม่มี RLS (ADR-06)
3. **Connect → Transaction pooler** คัดลอก URI:
   ```
   postgresql://postgres.<project-ref>:<PASSWORD>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
   - ใช้ **transaction pooler (6543)** สำหรับ serverless · `sslmode` ไม่ต้องใส่ (โค้ดเปิด SSL ให้เองเมื่อ host ไม่ใช่ localhost)
   - โค้ดใช้ query แบบมี parameter ธรรมดา (ไม่มี prepared statement ชื่อ) จึงใช้กับ transaction mode ได้
4. **ใช้ project แยกสำหรับ TreeForLife** — ตารางชื่อ `users`, `species` ชนกับแอปอื่นได้ง่าย และ `CREATE TABLE IF NOT EXISTS` จะข้ามตารางเดิมที่โครงสร้างไม่ตรง ทำให้ seed ล้มหรือเขียนทับข้อมูลแอปอื่น
5. **PostgreSQL Extension (`pg_trgm`)**:
   - ระบบรองรับ Fuzzy Thai Search (Milestone 2) โดยใช้ `pg_trgm` และ GIN index บน `species.search_text`
   - ใน `SCHEMA_DDL` มีคำสั่ง `CREATE EXTENSION IF NOT EXISTS pg_trgm;` อัตโนมัติ (บน Supabase เป็น extension มาตรฐานที่เปิดใช้งานได้ทันที)
6. **Supabase Storage Bucket (`species-media`)**:
   - ไปที่ **Storage → Create bucket**
   - ตั้งชื่อ Bucket: `species-media`
   - เปิดสวิตช์ **Public bucket** (เพื่อให้ดึงภาพพฤกษศาสตร์แสดงผลในเว็บได้โดยตรง)
   - Policies: ค่าเริ่มต้นของ Public bucket จะเปิด Read ให้ anon อยู่แล้ว สำหรับ Write/Upload ระบบใช้ Service Role Key ผ่าน API ฝั่งเซิร์ฟเวอร์ (`/api/admin/media/upload-url`) ในการสร้าง Signed Upload URL จึงไม่ต้องเปิดสิทธิ์ให้อนุมัติเขียนภายนอก
   - คัดลอก `Project URL` และ `service_role key` จาก **Project Settings → API** ไปใส่ใน Environment Variables
7. Free plan จะ **pause project เมื่อไม่มีการใช้งาน ~7 วัน** — ก่อนมี cron (F03) ให้ตั้ง uptime monitor ฟรี (เช่น UptimeRobot) ยิงหน้าแรกวันละครั้ง

---

## 4. Deploy ด้วย Vercel CLI

```bash
# ครั้งแรก
vercel link --yes --project tree-for-life

# ตั้ง env (production) — ค่าลับพิมพ์ผ่าน stdin ไม่ให้ค้างใน shell history
vercel env add DATABASE_URL production --sensitive
vercel env add ADMIN_PASSWORD production --sensitive
printf '3' | vercel env add DB_POOL_MAX production
printf 'https://tree-for-life.vercel.app' | vercel env add NEXT_PUBLIC_SITE_URL production
printf '<line-oa-id>' | vercel env add NEXT_PUBLIC_LINE_OA_ID production
printf 'https://<project-ref>.supabase.co' | vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production --sensitive

# ตรวจก่อน deploy
make verify

# (ครั้งแรก) สร้างตาราง + seed จากเครื่องเรา แทนที่จะรอ request แรก
# ใช้ Session pooler (port 5432) เพราะ seed ใช้ advisory lock ระดับ session
DATABASE_URL='<session-pooler-uri>' npm run db:setup

# deploy
vercel deploy --prod
```

หลัง deploy ตรวจ:

```bash
curl -sI https://<domain>/ | head -1                      # 200
curl -s  https://<domain>/search?q=มอนสเตอร่า | grep -c "/plants/"   # > 0
curl -sI https://<domain>/admin | head -1                 # 401 (ต้องใส่รหัส)
curl -s  https://<domain>/sitemap.xml | head -5
curl -sI https://<domain>/collections/air-con-plants | head -1     # 200 (SEO Collections)
```

### 4.1 Deploy อัตโนมัติจาก GitHub
เชื่อม repo ใน Vercel → **Settings → Git** → ทุก push ไป `main` = production, ทุก PR = preview
Preview ใช้ `DATABASE_URL` ของ preview (แนะนำ Supabase branch หรือ project แยก) — **อย่าให้ preview ชี้ DB production**

---

## 5. Pre-flight checklist

- [ ] `make verify` ผ่าน (typecheck + 265 tests + build)
- [ ] `DATABASE_URL` ชี้ project ที่ถูกต้อง (ไม่ใช่ของแอปอื่น)
- [ ] `ADMIN_PASSWORD` ตั้งแล้ว และเข้า `/admin` ได้
- [ ] `NEXT_PUBLIC_LINE_OA_ID` เป็น OA จริงของร้าน (ลองกดถามร้านบนมือถือ)
- [ ] `NEXT_PUBLIC_SITE_URL` ตรงกับโดเมนที่ใช้จริง
- [ ] `NEXT_PUBLIC_SUPABASE_URL` และ `SUPABASE_SERVICE_ROLE_KEY` ตั้งค่าแล้ว (สำหรับระบบอัปโหลดรูป CMS)
- [ ] Supabase Storage bucket `species-media` สร้างแล้วและเปิดเป็น Public bucket
- [ ] ⚠️ Vercel Hobby ใช้ได้เฉพาะงานส่วนตัว/ไม่ใช่เชิงพาณิชย์ — เปิดใช้กับลูกค้าจริงให้ย้ายเป็น Pro

---

## 6. สถานะฟีเจอร์และการรักษาความปลอดภัย (Milestone 2 — v1.3.0)

ระบบได้รับการยกระดับฟีเจอร์การค้นหา คอลเลกชัน SEO และระบบจัดการร้านค้าอย่างสมบูรณ์ใน **v1.3.0** ควบคู่กับความปลอดภัยระดับองค์กรจาก Milestone 1:

### 6.1 ฟีเจอร์ใหม่ใน Milestone 2 (v1.3.0: Shop Operations & Discoverability)
- **Fuzzy Thai Search with `pg_trgm`**:
  - ระบบค้นหาอัจฉริยะที่ทนทานต่อการสะกดผิด วรรณยุกต์ และคำพ้องเสียงภาษาไทย (`lib/search/normalize.ts`)
  - ใช้ PostgreSQL `pg_trgm` GIN Index บนคอลัมน์ `species.search_text` ค้นหารวดเร็ว
  - ระบบ Fuzzy Similarity Search พร้อมคำแนะนำพันธุ์ไม้ใกล้เคียง (Fallback Suggestions) เมื่อไม่พบคำค้นตรง
  - บันทึกคำค้นหาที่ไม่พบลงตาราง `search_misses` แบบ normalized เพื่อวิเคราะห์ความต้องการลูกค้า (Demand Analytics)
- **8 SEO Botanical Collection Hubs (`/collections/*`)**:
  - คอลเลกชันพันธุ์ไม้ยอดนิยม 8 หน้าหลัก (ต้นไม้เลี้ยงในห้องแอร์, ปลอดภัยต่อสัตว์เลี้ยง, มือใหม่หัดปลูก, ฟอกอากาศ, ดูแลง่ายรดน้ำน้อย, ไม้ด่างหายาก, ต้นไม้ตั้งโต๊ะทำงาน, ไม้แดดระเบียง)
  - Pre-render แบบ Static Generation (SSG) พร้อม Schema.org JSON-LD (FAQPage + ItemList), Open Graph Dynamic Metadata และการอ้างอิงใน `sitemap.xml`
- **Shop Admin Catalog CMS with Photo Upload (`/admin/species/*`)**:
  - อินเทอร์เฟซบริหารจัดการสายพันธุ์พืชบนมือถือและเดสก์ท็อปครบวงจร (เพิ่ม, แก้ไข, คัดลอกร่าง Clone Species)
  - 4 แท็บฟังก์ชัน: ข้อมูลพฤกษศาสตร์, ตารางดูแล 3 ฤดูพร้อมสูตรคำนวณสด (Live Preview), อาการและปัญหาพบบ่อย, และคลังภาพ
  - การจัดการรูปภาพจริงจากร้านผ่าน Supabase Storage bucket `species-media` ด้วย Signed Upload URL โดยตรง พร้อมสลับใช้งาน Local Mock Provider อัตโนมัติเมื่อไม่มีคีย์คลาวด์
  - ระบบ Toggle สถานะสต็อกและปุ่มเผยแพร่ (Publish / Draft) พร้อมป้ายเตือนและตรวจสอบความถูกต้องด้วย Zod

### 6.2 ความปลอดภัยและการปฏิบัติตามกฎหมาย (Milestone 1 Baseline)
- **Actor Identity & Ownership**: API สวนของฉัน (`/api/garden/*`) ทุกเส้นทางตรวจสอบสิทธิ์ผ่าน `x-guest-token` header และ `requireOwner` (หากไม่ใช่เจ้าของจะตอบกลับเป็น HTTP 404 NOT_FOUND ทันทีเพื่อป้องกันการสุ่มเจาะดูข้อมูล ID)
- **Input Validation**: ข้อมูลนำเข้าทั้งหมดถูกตรวจสอบโครงสร้างผ่าน Zod schemas (`lib/validation/`) ป้องกันข้อมูลผิดปกติ
- **Rate Limiting**: มีระบบจำกัดความถี่การยิง API ผ่านตารางฐานข้อมูล Postgres `rate_limits` ตอบกลับเป็น HTTP 429 พร้อม header `Retry-After`
- **Security Headers & Error Pages**: มีการฝัง HTTP Security Headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`) และหน้า Error / 404 สไตล์ Botanical Luxury
- **PDPA Compliance (พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562)**:
  - หน้านโยบายความเป็นส่วนตัวสองภาษา `/privacy` (TH/EN) และข้อกำหนดการใช้งาน `/terms`
  - สิทธิขอรับข้อมูล (Data Portability): `GET /api/account/export` เพื่อดาวน์โหลดข้อมูลในรูปแบบ JSON
  - สิทธิขอให้ลบข้อมูล (Right to Erasure): `POST /api/account/delete` พร้อมปุ่ม "ล้างข้อมูลในเครื่องนี้" ในหน้า `/garden`
- *สิ่งที่ยังอยู่ใน Roadmap ถัดไป:* LINE Login (F02), ระบบแจ้งเตือนทางไลน์ (F03)

---

## 7. ทางเลือกอื่น

### Neon
ใช้ pooled connection string (`-pooler` ใน host) เป็น `DATABASE_URL` ได้ทันที ขั้นตอนอื่นเหมือนกัน

### Docker (self-host / VPS)
```bash
docker compose up -d --build          # Next.js + Postgres 16
docker build -t tree-for-life . && docker run -p 3000:3000 -e DATABASE_URL=... -e ADMIN_PASSWORD=... tree-for-life
```
`next start` ถือเป็น production → ต้องตั้ง `ADMIN_PASSWORD` ไม่อย่างนั้นหลังบ้านถูกปิด

---

## 8. FAQ

**เปิดเว็บครั้งแรกช้า?** Cold start ของ function + ตรวจ DDL ตอนบูต (~ครั้งเดียวต่อ instance) · Supabase free ที่ถูก pause ต้องกด restore ใน dashboard

**Guest ข้อมูลหายไหม?** ผูกกับ `guest_token` ใน `localStorage` ของเครื่องนั้น — ล้างเบราว์เซอร์ = หาย จนกว่าจะมี LINE Login (F02)

**ปุ่มถามร้านเสียเงินไหม?** ไม่ — เป็นลิงก์เปิดแชท LINE OA ฝั่งผู้ใช้ ไม่ใช้โควตาข้อความของร้าน
