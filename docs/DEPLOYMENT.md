# 🚀 TreeForLife — Production Deployment Guide (Phase 1)
คู่มือการ Deploy แพลตฟอร์ม TreeForLife สู่ Production แบบฟรี 100% ตลอดชีพ (Free Forever)

---

## 1. ภาพรวมสถาปัตยกรรม (Architecture Overview)

TreeForLife ถูกออกแบบมาให้พร้อมสำหรับการทำงานทั้งแบบ **Local Standalone** และ **Cloud Serverless**:

```
[ ผู้ใช้งาน / Mobile / Desktop ]
              │
              ▼ (HTTPS / Custom Domain)
    ┌───────────────────┐
    │  Vercel Edge/App  │ ── Next.js 15 App Router (Singapore: sin1)
    │  Serverless Lambdas│ ── Drizzle ORM + Connection Pooling
    └───────────────────┘
              │
              ▼ (DATABASE_URL with SSL)
    ┌───────────────────┐
    │  Neon PostgreSQL  │ ── Serverless Postgres (Scale-to-Zero, 500MB Free)
    │  (or Supabase)    │ ── Auto DDL Migration + 30 Curated Species Auto-Seed
    └───────────────────┘
```

### จุดเด่นด้านความพร้อมขึ้น Production:
1. **Dual Database Engine**:
   - ถ้าไม่มี `DATABASE_URL`: ใช้ Local PGlite (WASM) ใน `.data/pglite/` อัตโนมัติ (เหมาะสำหรับการพัฒนาในเครื่อง)
   - ถ้ามี `DATABASE_URL`: สลับไปใช้ `pg` (node-postgres) + Drizzle ORM ทันที พร้อม Connection Pooling
2. **Advisory Lock Concurrency Guard**:
   - ป้องกันปัญหา Serverless Lambdas หลายตัวแย่งกัน Seed ข้อมูลตอนเปิดเว็บครั้งแรกด้วย `pg_try_advisory_lock`
3. **100% Free Tier Compliant**:
   - ไม่เกินโควต้าฟรีของ Vercel (100GB Bandwidth/เดือน)
   - ไม่เกินโควต้าฟรีของ Neon/Supabase (500MB Storage ฟรีตลอดชีพ)
   - ไม่ต้องผูกบัตรเครดิต

---

## 2. วิธีที่ 1: Deploy บน Vercel + Neon PostgreSQL (แนะนำที่สุด) ⭐

ใช้เวลาติดตั้งไม่เกิน **5 นาที** และดูแลรักษาง่ายที่สุด

### ขั้นตอนที่ 1: สร้าง Database บน Neon
1. เข้าไปที่ [https://neon.tech](https://neon.tech) และล็อกอินผ่าน GitHub
2. กด **Create Project**
   - **Project Name:** `treeforlife`
   - **Region:** `Asia Pacific (Singapore)` (`ap-southeast-1`) — เพื่อให้เชื่อมต่อได้เร็วที่สุดจากไทย
3. ในหน้า Dashboard ให้เลือก Connection Type เป็น **Pooled connection**
4. ก๊อปปี้ **Connection string** เก็บไว้ เช่น:
   ```env
   postgresql://neondb_owner:npg_xxxx@ep-cool-forest-123456-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

### ขั้นตอนที่ 2: Deploy ขึ้น Vercel
1. Push โค้ดโปรเจกต์นี้ขึ้น GitHub Repository ของคุณ
2. เข้าไปที่ [https://vercel.com](https://vercel.com) แล้วกด **Add New... > Project**
3. เลือก Repository `TreeForLife` ที่เพิ่ง Push ขึ้นไป
4. ในส่วน **Environment Variables** ให้เพิ่ม 2 ค่า:
   - `DATABASE_URL` = *(Connection String ที่ได้จาก Neon)*
   - `NEXT_PUBLIC_SITE_URL` = `https://your-project-name.vercel.app` *(หรือใส่โดเมนจริงของคุณ)*
5. กดปุ่ม **Deploy**
6. รอประมาณ 60–90 วินาที ระบบจะ Build และ Deploy สำเร็จทันที!

> 💡 **หมายเหตุ:** ในการเปิดเว็บครั้งแรก ระบบจะตรวจพบว่า Database ยังว่างอยู่ และจะทำการรัน DDL Schema พร้อมบรรจุข้อมูลต้นไม้ทั้ง 30 ชนิดพร้อมระบบดูแลเข้าฐานข้อมูลให้โดยอัตโนมัติ 100%

---

## 3. วิธีที่ 2: Deploy บน Vercel + Supabase

หากคุณมีบัญชี [Supabase](https://supabase.com) อยู่แล้ว:
1. สร้างโปรเจกต์ใหม่บน Supabase เลือก Region เป็น **Singapore**
2. ไปที่ **Project Settings > Database > Connection string**
3. เลือกโหมด **Transaction Pooler (Port 6543)** หรือ **Session Pooler (Port 5432)**
4. นำ Connection URI มาใส่ใน Environment Variable `DATABASE_URL` บน Vercel เช่นเดียวกับวิธีที่ 1

---

## 4. วิธีที่ 3: Deploy ด้วย Docker Container (Self-hosted / VPS / Cloud Run)

หากต้องการรันบน VPS ส่วนตัว (เช่น DigitalOcean, Hetzner, AWS EC2) หรือบริการ Container:

### รัน Full-Stack ด้วย Docker Compose (Next.js + PostgreSQL 16)
```bash
# สั่งสตาร์ททั้ง App และ PostgreSQL
docker compose up -d --build

# ดู Log การทำงาน
docker compose logs -f app
```
ระบบจะเปิดใช้งานที่ `http://localhost:3000` โดยมี PostgreSQL แยก Volume พร้อมใช้งานทันที

### Build Docker Image เดี่ยว
```bash
docker build -t tree-for-life:latest .
docker run -p 3000:3000 -e DATABASE_URL="postgres://..." tree-for-life:latest
```

---

## 5. ตรวจสอบความพร้อมก่อน Deploy (Pre-flight Checklist)

ก่อนกด Deploy คุณสามารถรันคำสั่งตรวจสอบความสมบูรณ์ทั้งหมดได้ในคำสั่งเดียว:

```bash
# 1. รันการทดสอบ Unit Tests ทั้ง 158 ข้อ
npm run test

# 2. รันการทดสอบ E2E Playwright ทั้ง 6 Flow
npm run test:e2e

# 3. รัน Type Check
npx tsc --noEmit

# 4. รัน Production Build ในเครื่องเพื่อทดสอบ SSG/SSR
npm run build

# 5. ทดสอบการเชื่อมต่อและ Seed Database
DATABASE_URL="<your-connection-string>" npm run db:setup
```

---

## 6. รายการ Environment Variables ทั้งหมด

| ตัวแปร | จำเป็นไหม? | ค่าเริ่มต้น | รายละเอียด |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | แนะนำ | *(ว่าง = ใช้ PGlite)* | Connection URI ของ PostgreSQL เช่น Neon หรือ Supabase |
| `NEXT_PUBLIC_SITE_URL` | แนะนำ | `http://localhost:3000` | URL หลักของเว็บ สำหรับ SEO Structured Data และ OpenGraph |
| `DB_POOL_MAX` | ไม่ | `10` | จำนวน Connection สูงสุดต่อ Lambda instance (สำหรับ Serverless) |
| `PORT` | ไม่ | `3000` | พอร์ตสำหรับ HTTP Server |

---

## 7. คำถามที่พบบ่อยและข้อควรระวัง (Production FAQs)

#### Q: การเข้าเว็บครั้งแรกของวันทำไมโหลดนานประมาณ 1-2 วินาที?
- **ตอบ:** เป็นพฤติกรรมปกติของ Neon Free Tier (Scale-to-Zero) ที่จะพักการทำงานเมื่อไม่มีการเรียกใช้เกิน 5 นาที เพื่อไม่ให้เสียโควต้า หลังจากตื่นแล้ว คำสั่งต่อๆ ไปจะตอบสนองรวดเร็วปกติ (<50ms)

#### Q: ลูกค้าที่เข้าใช้งานแบบ Guest (ไม่ได้ล็อกอิน) ข้อมูลจะหายไหม?
- **ตอบ:** ไม่หายครับ ข้อมูลสวนของ Guest จะถูกผูกด้วย UUID Guest Token ไว้ใน `localStorage` ของอุปกรณ์นั้นๆ ตลอดไป และเมื่อใดที่ลูกค้าลงทะเบียนหรือสลับบทบาท ระบบมีฟังก์ชัน Automatic Guest Migration ย้ายข้อมูลต้นไม้ทั้งหมดเข้าบัญชีให้อัตโนมัติ

#### Q: การแชทผ่าน LINE เสียค่าบริการไหม?
- **ตอบ:** การกดส่งข้อความเปิดแชท 1 ต่อ 1 ผ่าน LINE Official Account ของร้าน (Deep Link + QR Code) เป็นบริการฟรี 100% ไม่มีค่าใช้จ่ายจาก LINE
