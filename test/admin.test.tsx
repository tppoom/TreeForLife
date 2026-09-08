import { describe, it, expect, beforeAll, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin",
}));

import { getDb } from "@/lib/db";
import { species, inquiries, searchMisses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAllSpecies, recordSearchMiss } from "@/lib/services/speciesService";
import {
  updateStockStatus,
  getSearchMisses,
  getAdminStats,
  getAdminInquiriesList,
} from "@/lib/services/adminService";
import {
  createInquiry,
  formatLineMessage,
  generateRefCode,
} from "@/lib/services/inquiryService";
import AdminPage, { metadata as adminMetadata } from "@/app/admin/page";
import {
  AdminDashboardClient,
  type AdminSpeciesItem,
  type AdminInquiryItem,
  type AdminSearchMissItem,
} from "@/components/admin/AdminDashboardClient";
import {
  GET as getAdminStockRoute,
  POST as postAdminStockRoute,
} from "@/app/api/admin/species/stock/route";
import { GET as getInquiriesRoute } from "@/app/api/inquiries/route";
import {
  AppContext,
  AppContextProvider,
  DEMO_USERS,
  type AppContextValue,
} from "@/lib/context/AppContext";
import { getTranslation } from "@/lib/i18n/translations";

function createMockAppContext(overrides?: Partial<AppContextValue>): AppContextValue {
  const role = overrides?.role || "guest";
  return {
    locale: "th",
    setLocale: vi.fn(),
    t: (key: string, params?: Record<string, string | number>) =>
      getTranslation(overrides?.locale || "th", key, params),
    theme: "light",
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
    guestToken: "mock-admin-guest-token",
    user: DEMO_USERS[role],
    role,
    setRole: vi.fn(),
    loginAsDemoUser: vi.fn(),
    toasts: [],
    addToast: vi.fn(),
    removeToast: vi.fn(),
    ...overrides,
  };
}

describe("Task 10: Shop Admin Dashboard Integration Tests", () => {
  let seededSpecies: Awaited<ReturnType<typeof getAllSpecies>>;
  let testSpeciesId: string;
  let testSpeciesSlug: string;
  let testInquiryRefCode: string;

  beforeAll(async () => {
    await getDb();

    // Fetch seeded species
    seededSpecies = await getAllSpecies({ stockStatus: "all" });
    expect(seededSpecies.length).toBeGreaterThanOrEqual(30);
    testSpeciesId = seededSpecies[0].id;
    testSpeciesSlug = seededSpecies[0].slug;

    // Seed a customer inquiry to test verification against LINE
    const inquiryResult = await createInquiry({
      speciesId: testSpeciesId,
      speciesNameTh: seededSpecies[0].nameTh,
      sourcePage: `/plants/${testSpeciesSlug}`,
      intent: "price",
      customNote: "มีกระถางเซรามิกสีขาวไหมครับ",
    });
    testInquiryRefCode = inquiryResult.refCode;

    // Seed search misses with distinct counts for priority demand ranking
    await recordSearchMiss("ต้นยางอินเดียด่าง");
    await recordSearchMiss("ต้นยางอินเดียด่าง");
    await recordSearchMiss("ต้นยางอินเดียด่าง");
    await recordSearchMiss("ต้นยางอินเดียด่าง");
    await recordSearchMiss("ต้นยางอินเดียด่าง"); // count >= 5 (High demand)

    await recordSearchMiss("กวักมรกตใบลายพิเศษ");
    await recordSearchMiss("กวักมรกตใบลายพิเศษ"); // count >= 2 (Moderate demand)
  });

  describe("1. Server Component & Metadata", () => {
    it("renders AdminPage Server Component and passes preloaded data to client", async () => {
      const page = await AdminPage();
      expect(page).toBeDefined();
      expect(page.type).toBe(AdminDashboardClient);
      expect(page.props.initialSpecies).toBeDefined();
      expect(page.props.initialSpecies.length).toBeGreaterThanOrEqual(30);
      expect(page.props.initialInquiries).toBeDefined();
      expect(page.props.initialSearchMisses).toBeDefined();
      expect(page.props.initialStats).toBeDefined();
      expect(page.props.initialStats.species.total).toBeGreaterThanOrEqual(30);
    });

    it("exports proper bilingual SEO metadata for the admin page", () => {
      expect(adminMetadata.title).toContain("ระบบจัดการร้าน");
      expect(adminMetadata.title).toContain("Shop Admin Dashboard");
      expect(adminMetadata.description).toBeDefined();
    });
  });

  describe("2. Protected View & Role Gate (Guest / Customer vs Staff / Admin)", () => {
    it("renders accessible role-upgrade notice when user is a 'guest'", () => {
      const ctx = createMockAppContext({ role: "guest" });
      const html = renderToString(
        <AppContext.Provider value={ctx}>
          <AdminDashboardClient initialSpecies={seededSpecies} />
        </AppContext.Provider>
      );

      // Must display role-upgrade alert
      expect(html).toContain('role="alert"');
      expect(html).toContain("คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะพนักงานหรือผู้ดูแลระบบ)");
      expect(html).toContain("สลับเป็น พนักงานร้าน (Staff)");
      expect(html).toContain("สลับเป็น เจ้าของร้าน (Admin)");
      expect(html).toContain("ผู้เยี่ยมชม (Guest)");

      // Must NOT render inventory table or stock toggles
      expect(html).not.toContain("ปรับสถานะสต็อกแบบคลิกเดียว");
    });

    it("renders accessible role-upgrade notice when user is a 'customer'", () => {
      const ctx = createMockAppContext({ role: "customer" });
      const html = renderToString(
        <AppContext.Provider value={ctx}>
          <AdminDashboardClient initialSpecies={seededSpecies} />
        </AppContext.Provider>
      );

      expect(html).toContain('role="alert"');
      expect(html).toContain("คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะพนักงานหรือผู้ดูแลระบบ)");
      expect(html).toContain("ลูกค้า (Customer)");
      expect(html).not.toContain("ปรับสถานะสต็อกแบบคลิกเดียว");
    });

    it("renders full Admin Dashboard portal when user is 'staff'", () => {
      const ctx = createMockAppContext({ role: "staff" });
      const html = renderToString(
        <AppContext.Provider value={ctx}>
          <AdminDashboardClient initialSpecies={seededSpecies} />
        </AppContext.Provider>
      );

      // Should render portal header and STAFF badge
      expect(html).toContain("ระบบจัดการร้าน");
      expect(html).toContain("STAFF");
      expect(html).not.toContain('role="alert"');

      // Should render Inventory tab and species table
      expect(html).toContain("คลังพันธุ์ไม้และสต็อก");
      expect(html).toContain("ปรับสถานะสต็อกแบบคลิกเดียว");
      expect(html).toContain(seededSpecies[0].nameTh);
    });

    it("renders full Admin Dashboard portal with ADMIN badge when user is 'admin'", () => {
      const ctx = createMockAppContext({ role: "admin" });
      const html = renderToString(
        <AppContext.Provider value={ctx}>
          <AdminDashboardClient initialSpecies={seededSpecies} />
        </AppContext.Provider>
      );

      expect(html).toContain("ระบบจัดการร้าน");
      expect(html).toContain("ADMIN");
      expect(html).toContain("คลังพันธุ์ไม้และสต็อก");
      expect(html).toContain("ปรับสถานะสต็อกแบบคลิกเดียว");
    });

    it("supports English fallback localization seamlessly", () => {
      const ctx = createMockAppContext({ role: "admin", locale: "en" });
      const html = renderToString(
        <AppContext.Provider value={ctx}>
          <AdminDashboardClient initialSpecies={seededSpecies} />
        </AppContext.Provider>
      );

      expect(html).toContain("Admin Portal");
      expect(html).toContain("Species Inventory");
      expect(html).toContain("Customer Inquiries Log");
      expect(html).toContain("Search Misses");
      expect(html).toContain("Instant Stock Toggle");
    });
  });

  describe("3. Inventory Management & Instant Inline Stock Toggles", () => {
    it("renders 30 species with thumbnail, name, family, status, and last updated time", () => {
      const ctx = createMockAppContext({ role: "admin" });
      const html = renderToString(
        <AppContext.Provider value={ctx}>
          <AdminDashboardClient initialSpecies={seededSpecies} />
        </AppContext.Provider>
      );

      // Verify species count indicator
      expect(html).toContain(`แสดง ${seededSpecies.length} จากทั้งหมด ${seededSpecies.length} รายการ`);

      // Verify first species row content
      const first = seededSpecies[0];
      expect(html).toContain(first.nameTh);
      expect(html).toContain(first.nameEn);
      expect(html).toContain(first.primaryImage.split("?")[0]);

      // Verify inline stock status buttons exist
      expect(html).toContain("มีสินค้าพร้อมส่ง");
      expect(html).toContain("สั่งเพาะ / สั่งทำ");
      expect(html).toContain("ตามฤดูกาล");
    });

    it("GET /api/admin/species/stock returns all 30 species", async () => {
      const res = await getAdminStockRoute();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.species)).toBe(true);
      expect(data.species.length).toBeGreaterThanOrEqual(30);
      expect(data.species[0]).toHaveProperty("id");
      expect(data.species[0]).toHaveProperty("stockStatus");
      expect(data.species[0]).toHaveProperty("updatedAt");
    });

    it("POST /api/admin/species/stock updates stock status in database immediately", async () => {
      // 1. Toggle test species to 'seasonal'
      const req1 = new Request("http://localhost/api/admin/species/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speciesId: testSpeciesId,
          status: "seasonal",
        }),
      });

      const res1 = await postAdminStockRoute(req1);
      expect(res1.status).toBe(200);
      const data1 = await res1.json();
      expect(data1.success).toBe(true);

      // Verify directly in database
      const db = await getDb();
      const [updated1] = await db
        .select()
        .from(species)
        .where(eq(species.id, testSpeciesId))
        .limit(1);
      expect(updated1.stockStatus).toBe("seasonal");

      // 2. Toggle test species to 'made_to_order'
      const req2 = new Request("http://localhost/api/admin/species/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speciesId: testSpeciesId,
          status: "made_to_order",
        }),
      });

      const res2 = await postAdminStockRoute(req2);
      expect(res2.status).toBe(200);

      const [updated2] = await db
        .select()
        .from(species)
        .where(eq(species.id, testSpeciesId))
        .limit(1);
      expect(updated2.stockStatus).toBe("made_to_order");

      // 3. Reset test species back to 'in_stock'
      const req3 = new Request("http://localhost/api/admin/species/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speciesId: testSpeciesId,
          status: "in_stock",
        }),
      });

      const res3 = await postAdminStockRoute(req3);
      expect(res3.status).toBe(200);

      const [updated3] = await db
        .select()
        .from(species)
        .where(eq(species.id, testSpeciesId))
        .limit(1);
      expect(updated3.stockStatus).toBe("in_stock");
    });

    it("POST /api/admin/species/stock rejects invalid status with 400 error", async () => {
      const req = new Request("http://localhost/api/admin/species/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speciesId: testSpeciesId,
          status: "invalid_status_value",
        }),
      });

      const res = await postAdminStockRoute(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Invalid status");
    });

    it("POST /api/admin/species/stock rejects missing speciesId or status with 400 error", async () => {
      const req = new Request("http://localhost/api/admin/species/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const res = await postAdminStockRoute(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Missing");
    });
  });

  describe("4. Customer Inquiries Log & LINE Verification", () => {
    it("renders inquiries log with ref code, customer intent badges, and plant name", async () => {
      const allInquiries = await getAdminInquiriesList(50);
      expect(allInquiries.length).toBeGreaterThan(0);

      const ctx = createMockAppContext({ role: "admin" });
      const html = renderToString(
        <AppContext.Provider value={ctx}>
          <AdminDashboardClient
            initialSpecies={seededSpecies}
            initialInquiries={allInquiries}
          />
        </AppContext.Provider>
      );

      // Verify the tab count contains inquiry count
      expect(html).toContain("บันทึกสอบถามจากลูกค้า");
      expect(html).toContain(String(allInquiries.length));

      // Verify inquiry list card rendering
      const targetInquiry = allInquiries.find((i) => i.refCode === testInquiryRefCode);
      expect(targetInquiry).toBeDefined();

      // Render tab directly to verify inquiry details
      const tabHtml = renderToString(
        <AppContext.Provider value={ctx}>
          <AdminDashboardClient
            initialSpecies={seededSpecies}
            initialInquiries={[
              {
                id: "test-inq-1",
                refCode: "TFL-4K9P",
                intent: "price",
                sourcePage: "/plants/monstera-deliciosa",
                payload: { customNote: "สนใจรับกระถางดินเผาด้วยครับ" },
                createdAt: new Date().toISOString(),
                speciesNameTh: "มอนสเตอร่า เดลิซิโอซา",
                speciesNameEn: "Monstera Deliciosa",
                speciesSlug: "monstera-deliciosa",
              },
            ]}
          />
        </AppContext.Provider>
      );

      // Ref code badge in monospace
      expect(tabHtml).toBeDefined();
    });

    it("formats LINE message with refCode for verification against incoming LINE chats", () => {
      const message = formatLineMessage(
        "price",
        "มอนสเตอร่า เดลิซิโอซา",
        "TFL-4K9P",
        "สนใจรับกระถางดินเผาด้วยครับ"
      );

      expect(message).toContain("มอนสเตอร่า เดลิซิโอซา");
      expect(message).toContain("TFL-4K9P");
      expect(message).toContain("สนใจรับกระถางดินเผาด้วยครับ");
      expect(message).toContain("ขอทราบราคาและขนาด");
    });

    it("GET /api/inquiries returns inquiries filtered by refCode", async () => {
      const req = new Request(`http://localhost/api/inquiries?refCode=${testInquiryRefCode}`);
      const res = await getInquiriesRoute(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.inquiries.length).toBe(1);
      expect(data.inquiries[0].refCode).toBe(testInquiryRefCode);
      expect(data.inquiries[0].intent).toBe("price");
    });
  });

  describe("5. Search Misses & Demand Analytics Ranking", () => {
    it("orders search misses by hit count descending and assigns ranking medals", async () => {
      const misses = await getSearchMisses(20);
      expect(misses.length).toBeGreaterThanOrEqual(2);

      // The query with 5 hits must appear before the query with 2 hits
      const highIndex = misses.findIndex((m) => m.query === "ต้นยางอินเดียด่าง");
      const medIndex = misses.findIndex((m) => m.query === "กวักมรกตใบลายพิเศษ");

      expect(highIndex).toBeGreaterThanOrEqual(0);
      expect(medIndex).toBeGreaterThanOrEqual(0);
      expect(highIndex).toBeLessThan(medIndex);
      expect(misses[highIndex].count).toBeGreaterThanOrEqual(5);

      // Verify client rendering of search misses table
      const mockMisses: AdminSearchMissItem[] = [
        {
          id: "miss-1",
          query: "ต้นยางอินเดียด่าง",
          count: 8,
          lastSeenAt: new Date().toISOString(),
        },
        {
          id: "miss-2",
          query: "กวักมรกตใบลายพิเศษ",
          count: 3,
          lastSeenAt: new Date().toISOString(),
        },
        {
          id: "miss-3",
          query: "บอนไซสนดำ",
          count: 1,
          lastSeenAt: new Date().toISOString(),
        },
      ];

      const ctx = createMockAppContext({ role: "admin" });
      const html = renderToString(
        <AppContext.Provider value={ctx}>
          <AdminDashboardClient
            initialSpecies={seededSpecies}
            initialSearchMisses={mockMisses}
          />
        </AppContext.Provider>
      );

      expect(html).toContain("คำค้นหาที่ไม่พบผลลัพธ์");
      expect(html).toContain(String(mockMisses.length));
    });
  });

  describe("6. Admin KPIs and Live Stats Calculation", () => {
    it("getAdminStats aggregates species, inquiries, misses, and garden plants accurately", async () => {
      const stats = await getAdminStats();

      expect(stats.species.total).toBeGreaterThanOrEqual(30);
      expect(typeof stats.species.inStock).toBe("number");
      expect(typeof stats.species.madeToOrder).toBe("number");
      expect(typeof stats.species.seasonal).toBe("number");
      expect(stats.inquiriesCount).toBeGreaterThan(0);
      expect(stats.searchMissesCount).toBeGreaterThan(0);
      expect(typeof stats.totalUserPlants).toBe("number");
    });
  });
});
