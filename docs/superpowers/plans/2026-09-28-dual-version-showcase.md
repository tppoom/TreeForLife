# Dual-Version Architecture & All-Phases Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a dual-mode system (`NEXT_PUBLIC_APP_MODE=production | demo`) on TreeForLife to cleanly separate Phase 1 Production (Guest-first, clean UI, no mock switcher) from an All-Phases Prototype Showcase Hub (`/demo`) with interactive mock prototypes for Phase 2 AI and Phase 3 features, backed by semantic versioning and Git release tags.

**Architecture:** A single-codebase multi-mode architecture driven by `lib/config/app-mode.ts`. In production mode (`treeforlife-app`), all demo switchers and mock artifacts are omitted, and `/demo` safely redirects to `/`. In demo mode (`treeforlife-demo`), a top announcement banner and header link direct users to the `/demo` Showcase Hub, which hosts self-contained interactive mock widgets for AI Plant Doctor, AI Garden Corner Designer, 24/7 AI Assistant, Budget Recommender, Landscape Quotes, Community Board, Member Points, and Shop Demand Analytics.

**Tech Stack:** Next.js 15.1.12 (App Router), React 19.0.8, TypeScript 5.7, Tailwind CSS 3.4, Lucide React 0.469, Vitest 2.1.8.

**Spec:** [`docs/superpowers/specs/2026-09-28-dual-version-showcase-design.md`](../specs/2026-09-28-dual-version-showcase-design.md)

## Global Constraints
- Target repository: `tppoom/TreeForLife` (`/Users/tppoom/Desktop/Projects/TreeForLife`). Do not modify `tree-for-life`.
- Do not break existing 162 automated tests or Phase 1 user flows.
- Production mode MUST NEVER display demo switchers ("คุณนุ่น / สมชาย / แอดมิน") or mock banners.
- All interactive prototypes in `/demo` must run purely in client state with zero external AI API keys or network costs.
- Bilingual support (`th` / `en`) and botanical dark mode styling (#faf8f5 / #0b1a13) must be preserved across all new screens.

---

### Task 1: App Mode Configuration & Helper

**Files:**
- Create: `lib/config/app-mode.ts`
- Test: `test/app-mode.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type AppMode = "production" | "demo";
  export function getAppMode(): AppMode;
  export function isDemoMode(): boolean;
  export function isProductionMode(): boolean;
  ```

- [x] **Step 1: Write failing unit test for app-mode helper**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement minimal code in `lib/config/app-mode.ts`**
- [x] **Step 4: Run test to verify it passes**
- [x] **Step 5: Commit**

```bash
git add lib/config/app-mode.ts test/app-mode.test.ts
git commit -m "feat(config): add app-mode environment helper"
```

---

### Task 2: Gate RoleSwitcher & Add Demo Navbar Banner

**Files:**
- Modify: `components/layout/Navbar.tsx`
- Modify: `components/admin/AdminDashboardClient.tsx`
- Test: `test/role-switcher-gating.test.tsx`

**Interfaces:**
- Consumes: `isDemoMode()` from `lib/config/app-mode.ts`
- Produces: Navbar that hides the demo role dropdown in production mode, and displays "🌟 Showcase Hub" banner & nav button in demo mode.

- [x] **Step 1: Write test for role switcher gating and demo banner**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Modify `components/layout/Navbar.tsx` and `components/admin/AdminDashboardClient.tsx`**
- [x] **Step 4: Run test to verify it passes**
- [x] **Step 5: Run existing tests to ensure no regressions**
- [x] **Step 6: Commit**

```bash
git add components/layout/Navbar.tsx components/admin/AdminDashboardClient.tsx test/role-switcher-gating.test.tsx
git commit -m "feat(ui): gate role switcher behind demo mode and add showcase banner"
```

---

### Task 3: Showcase Hub Scaffold & Route Guarding

**Files:**
- Create: `app/demo/page.tsx`
- Create: `components/demo/ShowcaseHero.tsx`
- Test: `test/demo-route-guard.test.tsx`

**Interfaces:**
- Consumes: `isProductionMode()` from `lib/config/app-mode.ts`
- Produces: `/demo` page that redirects to `/` in production mode and renders the showcase hero & navigation tabs in demo mode.

- [x] **Step 1: Write test for `/demo` route guarding and hero rendering**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement `components/demo/ShowcaseHero.tsx` and `app/demo/page.tsx`**
- [x] **Step 4: Run test to verify it passes**
- [x] **Step 5: Commit**

```bash
git add app/demo/page.tsx components/demo/ShowcaseHero.tsx test/demo-route-guard.test.tsx
git commit -m "feat(demo): scaffold showcase hub page and hero component"
```

---

### Task 4: Phase 2 AI Interactive Prototypes

**Files:**
- Create: `components/demo/PlantDoctorPrototype.tsx`
- Create: `components/demo/GardenDesignerPrototype.tsx`
- Create: `components/demo/AssistantChatPrototype.tsx`
- Create: `components/demo/BudgetRecommenderPrototype.tsx`
- Test: `test/phase2-prototypes.test.tsx`

**Interfaces:**
- Produces: 4 client components providing interactive simulators for AI Doctor, Garden Designer Before/After, AI Chat, and Budget Calculator.

- [x] **Step 1: Write test for Phase 2 prototypes**

```tsx
// test/phase2-prototypes.test.tsx
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PlantDoctorPrototype } from "../components/demo/PlantDoctorPrototype";
import { BudgetRecommenderPrototype } from "../components/demo/BudgetRecommenderPrototype";

describe("Phase 2 AI Prototypes", () => {
  it("Plant Doctor diagnoses preset leaf problems", async () => {
    render(<PlantDoctorPrototype />);
    expect(screen.getByText(/หมอต้นไม้/i)).toBeDefined();

    const diagnoseBtn = screen.getByRole("button", { name: /วิเคราะห์อาการ/i });
    fireEvent.click(diagnoseBtn);

    // Should display diagnosis result card after analysis
    await waitFor(() => {
      expect(screen.getByText(/ผลการวินิจฉัย/i)).toBeDefined();
    });
  });

  it("Budget Recommender calculates curated bundle according to budget slider", () => {
    render(<BudgetRecommenderPrototype />);
    expect(screen.getByText(/โหมดงบเท่านี้/i)).toBeDefined();

    // Budget slider should be present and have default value
    const slider = screen.getByRole("slider");
    expect(slider).toBeDefined();
    expect(screen.getByText(/รวมงบประมาณ/i)).toBeDefined();
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/phase2-prototypes.test.tsx`
Expected: FAIL (Cannot find modules)

- [x] **Step 3: Implement the 4 Phase 2 prototype components**

1. `components/demo/PlantDoctorPrototype.tsx`:
   - Preset selector: "มอนสเตอร่า ใบเหลือง", "ยางอินเดีย ขอบใบไหม้", "ไทรใบสัก จุดดำ".
   - Diagnostic analysis state with realistic scanning animation.
   - Structured diagnostic card: Cause, Severity badge, 3-step action plan, Recommended organic treatment.

2. `components/demo/GardenDesignerPrototype.tsx`:
   - Interactive Before/After slider.
   - Room switcher: "มุมข้างโซฟาห้องนั่งเล่น" vs "ระเบียงรับแดดบ่าย".
   - Plant switcher: "มอนสเตอร่าด่าง" vs "ไทรใบสัก" vs "ลิ้นมังกร".
   - Environmental suitability rating card (Light % match, recommended pot size).

3. `components/demo/AssistantChatPrototype.tsx`:
   - Interactive chat simulator.
   - Clickable quick prompt chips:
     - "ห้องแอร์เปิดทั้งคืน ปลูกต้นอะไรดี?"
     - "สูตรผสมดินโปร่งสำหรับมอนสเตอร่า?"
     - "รดน้ำแล้วน้ำขังจานรองทำยังไง?"
   - Instant response with botanical reasoning and shop species recommendation.

4. `components/demo/BudgetRecommenderPrototype.tsx`:
   - Range slider for budget (500฿ - 5,000฿).
   - Style filter pills (Minimal, Tropical Cafe, Air Purifier).
   - Dynamic plant bundle listing showing exact species, individual prices, total price, and placement tips.

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/phase2-prototypes.test.tsx`
Expected: PASS (2 tests passed)

- [x] **Step 5: Commit**

```bash
git add components/demo/PlantDoctorPrototype.tsx components/demo/GardenDesignerPrototype.tsx components/demo/AssistantChatPrototype.tsx components/demo/BudgetRecommenderPrototype.tsx test/phase2-prototypes.test.tsx
git commit -m "feat(demo): add Phase 2 AI interactive prototype components"
```

---

### Task 5: Phase 3 Platform, Community & Scale Prototypes

**Files:**
- Create: `components/demo/QuoteRequestPrototype.tsx`
- Create: `components/demo/CommunityBoardPrototype.tsx`
- Create: `components/demo/MemberPointsPrototype.tsx`
- Create: `components/demo/ShopAnalyticsPrototype.tsx`
- Test: `test/phase3-prototypes.test.tsx`

**Interfaces:**
- Produces: 4 client components providing interactive simulators for Landscape Quotes, Community Board, Loyalty Points, and Shop Insights.

- [x] **Step 1: Write test for Phase 3 prototypes**

```tsx
// test/phase3-prototypes.test.tsx
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuoteRequestPrototype } from "../components/demo/QuoteRequestPrototype";
import { MemberPointsPrototype } from "../components/demo/MemberPointsPrototype";

describe("Phase 3 Platform Prototypes", () => {
  it("Quote Request generates preliminary estimate", () => {
    render(<QuoteRequestPrototype />);
    expect(screen.getByText(/ขอใบเสนอราคาจัดสวน/i)).toBeDefined();

    const generateBtn = screen.getByRole("button", { name: /ประเมินราคา/i });
    fireEvent.click(generateBtn);

    expect(screen.getByText(/ใบเสนอราคาเบื้องต้น/i)).toBeDefined();
    expect(screen.getByText(/ค่าพันธุ์ไม้/i)).toBeDefined();
  });

  it("Member Points prototype shows loyalty streak and redeemable rewards", () => {
    render(<MemberPointsPrototype />);
    expect(screen.getByText(/แต้มสะสม/i)).toBeDefined();
    expect(screen.getByText(/350 แต้ม/i)).toBeDefined();
    expect(screen.getByText(/ของรางวัลที่แลกได้/i)).toBeDefined();
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/phase3-prototypes.test.tsx`
Expected: FAIL (Cannot find modules)

- [x] **Step 3: Implement the 4 Phase 3 prototype components**

1. `components/demo/QuoteRequestPrototype.tsx`:
   - Interactive fields: Area size (sqm), sunlight exposure, preferred garden style.
   - "ประเมินราคา" button producing a realistic estimate breakdown (plants, soil prep, labor, 30-day warranty) + LINE handoff simulation.

2. `components/demo/CommunityBoardPrototype.tsx`:
   - Feed cards with growth milestones, before-after photos, and care tips.
   - Interactive like button with live counter increments and comment box.

3. `components/demo/MemberPointsPrototype.tsx`:
   - Botanical loyalty card design: Streak counter (14 consecutive watering days), point balance (350 points).
   - Redeemable rewards list (Terracotta pot 6", organic fertilizer pellet pack, 15% discount).

4. `components/demo/ShopAnalyticsPrototype.tsx`:
   - Visual bar chart of top 5 trending plants of the month.
   - "Search Misses" table highlighting top searches with zero results to guide stock procurement.

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/phase3-prototypes.test.tsx`
Expected: PASS (2 tests passed)

- [x] **Step 5: Commit**

```bash
git add components/demo/QuoteRequestPrototype.tsx components/demo/CommunityBoardPrototype.tsx components/demo/MemberPointsPrototype.tsx components/demo/ShopAnalyticsPrototype.tsx test/phase3-prototypes.test.tsx
git commit -m "feat(demo): add Phase 3 platform & community prototype components"
```

---

### Task 6: Assemble Showcase Hub with Phase 1 Recap

**Files:**
- Create: `components/demo/Phase1Recap.tsx`
- Modify: `app/demo/page.tsx`
- Test: `test/showcase-hub-integration.test.tsx`

**Interfaces:**
- Consumes: All prototype components from Tasks 3, 4, 5
- Produces: The fully assembled Showcase Hub page at `/demo`.

- [x] **Step 1: Write integration test for the complete Showcase Hub**

```tsx
// test/showcase-hub-integration.test.tsx
import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppProvider } from "../lib/context/AppContext";
import DemoPage from "../app/demo/page";

describe("Showcase Hub Integration", () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_MODE;

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_MODE = originalEnv;
  });

  it("renders all phases when activeTab is 'all'", () => {
    process.env.NEXT_PUBLIC_APP_MODE = "demo";
    render(
      <AppProvider>
        <DemoPage />
      </AppProvider>
    );

    // Phase 1 recap
    expect(screen.getByText(/Phase 1: ระบบหลักที่พร้อมใช้งานจริง/i)).toBeDefined();
    // Phase 2 prototypes
    expect(screen.getByText(/Phase 2: ฟีเจอร์ AI อัจฉริยะ/i)).toBeDefined();
    expect(screen.getByText(/หมอต้นไม้/i)).toBeDefined();
    expect(screen.getByText(/ออกแบบมุมสวน/i)).toBeDefined();
    // Phase 3 prototypes
    expect(screen.getByText(/Phase 3: ชุมชนและการเติบโต/i)).toBeDefined();
    expect(screen.getByText(/ขอใบเสนอราคาจัดสวน/i)).toBeDefined();
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/showcase-hub-integration.test.tsx`
Expected: FAIL

- [x] **Step 3: Implement `components/demo/Phase1Recap.tsx` and integrate into `app/demo/page.tsx`**

`components/demo/Phase1Recap.tsx`:
- Render 4 cards highlighting working Phase 1 capabilities with direct link buttons:
  - 🌿 คลัง 30 พันธุ์ไม้ (Link to `/plants`)
  - 🏡 สวนของฉันและสูตรคำนวณ 3 ฤดู (Link to `/garden`)
  - 📅 งานดูแลประจำวัน (Link to `/today`)
  - 💬 ระบบส่งต่อ LINE OA (Open Inquiry Modal)

In `app/demo/page.tsx`:
- Mount `Phase1Recap`, Phase 2 prototypes (`PlantDoctorPrototype`, `GardenDesignerPrototype`, `AssistantChatPrototype`, `BudgetRecommenderPrototype`), and Phase 3 prototypes (`QuoteRequestPrototype`, `CommunityBoardPrototype`, `MemberPointsPrototype`, `ShopAnalyticsPrototype`).
- Filter displayed sections based on `activeTab`.

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/showcase-hub-integration.test.tsx`
Expected: PASS

- [x] **Step 5: Run full test suite**

Run: `npm test`
Expected: PASS (All test files pass)

- [x] **Step 6: Commit**

```bash
git add components/demo/Phase1Recap.tsx app/demo/page.tsx test/showcase-hub-integration.test.tsx
git commit -m "feat(demo): assemble all phases in showcase hub"
```

---

### Task 7: Quality Verification, Documentation & Semantic Versioning Release

**Files:**
- Modify: `package.json` (bump version to `1.0.0`)
- Modify: `docs/DEPLOYMENT.md` (add dual-mode environment documentation)
- Modify: `README.md` (add Showcase Hub instructions)

**Release Tags:**
- Tag: `v1.0.0-phase1-prod`
- Tag: `v1.1.0-all-phases-demo`

- [x] **Step 1: Update documentation and bump version**

In `package.json`:
- Bump `"version": "1.0.0"`

In `docs/DEPLOYMENT.md`:
- Add section explaining `NEXT_PUBLIC_APP_MODE`:
  - `treeforlife-app.vercel.app` uses `NEXT_PUBLIC_APP_MODE=production` (Clean Phase 1, guest-first, basic auth admin).
  - `treeforlife-demo.vercel.app` uses `NEXT_PUBLIC_APP_MODE=demo` (Includes `/demo` Showcase Hub and demo role switcher).

- [x] **Step 2: Run full build and test verification**

Run: `npm run build`
Expected: Build succeeds with 0 TypeScript/ESLint errors and all routes compiled.

Run: `npm test`
Expected: 100% tests passing across all suites.

- [x] **Step 3: Commit and Create Git Release Tags**

```bash
git add package.json docs/DEPLOYMENT.md README.md
git commit -m "chore(release): bump version to 1.0.0 with dual-version support"

# Tag Phase 1 Production Ready
git tag -a v1.0.0-phase1-prod -m "Release v1.0.0: TreeForLife Phase 1 Production Ready (Guest-First, Clean UI, Basic Auth)"

# Tag All-Phases Prototype Demo
git tag -a v1.1.0-all-phases-demo -m "Release v1.1.0: TreeForLife All-Phases Prototype Showcase Hub (Interactive Phase 1, 2, 3 Mock)"
```

- [x] **Step 4: Push to GitHub with tags**

```bash
git push origin main --tags
```
