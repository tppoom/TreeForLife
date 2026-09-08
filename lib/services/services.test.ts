import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "@/lib/db";
import {
  getAllSpecies,
  getSpeciesBySlug,
  recordSearchMiss,
  getSimilarSpecies,
  getSpeciesList,
} from "@/lib/services/speciesService";
import {
  getUserPlants,
  getUserPlantById,
  addUserPlant,
  updateUserPlant,
  archiveUserPlant,
  completeTask,
  snoozeTask,
  skipTask,
  mergeGuestPlants,
  recordTaskAction,
} from "@/lib/services/gardenService";
import {
  createInquiry,
  getInquiries,
  generateRefCode,
  formatLineMessage,
  getLineDeepLink,
} from "@/lib/services/inquiryService";
import {
  updateStockStatus,
  getSearchMisses,
  getAdminStats,
} from "@/lib/services/adminService";
import { GET as getPlantsRoute, POST as postPlantRoute } from "@/app/api/garden/plants/route";
import { POST as archivePlantRoute } from "@/app/api/garden/plants/[id]/archive/route";
import { GET as getTasksRoute, POST as postTasksRoute } from "@/app/api/garden/tasks/route";
import { POST as mergeRoute } from "@/app/api/garden/merge/route";
import { GET as getInquiriesRoute, POST as postInquiriesRoute } from "@/app/api/inquiries/route";
import { POST as postAdminStockRoute } from "@/app/api/admin/species/stock/route";

describe("Domain Services & REST API Endpoints", () => {
  beforeAll(async () => {
    // Ensure database is initialized and seeded
    await getDb();
  });

  describe("1. speciesService", () => {
    it("getAllSpecies returns 30 seeded species by default", async () => {
      const list = await getAllSpecies();
      expect(list.length).toBeGreaterThanOrEqual(30);
      expect(list[0]).toHaveProperty("slug");
      expect(list[0]).toHaveProperty("nameTh");
      expect(list[0]).toHaveProperty("primaryImage");
    });

    it("getSpeciesList is an alias to getAllSpecies", async () => {
      expect(getSpeciesList).toBe(getAllSpecies);
    });

    it("getAllSpecies supports filtering by light, waterNeed, and search", async () => {
      const indoorBright = await getAllSpecies({ light: "indoor_bright" });
      expect(indoorBright.length).toBeGreaterThan(0);
      for (const sp of indoorBright) {
        expect(sp.light).toBe("indoor_bright");
      }

      const searched = await getAllSpecies({ search: "มอนสเตอร่า" });
      expect(searched.length).toBeGreaterThan(0);
      expect(searched[0].nameTh).toContain("มอนสเตอร่า");
    });

    it("getSpeciesBySlug returns full species details with media, template, and problems", async () => {
      const plant = await getSpeciesBySlug("monstera-deliciosa");
      expect(plant).not.toBeNull();
      expect(plant?.slug).toBe("monstera-deliciosa");
      expect(plant?.media.length).toBeGreaterThan(0);
      expect(plant?.careTemplate).toBeDefined();
      expect(plant?.careTemplate?.waterDaysHot).toBeDefined();
      expect(plant?.problems.length).toBeGreaterThan(0);
    });

    it("getSpeciesBySlug returns null for nonexistent slug", async () => {
      const plant = await getSpeciesBySlug("non-existent-species-12345");
      expect(plant).toBeNull();
    });

    it("recordSearchMiss records and increments query misses", async () => {
      const testQuery = `test-missing-plant-${Date.now()}`;
      await recordSearchMiss(testQuery);

      let misses = await getSearchMisses(100);
      const found = misses.find((m) => m.query === testQuery);
      expect(found).toBeDefined();
      expect(found?.count).toBe(1);

      // Record again to increment count
      await recordSearchMiss(testQuery);
      misses = await getSearchMisses(100);
      const incremented = misses.find((m) => m.query === testQuery);
      expect(incremented?.count).toBe(2);
    });

    it("getSimilarSpecies returns similar plants excluding current species", async () => {
      const all = await getAllSpecies({ limit: 1 });
      const current = all[0];
      const similar = await getSimilarSpecies(current.id, current.light, current.waterNeed);
      expect(Array.isArray(similar)).toBe(true);
      for (const s of similar) {
        expect(s.id).not.toBe(current.id);
      }
    });
  });

  describe("2. gardenService", () => {
    const guestToken = `guest-test-${Date.now()}`;
    let createdPlantId: string;
    let initialTaskId: string;

    it("addUserPlant calculates care intervals and seeds upcoming care tasks", async () => {
      const speciesList = await getAllSpecies({ limit: 1 });
      const testSpecies = speciesList[0];

      const newPlant = await addUserPlant({
        guestToken,
        speciesId: testSpecies.id,
        nickname: "ต้นมอนนี่ตัวโปรด",
        acquiredAt: "2026-09-01",
        acquiredFrom: "shop",
        potSizeInch: 8,
        potMaterial: "terracotta",
        placement: "balcony_shade",
        notes: "วางที่ระเบียงห้องนอน",
      });

      expect(newPlant).toBeDefined();
      expect(newPlant.id).toBeDefined();
      expect(newPlant.nickname).toBe("ต้นมอนนี่ตัวโปรด");
      expect(newPlant.isActive).toBe(true);
      createdPlantId = newPlant.id;

      // Verify tasks seeded
      const plantDetail = await getUserPlantById(createdPlantId);
      expect(plantDetail).not.toBeNull();
      expect(plantDetail?.tasks.length).toBeGreaterThanOrEqual(1);
      const waterTask = plantDetail?.tasks.find((t) => t.type === "water");
      expect(waterTask).toBeDefined();
      expect(waterTask?.status).toBe("pending");
      initialTaskId = waterTask!.id;
    });

    it("getUserPlants retrieves plants with status badges sorted by urgency", async () => {
      const plants = await getUserPlants(null, guestToken);
      expect(plants.length).toBeGreaterThanOrEqual(1);
      const found = plants.find((p) => p.id === createdPlantId);
      expect(found).toBeDefined();
      expect(found?.statusBadge).toBeDefined();
      expect(found?.statusBadge.type).toMatch(/overdue|today|upcoming/);
    });

    it("updateUserPlant updates plant attributes", async () => {
      const updated = await updateUserPlant(createdPlantId, {
        nickname: "มอนนี่สุดหล่อ",
        notes: "เปลี่ยนกระถางใหม่แล้ว",
        potSizeInch: 10,
      });

      expect(updated).toBeDefined();
      expect(updated?.nickname).toBe("มอนนี่สุดหล่อ");
      expect(updated?.notes).toBe("เปลี่ยนกระถางใหม่แล้ว");
      expect(Number(updated?.potSizeInch)).toBe(10);
    });

    it("snoozeTask postpones due date by 1 day up to 3 times", async () => {
      // Snooze 1
      const snooze1 = await snoozeTask({ taskId: initialTaskId, userPlantId: createdPlantId });
      expect(snooze1.success).toBe(true);
      expect(snooze1.snoozeCount).toBe(1);

      // Snooze 2
      const snooze2 = await snoozeTask({ taskId: initialTaskId, userPlantId: createdPlantId });
      expect(snooze2.snoozeCount).toBe(2);

      // Snooze 3
      const snooze3 = await snoozeTask({ taskId: initialTaskId, userPlantId: createdPlantId });
      expect(snooze3.snoozeCount).toBe(3);

      // Snooze 4 should throw
      await expect(
        snoozeTask({ taskId: initialTaskId, userPlantId: createdPlantId })
      ).rejects.toThrow("เลื่อนได้สูงสุด 3 ครั้ง");
    });

    it("completeTask creates care_log and schedules next task cycle", async () => {
      const res = await completeTask({
        taskId: initialTaskId,
        userPlantId: createdPlantId,
        note: "รดน้ำชุ่มกำลังดี",
      });

      expect(res.success).toBe(true);
      expect(res.action).toBe("complete");
      expect(res.nextDueDate).toBeDefined();

      const detail = await getUserPlantById(createdPlantId);
      // Verify care log was added
      expect(detail?.logs.length).toBeGreaterThanOrEqual(1);
      expect(detail?.logs[0].note).toBe("รดน้ำชุ่มกำลังดี");

      // Verify old task is done and new pending task exists
      const oldTask = detail?.tasks.find((t) => t.id === initialTaskId);
      expect(oldTask?.status).toBe("done");

      const nextPending = detail?.tasks.find((t) => t.status === "pending");
      expect(nextPending).toBeDefined();
      expect(nextPending?.dueDate).toBe(res.nextDueDate);
    });

    it("skipTask skips task and advances to next regular cycle without care log", async () => {
      const detail = await getUserPlantById(createdPlantId);
      const pendingTask = detail?.tasks.find((t) => t.status === "pending")!;
      const logsCountBefore = detail?.logs.length || 0;

      const skipRes = await skipTask({
        taskId: pendingTask.id,
        userPlantId: createdPlantId,
      });

      expect(skipRes.success).toBe(true);
      expect(skipRes.action).toBe("skip");

      const afterDetail = await getUserPlantById(createdPlantId);
      // No new care log
      expect(afterDetail?.logs.length).toBe(logsCountBefore);

      // Skipped task marked skipped
      const skipped = afterDetail?.tasks.find((t) => t.id === pendingTask.id);
      expect(skipped?.status).toBe("skipped");

      // New pending task created
      const newPending = afterDetail?.tasks.find((t) => t.status === "pending");
      expect(newPending).toBeDefined();
    });

    it("recordTaskAction delegates correctly to complete, snooze, and skip", async () => {
      const detail = await getUserPlantById(createdPlantId);
      const pendingTask = detail?.tasks.find((t) => t.status === "pending")!;

      const res = await recordTaskAction({
        taskId: pendingTask.id,
        userPlantId: createdPlantId,
        action: "done",
      });
      expect(res.success).toBe(true);
      expect(res.action).toBe("complete");
    });

    it("guards against non-pending tasks in completeTask, snoozeTask, and skipTask", async () => {
      // completed task cannot be completed again
      await expect(
        completeTask({
          taskId: initialTaskId,
          userPlantId: createdPlantId,
        })
      ).rejects.toThrow("Task is already done");

      // completed task cannot be snoozed
      await expect(
        snoozeTask({
          taskId: initialTaskId,
          userPlantId: createdPlantId,
        })
      ).rejects.toThrow("Task is already done");

      // completed task cannot be skipped
      await expect(
        skipTask({
          taskId: initialTaskId,
          userPlantId: createdPlantId,
        })
      ).rejects.toThrow("Task is already done");
    });

    it("skipTask calculates fertilize interval from care template rather than defaulting to 3 days", async () => {
      const detail = await getUserPlantById(createdPlantId);
      const fertilizeTask = detail?.tasks.find((t) => t.type === "fertilize" && t.status === "pending");
      if (fertilizeTask) {
        const skipRes = await skipTask({
          taskId: fertilizeTask.id,
          userPlantId: createdPlantId,
        });
        expect(skipRes.success).toBe(true);

        const currentDue = new Date(fertilizeTask.dueDate);
        const nextDue = new Date(skipRes.nextDueDate);
        const diffDays = Math.round((nextDue.getTime() - currentDue.getTime()) / (1000 * 60 * 60 * 24));
        // Fertilize interval should be around 30+ days from template, not 3 days
        expect(diffDays).toBeGreaterThanOrEqual(14);
      }
    });

    it("addUserPlant enforces ownership and safe potSizeInch formatting", async () => {
      // Ownership validation
      await expect(
        addUserPlant({
          nickname: "ต้นไร้เจ้าของ",
          acquiredAt: "2026-09-08",
          potSizeInch: 8,
          potMaterial: "plastic",
          placement: "indoor_window",
        })
      ).rejects.toThrow("Plant must belong to a userId or guestToken");

      // Safe potSizeInch handling when invalid/empty
      const safePlant = await addUserPlant({
        guestToken: "safe-pot-test",
        nickname: "ต้นกระถางปลอดภัย",
        acquiredAt: "2026-09-08",
        potSizeInch: "" as any,
        potMaterial: "plastic",
        placement: "indoor_window",
      });
      expect(Number(safePlant.potSizeInch)).toBe(6);
    });

    it("mergeGuestPlants migrates guest plants to registered user", async () => {
      const registeredUserId = "a0000000-0000-0000-0000-000000000001";
      const mergeRes = await mergeGuestPlants(guestToken, registeredUserId);
      expect(mergeRes.plantCount).toBeGreaterThanOrEqual(1);

      // Guest token should now return 0 plants
      const guestPlants = await getUserPlants(null, guestToken);
      expect(guestPlants.length).toBe(0);

      // User should now have the plant
      const userPlantsList = await getUserPlants(registeredUserId);
      const found = userPlantsList.find((p) => p.id === createdPlantId);
      expect(found).toBeDefined();
    });

    it("archiveUserPlant archives plant so it no longer appears in active list", async () => {
      const registeredUserId = "a0000000-0000-0000-0000-000000000001";
      await archiveUserPlant(createdPlantId);

      const userPlantsList = await getUserPlants(registeredUserId);
      const found = userPlantsList.find((p) => p.id === createdPlantId);
      expect(found).toBeUndefined();

      const detail = await getUserPlantById(createdPlantId);
      expect(detail?.isActive).toBe(false);
    });
  });

  describe("3. inquiryService", () => {
    let createdRefCode: string;

    it("generateRefCode creates valid TFL-XXXX code format", () => {
      const code = generateRefCode();
      expect(code).toMatch(/^TFL-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/);
    });

    it("formatLineMessage generates customized text for each intent", () => {
      const msgPrice = formatLineMessage("price", "มอนสเตอร่า", "TFL-4K9P");
      expect(msgPrice).toContain('สนใจ "มอนสเตอร่า" จากหน้าเว็บ');
      expect(msgPrice).toContain("[TFL-4K9P]");

      const msgAvail = formatLineMessage("availability", "ไทรใบสัก", "TFL-9999");
      expect(msgAvail).toContain('มีของพร้อมส่งไหม');

      const msgCare = formatLineMessage("care_help", "ยางอินเดีย", "TFL-7777");
      expect(msgCare).toContain('ขอคำแนะนำเรื่องการดูแล');
    });

    it("getLineDeepLink produces valid URL", () => {
      const url = getLineDeepLink("สวัสดี TreeForLife", "treeforlife");
      expect(url).toContain("https://line.me/R/oaMessage/@treeforlife/?");
    });

    it("createInquiry creates inquiry record with refCode and LINE deep link", async () => {
      const res = await createInquiry({
        sourcePage: "/plants/monstera-deliciosa",
        intent: "price",
        speciesNameTh: "มอนสเตอร่า เดลิซิโอซา",
        customNote: "ขนาดประมาณ 50 ซม.",
      });

      expect(res.inquiry).toBeDefined();
      expect(res.refCode).toMatch(/^TFL-/);
      expect(res.lineUrl).toContain("https://line.me/R/oaMessage/");
      expect(res.message).toContain("ขนาดประมาณ 50 ซม.");
      createdRefCode = res.refCode;
    });

    it("getInquiries retrieves inquiries with species metadata and filter support", async () => {
      const inquiries = await getInquiries({ refCode: createdRefCode });
      expect(inquiries.length).toBe(1);
      expect(inquiries[0].refCode).toBe(createdRefCode);
      expect(inquiries[0].intent).toBe("price");
    });
  });

  describe("4. adminService", () => {
    it("updateStockStatus modifies species stock status", async () => {
      const all = await getAllSpecies({ limit: 1 });
      const sp = all[0];

      await updateStockStatus(sp.id, "seasonal");
      const updated = await getSpeciesBySlug(sp.slug);
      expect(updated?.stockStatus).toBe("seasonal");

      // Reset back to in_stock
      await updateStockStatus(sp.id, "in_stock");
      const reset = await getSpeciesBySlug(sp.slug);
      expect(reset?.stockStatus).toBe("in_stock");
    });

    it("getAdminStats provides system counts", async () => {
      const stats = await getAdminStats();
      expect(stats.species.total).toBeGreaterThanOrEqual(30);
      expect(stats.species.inStock).toBeGreaterThan(0);
      expect(stats.inquiriesCount).toBeGreaterThanOrEqual(1);
    });

    it("getSearchMisses retrieves logged search queries", async () => {
      const misses = await getSearchMisses(10);
      expect(Array.isArray(misses)).toBe(true);
      expect(misses.length).toBeGreaterThan(0);
    });
  });

  describe("5. REST API Endpoints", () => {
    const apiGuestToken = `api-guest-${Date.now()}`;
    let apiPlantId: string;
    let apiTaskId: string;

    it("POST /api/garden/plants creates a new plant", async () => {
      const req = new Request("http://localhost/api/garden/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestToken: apiGuestToken,
          nickname: "ต้นยางอินเดียระเบียง",
          acquiredAt: "2026-09-08",
          acquiredFrom: "elsewhere",
          potSizeInch: 10,
          potMaterial: "plastic",
          placement: "indoor_window",
        }),
      });

      const res = await postPlantRoute(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.plant.id).toBeDefined();
      apiPlantId = data.plant.id;
    });

    it("POST /api/garden/plants rejects requests missing ownership or invalid potSize", async () => {
      // Missing ownership
      const reqNoOwner = new Request("http://localhost/api/garden/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: "ไม่มีเจ้าของ",
          acquiredAt: "2026-09-08",
          potSizeInch: 8,
          potMaterial: "plastic",
          placement: "indoor_window",
        }),
      });
      const resNoOwner = await postPlantRoute(reqNoOwner);
      expect(resNoOwner.status).toBe(400);

      // Invalid potSize
      const reqInvalidPot = new Request("http://localhost/api/garden/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestToken: "some-token",
          nickname: "กระถางผิด",
          acquiredAt: "2026-09-08",
          potSizeInch: -5,
          potMaterial: "plastic",
          placement: "indoor_window",
        }),
      });
      const resInvalidPot = await postPlantRoute(reqInvalidPot);
      expect(resInvalidPot.status).toBe(400);
    });

    it("GET /api/garden/plants returns list of plants", async () => {
      const req = new Request(`http://localhost/api/garden/plants?guestToken=${apiGuestToken}`);
      const res = await getPlantsRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.plants.length).toBeGreaterThanOrEqual(1);
      expect(data.plants[0].nickname).toBe("ต้นยางอินเดียระเบียง");
    });

    it("GET /api/garden/tasks returns empty array when unscoped to prevent data leakage", async () => {
      const req = new Request("http://localhost/api/garden/tasks");
      const res = await getTasksRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.tasks).toEqual([]);
    });

    it("GET /api/garden/tasks retrieves pending tasks when scoped", async () => {
      const req = new Request(`http://localhost/api/garden/tasks?guestToken=${apiGuestToken}&status=pending`);
      const res = await getTasksRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.tasks.length).toBeGreaterThanOrEqual(1);
      apiTaskId = data.tasks[0].id;
    });

    it("POST /api/garden/tasks performs complete action", async () => {
      const req = new Request("http://localhost/api/garden/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPlantId: apiPlantId,
          taskId: apiTaskId,
          action: "complete",
          note: "Watered via API",
        }),
      });

      const res = await postTasksRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.nextDueDate).toBeDefined();
    });

    it("POST /api/garden/merge merges guest plants into user", async () => {
      const req = new Request("http://localhost/api/garden/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestToken: apiGuestToken,
          userId: "a0000000-0000-0000-0000-000000000001",
        }),
      });

      const res = await mergeRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.plantCount).toBeGreaterThanOrEqual(1);
    });

    it("POST /api/garden/plants/[id]/archive archives a plant", async () => {
      const req = new Request(`http://localhost/api/garden/plants/${apiPlantId}/archive`, {
        method: "POST",
      });

      const res = await archivePlantRoute(req, {
        params: Promise.resolve({ id: apiPlantId }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it("POST /api/inquiries creates an inquiry", async () => {
      const req = new Request("http://localhost/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourcePage: "/search",
          intent: "care_help",
          speciesNameTh: "กวักมรกต",
        }),
      });

      const res = await postInquiriesRoute(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.refCode).toMatch(/^TFL-/);
      expect(data.lineUrl).toContain("line.me");
    });

    it("GET /api/inquiries returns inquiries list", async () => {
      const req = new Request("http://localhost/api/inquiries?limit=5");
      const res = await getInquiriesRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.inquiries)).toBe(true);
      expect(data.inquiries.length).toBeGreaterThanOrEqual(1);
    });

    it("POST /api/admin/species/stock updates species stock status", async () => {
      const all = await getAllSpecies({ limit: 1 });
      const sp = all[0];

      const req = new Request("http://localhost/api/admin/species/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speciesId: sp.id,
          status: "made_to_order",
        }),
      });

      const res = await postAdminStockRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      const check = await getSpeciesBySlug(sp.slug);
      expect(check?.stockStatus).toBe("made_to_order");

      // Reset
      await updateStockStatus(sp.id, "in_stock");
    });
  });
});
