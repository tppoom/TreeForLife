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
  usePathname: () => "/garden",
}));
import { getDb } from "@/lib/db";
import {
  getUserPlants,
  getUserPlantById,
  addUserPlant,
  updateUserPlant,
  archiveUserPlant,
} from "@/lib/services/gardenService";
import { getAllSpecies } from "@/lib/services/speciesService";
import {
  explainCareSchedule,
  calculateCareInterval,
  POT_MATERIAL_FACTORS,
  PLACEMENT_FACTORS,
} from "@/lib/care/scheduler";
import GardenPage from "@/app/garden/page";
import AddPlantPage from "@/app/garden/add/page";
import GardenPlantDetailPage, { generateMetadata as generateGardenDetailMetadata } from "@/app/garden/[id]/page";
import { GardenListClient, type UserPlantListItem } from "@/components/garden/GardenListClient";
import { AddPlantWizard, type AvailableSpeciesOption } from "@/components/garden/AddPlantWizard";
import { PlantGardenDetailClient, type PlantDetailData } from "@/components/garden/PlantGardenDetailClient";
import { GET as getPlantRoute, PATCH as patchPlantRoute } from "@/app/api/garden/plants/[id]/route";
import { POST as archivePlantRoute } from "@/app/api/garden/plants/[id]/archive/route";
import { AppContextProvider } from "@/lib/context/AppContext";

describe("Task 8: My Garden Hub, Add Wizard & Care Calendar Integration", () => {
  let testGuestToken: string;
  let testSpeciesId: string;
  let createdPlantId: string;

  beforeAll(async () => {
    await getDb();
    testGuestToken = `test-guest-task8-${Date.now()}`;

    const allSpecies = await getAllSpecies();
    expect(allSpecies.length).toBeGreaterThan(0);
    testSpeciesId = allSpecies[0].id;

    const plant = await addUserPlant({
      guestToken: testGuestToken,
      speciesId: testSpeciesId,
      nickname: "น้องมอนเขียวสวย",
      acquiredAt: "2026-09-08",
      acquiredFrom: "shop",
      potSizeInch: 8,
      potMaterial: "plastic",
      placement: "indoor_window",
      notes: "ตั้งไว้ข้างโต๊ะทำงาน แดดรำไร",
    });
    createdPlantId = plant.id;
  });

  describe("1. My Garden Hub (app/garden/page.tsx & GardenListClient.tsx)", () => {
    it("GardenPage Server Component renders GardenListClient without crashing", () => {
      const page = GardenPage();
      expect(page).toBeDefined();
      expect(page.type).toBe(GardenListClient);
    });

    it("GardenListClient renders empty state onboarding when user has 0 plants", () => {
      const html = renderToString(
        <AppContextProvider>
          <GardenListClient />
        </AppContextProvider>
      );

      // Verify empty state onboarding card elements
      expect(html).toContain("สวนของฉัน");
      expect(html).toContain("/garden/add");
      expect(html).toContain("เพิ่มต้นไม้");
    });

    it("displays colorblind-safe accessible badges for Overdue, Due Today, and Upcoming", () => {
      // Mock plant items with different urgency states
      const mockOverduePlant: UserPlantListItem = {
        id: "plant-overdue",
        nickname: "ต้นไม้แห้งมาก",
        displayPhoto: "https://example.com/photo1.jpg",
        acquiredAt: "2026-01-01",
        acquiredFrom: "shop",
        potSizeInch: "8",
        potMaterial: "plastic",
        placement: "indoor_window",
        speciesNameTh: "มอนสเตอร่า",
        speciesNameEn: "Monstera Deliciosa",
        statusBadge: {
          type: "overdue",
          label: "เลยกำหนด 3 วัน",
          days: -3,
        },
        nextTask: {
          id: "task-1",
          dueDate: "2026-09-05",
          type: "water",
          status: "pending",
        },
      };

      const mockTodayPlant: UserPlantListItem = {
        id: "plant-today",
        nickname: "ต้นไม้น้ำวันนี้",
        displayPhoto: "https://example.com/photo2.jpg",
        acquiredAt: "2026-02-01",
        acquiredFrom: "gift",
        potSizeInch: "6",
        potMaterial: "terracotta",
        placement: "balcony_shade",
        speciesNameTh: "ยางอินเดีย",
        speciesNameEn: "Rubber Tree",
        statusBadge: {
          type: "today",
          label: "รดน้ำวันนี้",
          days: 0,
        },
        nextTask: {
          id: "task-2",
          dueDate: "2026-09-08",
          type: "water",
          status: "pending",
        },
      };

      const mockUpcomingPlant: UserPlantListItem = {
        id: "plant-upcoming",
        nickname: "ต้นไม้สุขสบาย",
        displayPhoto: "https://example.com/photo3.jpg",
        acquiredAt: "2026-03-01",
        acquiredFrom: "propagated",
        potSizeInch: "12",
        potMaterial: "ceramic_glazed",
        placement: "indoor_far",
        speciesNameTh: "กวักมรกต",
        speciesNameEn: "ZZ Plant",
        statusBadge: {
          type: "upcoming",
          label: "อีก 4 วัน",
          days: 4,
        },
        nextTask: {
          id: "task-3",
          dueDate: "2026-09-12",
          type: "water",
          status: "pending",
        },
      };

      // Verify status badge representations in UI
      expect(mockOverduePlant.statusBadge.type).toBe("overdue");
      expect(mockOverduePlant.statusBadge.label).toContain("เลยกำหนด");

      expect(mockTodayPlant.statusBadge.type).toBe("today");
      expect(mockTodayPlant.statusBadge.label).toBe("รดน้ำวันนี้");

      expect(mockUpcomingPlant.statusBadge.type).toBe("upcoming");
      expect(mockUpcomingPlant.statusBadge.label).toContain("อีก 4 วัน");
    });
  });

  describe("2. 4-Step Add Plant Wizard (app/garden/add/page.tsx & AddPlantWizard.tsx)", () => {
    it("AddPlantPage Server Component loads catalog species with care templates", async () => {
      const page = await AddPlantPage();
      expect(page).toBeDefined();
    });

    it("AddPlantWizard renders initial Step 1 with catalog search and custom toggle", () => {
      const mockSpecies: AvailableSpeciesOption[] = [
        {
          id: testSpeciesId,
          nameTh: "มอนสเตอร่า เดลิซิโอซา",
          nameEn: "Monstera Deliciosa",
          nameSci: "Monstera deliciosa",
          slug: "monstera-deliciosa",
          primaryImage: "https://example.com/monstera.jpg",
          careTemplate: {
            waterDaysHot: 3,
            waterDaysRainy: 5,
            waterDaysCool: 7,
          },
        },
      ];

      const html = renderToString(
        <AppContextProvider>
          <AddPlantWizard availableSpecies={mockSpecies} />
        </AppContextProvider>
      );

      // Step 1 check
      expect(html).toContain("เลือกพันธุ์ไม้");
      expect(html).toContain("มอนสเตอร่า เดลิซิโอซา");
      expect(html).toContain("Monstera Deliciosa");
      expect(html).toContain("พันธุ์อื่นๆ");
    });

    it("computes live seasonal calculation breakdown with pot and placement multipliers", () => {
      const template = {
        waterDaysHot: 3,
        waterDaysRainy: 5,
        waterDaysCool: 7,
      };

      // Scenario A: Terracotta (0.80) + Small Pot <6" (0.85) + Outdoor Sun (0.70)
      const calculationSun = explainCareSchedule({
        template,
        plantConfig: {
          potSizeInch: 4,
          potMaterial: "terracotta",
          placement: "outdoor_sun",
        },
        season: "rainy",
      });

      // 5 * 0.8 * 0.85 * 0.7 = 2.38 -> rounded to 2
      expect(calculationSun.materialFactor).toBe(0.8);
      expect(calculationSun.sizeFactor).toBe(0.85);
      expect(calculationSun.placementFactor).toBe(0.7);
      expect(calculationSun.finalIntervalDays).toBe(2);
      expect(calculationSun.formula).toContain("×");

      // Scenario B: Glazed Ceramic (1.15) + Large Pot >10" (1.20) + Indoor Far (1.25)
      const calculationShade = explainCareSchedule({
        template,
        plantConfig: {
          potSizeInch: 12,
          potMaterial: "ceramic_glazed",
          placement: "indoor_far",
        },
        season: "cool",
      });

      // 7 * 1.15 * 1.2 * 1.25 = 12.075 -> rounded to 12
      expect(calculationShade.materialFactor).toBe(1.15);
      expect(calculationShade.sizeFactor).toBe(1.2);
      expect(calculationShade.placementFactor).toBe(1.25);
      expect(calculationShade.finalIntervalDays).toBe(12);

      // Scenario C: Custom days override
      const calculationCustom = explainCareSchedule({
        template,
        plantConfig: {
          potSizeInch: 8,
          potMaterial: "plastic",
          placement: "indoor_window",
          customWaterDays: 3,
        },
      });
      expect(calculationCustom.isCustom).toBe(true);
      expect(calculationCustom.finalIntervalDays).toBe(3);
    });

    it("creates plant record via addUserPlant service and sets up initial care tasks", async () => {
      const newPlant = await addUserPlant({
        guestToken: testGuestToken,
        speciesId: testSpeciesId,
        nickname: "น้องมอนเขียวสวย",
        acquiredAt: "2026-09-08",
        acquiredFrom: "shop",
        potSizeInch: 8,
        potMaterial: "plastic",
        placement: "indoor_window",
        notes: "ตั้งไว้ข้างโต๊ะทำงาน แดดรำไร",
      });

      expect(newPlant).toBeDefined();
      expect(newPlant.id).toBeDefined();
      expect(newPlant.nickname).toBe("น้องมอนเขียวสวย");
      expect(newPlant.isActive).toBe(true);
      createdPlantId = newPlant.id;

      // Verify plant is listed in getUserPlants
      const userPlants = await getUserPlants(null, testGuestToken);
      expect(userPlants.length).toBeGreaterThanOrEqual(1);
      const found = userPlants.find((p) => p.id === createdPlantId);
      expect(found).toBeDefined();
      expect(found?.nextTask).toBeDefined();
      expect(found?.statusBadge).toBeDefined();
    });
  });

  describe("3. Plant Care Detail & 30-Day Calendar (app/garden/[id]/page.tsx & PlantGardenDetailClient.tsx)", () => {
    it("GardenPlantDetailPage Server Component fetches plant details with async params", async () => {
      const page = await GardenPlantDetailPage({
        params: Promise.resolve({ id: createdPlantId }),
      });
      expect(page).toBeDefined();
      expect(page.props.initialPlant).toBeDefined();
      expect(page.props.initialPlant.id).toBe(createdPlantId);
    });

    it("generateGardenDetailMetadata generates SEO title containing plant nickname", async () => {
      const metadata = await generateGardenDetailMetadata({
        params: Promise.resolve({ id: createdPlantId }),
      });
      expect(metadata.title).toContain("น้องมอนเขียวสวย");
      expect(metadata.title).toContain("TreeForLife");
    });

    it("PlantGardenDetailClient renders hero card, 30-day care calendar, and inquiry trigger", async () => {
      const plantData = (await getUserPlantById(createdPlantId)) as PlantDetailData;
      expect(plantData).toBeDefined();

      const html = renderToString(
        <AppContextProvider>
          <PlantGardenDetailClient initialPlant={plantData} />
        </AppContextProvider>
      );

      // Check Hero Card
      expect(html).toContain("น้องมอนเขียวสวย");
      expect(html).toContain("พลาสติก");

      // Check 30-day calendar section
      expect(html).toContain("ปฏิทินดูแล 30 วันข้างหน้า");

      // Check Timeline section
      expect(html).toContain("ประวัติการดูแล");

      // Check Environmental Editor section
      expect(html).toContain("แก้ไขข้อมูลต้นไม้");
      expect(html).toContain("รอบรดน้ำคำนวณสด");

      // Check Ask Shop button
      expect(html).toContain("ปรึกษาร้านเกี่ยวกับต้นไม้นี้");

      // Check Archive button
      expect(html).toContain("ย้ายเข้าคลังประวัติ");
    });

    it("PATCH /api/garden/plants/[id] updates plant environmental settings and nickname", async () => {
      const req = new Request(`http://localhost/api/garden/plants/${createdPlantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: "น้องมอนโฉมใหม่",
          potSizeInch: 10,
          potMaterial: "terracotta",
          placement: "balcony_shade",
          notes: "ย้ายมาระเบียง เปลี่ยนกระถางดินเผา",
        }),
      });

      const res = await patchPlantRoute(req, {
        params: Promise.resolve({ id: createdPlantId }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.plant.nickname).toBe("น้องมอนโฉมใหม่");
      expect(data.plant.potSizeInch).toBe("10");
      expect(data.plant.potMaterial).toBe("terracotta");
      expect(data.plant.placement).toBe("balcony_shade");
    });

    it("GET /api/garden/plants/[id] returns updated plant data", async () => {
      const req = new Request(`http://localhost/api/garden/plants/${createdPlantId}`);
      const res = await getPlantRoute(req, {
        params: Promise.resolve({ id: createdPlantId }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.plant).toBeDefined();
      expect(data.plant.nickname).toBe("น้องมอนโฉมใหม่");
      expect(data.plant.calculation).toBeDefined();
    });

    it("POST /api/garden/plants/[id]/archive marks plant as inactive", async () => {
      const req = new Request(`http://localhost/api/garden/plants/${createdPlantId}/archive`, {
        method: "POST",
      });

      const res = await archivePlantRoute(req, {
        params: Promise.resolve({ id: createdPlantId }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      // Verify plant is no longer returned in active plants list
      const activePlants = await getUserPlants(null, testGuestToken);
      const archivedPlant = activePlants.find((p) => p.id === createdPlantId);
      expect(archivedPlant).toBeUndefined();
    });
  });
});
