# TreeForLife — Deployment Guide

> Production stack: **Vercel (Next.js, region `sin1`) + Supabase Postgres (Singapore)**
> ทางเลือกอื่น (Neon, Docker) อยู่ท้ายเอกสาร · ภาพรวมการตัดสินใจอยู่ใน [`ROADMAP.md` §5](./ROADMAP.md)

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
| `NEXT_PUBLIC_SITE_URL` | ✅ | sitemap, robots, OG | เช่น `https://tree-for-life.vercel.app` หรือโดเมนจริง |
| `NEXT_PUBLIC_LINE_OA_ID` | ✅ | ปุ่มถามร้าน | ID ของ LINE OA **ไม่ต้องมี `@`** (โค้ดเติมให้ในลิงก์) |
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
5. Free plan จะ **pause project เมื่อไม่มีการใช้งาน ~7 วัน** — ก่อนมี cron (F03) ให้ตั้ง uptime monitor ฟรี (เช่น UptimeRobot) ยิงหน้าแรกวันละครั้ง

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
```

### 4.1 Deploy อัตโนมัติจาก GitHub
เชื่อม repo ใน Vercel → **Settings → Git** → ทุก push ไป `main` = production, ทุก PR = preview
Preview ใช้ `DATABASE_URL` ของ preview (แนะนำ Supabase branch หรือ project แยก) — **อย่าให้ preview ชี้ DB production**

---

## 5. Pre-flight checklist

- [ ] `make verify` ผ่าน (typecheck + 158 tests + build)
- [ ] `DATABASE_URL` ชี้ project ที่ถูกต้อง (ไม่ใช่ของแอปอื่น)
- [ ] `ADMIN_PASSWORD` ตั้งแล้ว และเข้า `/admin` ได้
- [ ] `NEXT_PUBLIC_LINE_OA_ID` เป็น OA จริงของร้าน (ลองกดถามร้านบนมือถือ)
- [ ] `NEXT_PUBLIC_SITE_URL` ตรงกับโดเมนที่ใช้จริง
- [ ] ⚠️ Vercel Hobby ใช้ได้เฉพาะงานส่วนตัว/ไม่ใช่เชิงพาณิชย์ — เปิดใช้กับลูกค้าจริงให้ย้ายเป็น Pro

---

## 6. ข้อจำกัดที่ต้องรู้ของเวอร์ชันปัจจุบัน

ระบบที่ deploy อยู่คือ **Phase 1 เวอร์ชันเดโม** — ดูรายการเต็มใน [`ROADMAP.md` §1](./ROADMAP.md):
- role switcher ในเมนูยังเป็นของเดโม (หลังบ้านจริงป้องกันด้วย `ADMIN_PASSWORD` แล้ว)
- API สวนของฉันยังไม่ตรวจ ownership → แก้ใน F00 ก่อนโปรโมตกับลูกค้าจริง
- ยังไม่มีแจ้งเตือน (F03), ล็อกอิน LINE (F02), หน้านโยบายความเป็นส่วนตัว (F11)
- รูปพันธุ์ยังเป็นรูปชั่วคราวจาก Unsplash (F01)

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
