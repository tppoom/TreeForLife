# TreeForLife — Dual-Version Architecture & All-Phases Showcase Design Spec

- **Author:** TpPoom & Antigravity
- **Date:** 2026-09-28
- **Status:** Approved
- **Target Repository:** `tppoom/TreeForLife` (`/Users/tppoom/Desktop/Projects/TreeForLife`)
- **Reference Docs:** [`docs/SPEC.md`](../SPEC.md), [`docs/ROADMAP.md`](../ROADMAP.md), [`docs/DEPLOYMENT.md`](../DEPLOYMENT.md)

---

## 1. Problem Statement & Objectives

Currently, TreeForLife has Phase 1 deployed on Vercel (`treeforlife-app.vercel.app`), but the deployment contains mock artifacts (such as the floating `DemoUserSwitcher` displaying "คุณนุ่น", "สมชาย", "เจ้าของร้าน") which confuses real production usage. At the same time, stakeholders and family members want to see the full vision of the platform when all phases (Phase 1, Phase 2 AI, and Phase 3 Platform/Community) are completed.

### Core Objectives:
1. **Production Version (`treeforlife-app.vercel.app`)**:
   - Clean, production-ready Phase 1 platform.
   - 100% Guest-First: visitors search, filter, view plants, save to My Garden in browser storage, and contact the shop via LINE OA.
   - Admin dashboard (`/admin`) secured via Basic Auth (`ADMIN_PASSWORD`), without client-side mock role switchers.
   - Zero mock badges, zero confusing switcher widgets.
2. **Demo Showcase Version (`treeforlife-demo.vercel.app`)**:
   - Full-vision prototype demonstrating Phase 1, Phase 2, and Phase 3 in an all-in-one **Showcase Hub** at `/demo`.
   - Rich interactive mock prototypes for AI Plant Doctor, AI Garden Designer, 24/7 AI Assistant, Budget Recommender, Landscape Quotes, Community Board, Member Points, and Shop Insights.
   - Interactive role switcher enabled so viewers can easily inspect both customer and shop-owner views.
3. **Rigorous Git Strategy & Versioning**:
   - Semantic Versioning starting at `v1.0.0` for Phase 1 Production.
   - Explicit Git tags (`v1.0.0-phase1-prod`, `v1.1.0-all-phases-demo`).
   - Clean, maintainable single-branch (`main`) architecture with environment-driven feature gating.

---

## 2. Architecture & Environment Mode Configuration

### 2.1 Mode Configuration
We introduce an explicit environment mode flag: `NEXT_PUBLIC_APP_MODE` (`production` | `demo`), defaulting to `production` if omitted or empty.

```ts
// lib/config/app-mode.ts
export type AppMode = "production" | "demo";

export function getAppMode(): AppMode {
  return process.env.NEXT_PUBLIC_APP_MODE === "demo" ? "demo" : "production";
}

export function isDemoMode(): boolean {
  return getAppMode() === "demo";
}

export function isProductionMode(): boolean {
  return getAppMode() === "production";
}
```

### 2.2 Mode Behavior Comparison

| Feature / UI Surface | Production Mode (`NEXT_PUBLIC_APP_MODE=production`) | Demo Mode (`NEXT_PUBLIC_APP_MODE=demo`) |
|---|---|---|
| **Vercel Target** | `treeforlife-app.vercel.app` | `treeforlife-demo.vercel.app` |
| **Floating Role Switcher** | ❌ **Completely unrendered** | ✅ Rendered for testing role views |
| **Top Announcement Banner** | ❌ None | ✅ "🌟 ดูภาพรวมทุกเฟส (Showcase Hub)" link |
| **Showcase Hub (`/demo`)** | ❌ Redirects to `/` | ✅ Fully accessible interactive hub |
| **Header Navigation** | Home, Catalog, My Garden, Today, Admin | + "🌟 ภาพรวมทุกเฟส (Demo Hub)" button |
| **Admin Protection** | Basic Auth (`ADMIN_PASSWORD`) | Basic Auth or Demo Switcher bypass |

---

## 3. Git Strategy & Release Tagging

### 3.1 Versioning Scheme
Update `package.json` version:
- `v1.0.0`: **Phase 1 Production Release**
  - Git Tag: `v1.0.0-phase1-prod`
  - Tag Annotation: `Release v1.0.0: Phase 1 Production Ready (Guest-First, Clean UI, Basic Auth)`
- `v1.1.0`: **All-Phases Demo Showcase Release**
  - Git Tag: `v1.1.0-all-phases-demo`
  - Tag Annotation: `Release v1.1.0: All-Phases Prototype Showcase Hub (Phase 1, 2, 3 Interactive Mock)`

### 3.2 Branching & Deployment Setup
- **Single Source of Truth (`main`)**:
  - Both Vercel projects build from `main` branch on GitHub (`tppoom/TreeForLife`).
  - `treeforlife-app` (Vercel Project ID `prj_60tqZoC3NjMt4GYW8smAO8UsXs5f`):
    - Environment Variable: `NEXT_PUBLIC_APP_MODE=production`
  - `treeforlife-demo` (New Vercel Project):
    - Environment Variable: `NEXT_PUBLIC_APP_MODE=demo`

---

## 4. Phase 1 Production Clean-Up

1. **Role Switcher Gating**:
   - Modify `components/ui/RoleSwitcher.tsx` and `AppContext.tsx` so that `RoleSwitcher` only renders when `isDemoMode()` is true.
   - In production mode, default user role is always `guest`.
2. **Navbar Polish**:
   - Clean botanical aesthetic without placeholder/demo labels.
   - Maintain full bilingual support (TH / EN) and Dark Mode.
3. **Route Guard for `/demo`**:
   - If a user visits `/demo` in production mode, redirect to `/` to ensure production visitors are not confused.

---

## 5. Showcase Hub (`/demo`) Specification

The Showcase Hub is a standalone, beautifully styled page presenting all phases in an interactive portfolio.

### 5.1 Hero Section
- Title: **🌿 TreeForLife Experience Hub**
- Subtitle: **"ภาพจำลองระบบสมบูรณ์ครบทุกเฟสของแพลตฟอร์มต้นไม้เพื่อชีวิต"**
- Interactive quick-filter tabs: `[ทั้งหมด]`, `[Phase 1: ระบบหลัก]`, `[Phase 2: AI อัจฉริยะ]`, `[Phase 3: ชุมชนและการเติบโต]`

### 5.2 Phase 1: Core Nursery & Smart Care Platform
Showcase cards with direct links into working features:
1. **คลังพันธุ์ไม้เรือนเพาะชำ (30 คัดสรร)**: ลิงก์ตรงไปหน้า `/plants` และตัวกรองละเอียด
2. **สูตรคำนวณการดูแลตามสภาพอากาศไทย 3 ฤดู**: ตัวคูณกระถาง ดิน แสง พร้อมลิงก์ไปหน้า `/garden/add`
3. **แดชบอร์ดงานดูแลประจำวัน**: ลิงก์ไปหน้า `/today` ทดลองกดรดน้ำ/เลื่อนนัด
4. **ระบบส่งต่อ LINE Official Account**: จำลองรหัสอ้างอิง `TFL-XXXX`

### 5.3 Phase 2: AI Plant Care & Spatial Design (Interactive Prototypes)
1. **🩺 หมอต้นไม้ (AI Plant Doctor)**:
   - Preset problem cards:
     - "มอนสเตอร่า — ใบเหลืองและก้านนิ่ม"
     - "ยางอินเดีย — ขอบใบไหม้เป็นวงสีน้ำตาล"
     - "ไทรใบสัก — จุดดำกระจายทั่วใบ"
   - Ability to select a preset or upload custom photo.
   - "วิเคราะห์ด้วย AI" with scanning animation.
   - Structured Result Card:
     - 🔍 *การวินิจฉัย*: อาการรากเน่าจากน้ำขัง (Overwatering Root Rot)
     - ⚠️ *ระดับความรุนแรง*: ปานกลาง (รักษาทันภายใน 7 วัน)
     - 🛠️ *แนวทางแก้ไข 3 ขั้นตอน*: งดน้ำทันที, ตัดรากเน่า, เปลี่ยนดินโปร่งผสมเพอร์ไลต์
     - 🌿 *สูตรธรรมชาติ*: ราดเชื้อราไตรโคเดอร์มาเพื่อยับยั้งเชื้อรา
2. **🏡 ออกแบบมุมสวน (AI Garden Corner Designer)**:
   - Interactive Before / After visual slider.
   - Preset spaces: "มุมห้องนั่งเล่นข้างโซฟา" และ "ระเบียงคอนโดโดนแดดบ่าย"
   - Plant selector: ลองสลับวาง มอนสเตอร่าด่าง (Monstera Albo) vs ไทรใบสัก (Ficus Lyrata)
   - Real-time environmental suitability badge: "ความสว่างเหมาะสม 85% · แนะนำกระถางขนาด 10 นิ้ว"
3. **💬 ผู้ช่วยตอบคำถาม 24 ชม. (AI Assistant Chatbot)**:
   - Chat simulation window.
   - Quick clickable prompt pills:
     - *"ห้องนอนเปิดแอร์ทั้งคืน ปลูกต้นอะไรดี?"*
     - *"ผสมดินปลูกไม้ฟอกอากาศใช้สัดส่วนยังไง?"*
     - *"ใบม้วนตอนบ่ายเป็นสัญญาณอะไรไหม?"*
   - Immediate realistic botanical response with suggested shop plant links.
4. **💰 โหมดงบเท่านี้ (Budget Plant Recommender)**:
   - Interactive Budget Slider: 500฿ ถึง 5,000฿
   - Style filter pills: "มินิมอลโมเดิร์น", "ป่าดิบชื้นในห้อง", "เลี้ยงง่ายไม่ตาย"
   - Curated Plant Bundle Output:
     - รายการต้นไม้พร้อมขนาดกระถาง
     - ราคารายต้นและราคารวมในงบ
     - เหตุผลที่ร้านเลือกจับคู่เซ็ตนี้

### 5.4 Phase 3: Platform, Community & Scale (Interactive Prototypes)
1. **📋 ขอใบเสนอราคาจัดสวน (Landscape Design Quote Request)**:
   - 3-step interactive form: พื้นที่ (ตร.ม.) + แสงแดด + สไตล์สวน
   - Live generated "ใบเสนอราคาเบื้องต้น (Preliminary Estimate Sheet)":
     - ค่าพันธุ์ไม้และวัสดุปลูก
     - ค่าจัดวางและปรับสภาพหน้าดิน
     - ค่ารับประกันดูแล 30 วันแรก
     - ปุ่ม "ส่งใบเสนอราคาเข้า LINE ร้าน"
2. **👥 ชุมชนคนรักต้นไม้ (Community Board)**:
   - Mock Community Feed cards:
     - ภาพการเติบโต 6 เดือน (Growth Milestone)
     - ถามปัญหาพร้อมคำตอบจากเพื่อนสมาชิก
     - Interactive like & comment counters
3. **🎁 แต้มสะสม & สิทธิพิเศษ (Care Streaks & Loyalty Points)**:
   - Member Card mockup: "คุณสะสม 350 แต้ม (Streak ดูแลต้นไม้ 14 วันติดต่อกัน)"
   - Rewards Catalog: แลกรับกระถางดินเผา 6", ปุ๋ยอินทรีย์อัดเม็ด, ส่วนลด 15%
4. **📊 สถิติความต้องการของร้าน (Shop Demand Analytics)**:
   - Visual bar chart: พันธุ์ไม้ที่มีคนค้นหามากที่สุดประจำเดือน
   - "Search Misses Board": คำค้นหาที่ยังไม่มีในสต็อก เพื่อช่วยร้านเลือกของเข้าสต็อกรอบถัดไป

---

## 6. Testing & Quality Verification Plan

1. **Unit Testing (`vitest`)**:
   - `test/app-mode.test.ts`: Test `getAppMode()`, `isDemoMode()`, `isProductionMode()` against various env settings.
   - `test/role-switcher.test.ts`: Ensure `RoleSwitcher` does not render when `NEXT_PUBLIC_APP_MODE=production`.
   - `test/demo-route.test.ts`: Ensure `/demo` behaves correctly based on mode.
2. **Build Verification**:
   - Run `npm run build` to confirm zero TypeScript errors and optimal static generation.
   - Confirm all existing 162 unit/integration tests pass without regressions.
3. **Playwright E2E**:
   - Verify Phase 1 production smoke flow (Guest search -> detail -> add to garden -> today tasks).
   - Verify `/demo` interactive widgets respond to user clicks smoothly.

---

## 7. Execution Checklist

- [ ] Task 1: Environment flag helper & config (`lib/config/app-mode.ts`)
- [ ] Task 2: Hide `RoleSwitcher` in production mode and add demo banner in demo mode
- [ ] Task 3: Build the Showcase Hub page (`app/demo/page.tsx`) with all Phase 1-3 interactive prototype components
- [ ] Task 4: Add unit tests for app mode and showcase components
- [ ] Task 5: Run full verification suite (`npm test`, `npm run build`)
- [ ] Task 6: Bump `package.json` version to `1.0.0` and tag `v1.0.0-phase1-prod`
- [ ] Task 7: Tag `v1.1.0-all-phases-demo` and document deployment steps in `docs/DEPLOYMENT.md`
