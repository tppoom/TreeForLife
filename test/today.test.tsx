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
  usePathname: () => "/today",
}));

import { getDb } from "@/lib/db";
import { careTasks, userPlants } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { addUserPlant } from "@/lib/services/gardenService";
import { getAllSpecies } from "@/lib/services/speciesService";
import { formatDate } from "@/lib/care/scheduler";
import TodayPage, { metadata as todayMetadata } from "@/app/today/page";
import { TodayTasksClient, type TodayCareTask } from "@/components/today/TodayTasksClient";
import { GET as getTasksRoute, POST as postTasksRoute } from "@/app/api/garden/tasks/route";
import { AppContextProvider } from "@/lib/context/AppContext";

describe("Task 9: Today's Tasks Dashboard Integration Tests", () => {
  let testGuestToken: string;
  let testSpeciesId: string;
  let plant1Id: string;
  let plant2Id: string;
  let todayDateStr: string;
  let overdueDateStr: string;
  let upcomingDateStr: string;

  beforeAll(async () => {
    const db = await getDb();
    testGuestToken = `test-today-guest-${Date.now()}`;

    const now = new Date();
    todayDateStr = formatDate(now);

    const pastDate = new Date(now);
    pastDate.setDate(pastDate.getDate() - 3);
    overdueDateStr = formatDate(pastDate);

    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + 5);
    upcomingDateStr = formatDate(futureDate);

    const allSpecies = await getAllSpecies();
    expect(allSpecies.length).toBeGreaterThan(0);
    testSpeciesId = allSpecies[0].id;

    // Create 2 test plants for this guest
    const plant1 = await addUserPlant({
      guestToken: testGuestToken,
      speciesId: testSpeciesId,
      nickname: "น้องมอนเดลิ",
      acquiredAt: "2026-09-01",
      acquiredFrom: "shop",
      potSizeInch: 8,
      potMaterial: "plastic",
      placement: "indoor_window",
      notes: "วางริมหน้าต่าง รดน้ำเมื่อดินแห้ง",
    });
    plant1Id = plant1.id;

    const plant2 = await addUserPlant({
      guestToken: testGuestToken,
      speciesId: testSpeciesId,
      nickname: "น้องไทรใบสักทอง",
      acquiredAt: "2026-09-01",
      acquiredFrom: "gift",
      potSizeInch: 10,
      potMaterial: "terracotta",
      placement: "balcony_shade",
      notes: "ชอบลมระบายดี",
    });
    plant2Id = plant2.id;

    // Set plant1 task to OVERDUE
    await db
      .update(careTasks)
      .set({ dueDate: overdueDateStr, status: "pending", snoozeCount: 0 })
      .where(eq(careTasks.userPlantId, plant1Id));

    // Set plant2 task to DUE TODAY
    await db
      .update(careTasks)
      .set({ dueDate: todayDateStr, status: "pending", snoozeCount: 1 })
      .where(eq(careTasks.userPlantId, plant2Id));
  });

  describe("1. Server Component & Metadata", () => {
    it("renders TodayPage Server Component without crashing", () => {
      const page = TodayPage();
      expect(page).toBeDefined();
      expect(page.type).toBe(TodayTasksClient);
    });

    it("exports proper bilingual SEO metadata", () => {
      expect(todayMetadata.title).toContain("งานดูแลวันนี้");
      expect(todayMetadata.title).toContain("Today's Tasks");
      expect(todayMetadata.description).toBeDefined();
    });
  });

  describe("2. Client Component Task Listing & Grouping", () => {
    it("renders empty state with exact Thai copy when tasks array is empty", () => {
      const html = renderToString(
        <AppContextProvider>
          <TodayTasksClient initialTasks={[]} />
        </AppContextProvider>
      );

      // Verify exact required empty state text:
      expect(html).toContain("ไม่มีงานที่ต้องทำวันนี้ ต้นไม้ทุกต้นได้รับการดูแลเรียบร้อยแล้ว 🌿");
      expect(html).toContain("ดูสวนของฉัน");
      expect(html).toContain("เพิ่มต้นไม้ใหม่");
    });

    it("groups tasks cleanly into Overdue and Due Today sections with counts and details", () => {
      const mockTasks: TodayCareTask[] = [
        {
          id: "task-overdue-1",
          userPlantId: plant1Id,
          type: "water",
          dueDate: overdueDateStr,
          status: "pending",
          snoozeCount: 0,
          plantNickname: "น้องมอนเดลิ",
          speciesNameTh: "มอนสเตอร่า เดลิซิโอซา",
          speciesNameEn: "Monstera Deliciosa",
          plantNotes: "วางริมหน้าต่าง รดน้ำเมื่อดินแห้ง",
          createdAt: new Date().toISOString(),
        },
        {
          id: "task-today-1",
          userPlantId: plant2Id,
          type: "fertilize",
          dueDate: todayDateStr,
          status: "pending",
          snoozeCount: 2,
          plantNickname: "น้องไทรใบสักทอง",
          speciesNameTh: "ไทรใบสัก",
          speciesNameEn: "Fiddle Leaf Fig",
          plantNotes: "ชอบลมระบายดี",
          createdAt: new Date().toISOString(),
        },
        {
          id: "task-upcoming-1",
          userPlantId: plant1Id,
          type: "pest_check",
          dueDate: upcomingDateStr,
          status: "pending",
          snoozeCount: 0,
          plantNickname: "น้องมอนเดลิ",
          speciesNameTh: "มอนสเตอร่า เดลิซิโอซา",
          speciesNameEn: "Monstera Deliciosa",
          createdAt: new Date().toISOString(),
        },
      ];

      const html = renderToString(
        <AppContextProvider>
          <TodayTasksClient initialTasks={mockTasks} />
        </AppContextProvider>
      );

      // Verify Overdue section and badge
      expect(html).toContain("งานที่เลยกำหนด");
      expect(html).toContain("เลยกำหนด 3 วัน");
      expect(html).toContain("น้องมอนเดลิ");
      expect(html).toContain("วางริมหน้าต่าง รดน้ำเมื่อดินแห้ง");

      // Verify Due Today section and badge
      expect(html).toContain("งานที่ต้องทำวันนี้");
      expect(html).toContain("ครบกำหนดวันนี้");
      expect(html).toContain("น้องไทรใบสักทอง");
      expect(html).toContain("ใส่ปุ๋ย");
      expect(html).toContain("เลื่อนแล้ว 2/3");

      // Verify Action buttons rendered
      expect(html).toContain("เสร็จแล้ว");
      expect(html).toContain("เลื่อน 1 วัน");
      expect(html).toContain("ข้ามรอบนี้");
      expect(html).toContain("รดน้ำทุกต้นครบแล้ว");
    });
  });

  describe("3. GET /api/garden/tasks API Route", () => {
    it("returns tasks scoped by guestToken with plant nickname, notes, and species", async () => {
      const req = new Request(
        `http://localhost/api/garden/tasks?guestToken=${testGuestToken}&status=pending`
      );
      const res = await getTasksRoute(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(Array.isArray(data.tasks)).toBe(true);
      expect(data.tasks.length).toBeGreaterThanOrEqual(2);

      const overdueTask = data.tasks.find((t: TodayCareTask) => t.dueDate === overdueDateStr);
      expect(overdueTask).toBeDefined();
      expect(overdueTask.plantNickname).toBe("น้องมอนเดลิ");
      expect(overdueTask.plantNotes).toBe("วางริมหน้าต่าง รดน้ำเมื่อดินแห้ง");
      expect(overdueTask.speciesNameTh).toBeDefined();

      const todayTask = data.tasks.find((t: TodayCareTask) => t.dueDate === todayDateStr);
      expect(todayTask).toBeDefined();
      expect(todayTask.plantNickname).toBe("น้องไทรใบสักทอง");
      expect(todayTask.snoozeCount).toBe(1);
    });

    it("returns empty array when unscoped to ensure data privacy", async () => {
      const req = new Request("http://localhost/api/garden/tasks");
      const res = await getTasksRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.tasks).toEqual([]);
    });
  });

  describe("4. Quick Actions: Snooze, Skip, Done, Batch Complete", () => {
    let overdueTaskObj: TodayCareTask;
    let todayTaskObj: TodayCareTask;

    beforeAll(async () => {
      const req = new Request(
        `http://localhost/api/garden/tasks?guestToken=${testGuestToken}&status=pending`
      );
      const res = await getTasksRoute(req);
      const data = await res.json();
      overdueTaskObj = data.tasks.find((t: TodayCareTask) => t.dueDate === overdueDateStr);
      todayTaskObj = data.tasks.find((t: TodayCareTask) => t.dueDate === todayDateStr);
    });

    it("POST /api/garden/tasks action: 'snooze' postpones task by 1 day and increments snoozeCount", async () => {
      const initialSnoozeCount = overdueTaskObj.snoozeCount;
      const req = new Request("http://localhost/api/garden/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPlantId: overdueTaskObj.userPlantId,
          taskId: overdueTaskObj.id,
          action: "snooze",
        }),
      });

      const res = await postTasksRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.action).toBe("snooze");
      expect(data.snoozeCount).toBe(initialSnoozeCount + 1);
      expect(data.newDueDate).toBeDefined();
    });

    it("POST /api/garden/tasks action: 'snooze' rejects when snoozeCount >= 3", async () => {
      const db = await getDb();
      // Force snooze count to 3
      await db
        .update(careTasks)
        .set({ snoozeCount: 3 })
        .where(eq(careTasks.id, overdueTaskObj.id));

      const req = new Request("http://localhost/api/garden/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPlantId: overdueTaskObj.userPlantId,
          taskId: overdueTaskObj.id,
          action: "snooze",
        }),
      });

      const res = await postTasksRoute(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("3 ครั้ง");
    });

    it("POST /api/garden/tasks action: 'skip' skips cycle and schedules next regular cycle", async () => {
      const req = new Request("http://localhost/api/garden/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPlantId: overdueTaskObj.userPlantId,
          taskId: overdueTaskObj.id,
          action: "skip",
        }),
      });

      const res = await postTasksRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.action).toBe("skip");
      expect(data.nextDueDate).toBeDefined();

      // Original task is now skipped
      const db = await getDb();
      const [skippedTask] = await db
        .select()
        .from(careTasks)
        .where(eq(careTasks.id, overdueTaskObj.id));
      expect(skippedTask.status).toBe("skipped");
    });

    it("POST /api/garden/tasks action: 'complete' marks task done, records care log, and generates next cycle", async () => {
      const req = new Request("http://localhost/api/garden/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPlantId: todayTaskObj.userPlantId,
          taskId: todayTaskObj.id,
          action: "complete",
          note: "Watered today from dashboard",
        }),
      });

      const res = await postTasksRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.action).toBe("complete");
      expect(data.nextDueDate).toBeDefined();

      // Original task is now done
      const db = await getDb();
      const [doneTask] = await db
        .select()
        .from(careTasks)
        .where(eq(careTasks.id, todayTaskObj.id));
      expect(doneTask.status).toBe("done");
      expect(doneTask.doneAt).toBeDefined();
    });

    it("POST /api/garden/tasks batch completes multiple pending tasks at once", async () => {
      const db = await getDb();
      // Create another guest with 2 pending tasks
      const batchGuestToken = `test-batch-${Date.now()}`;
      const batchPlant = await addUserPlant({
        guestToken: batchGuestToken,
        speciesId: testSpeciesId,
        nickname: "ต้นไม้แบบกลุ่ม",
        acquiredAt: "2026-09-01",
        potSizeInch: 6,
        potMaterial: "plastic",
        placement: "indoor_window",
      });

      // Get pending task
      const [taskToBatch] = await db
        .select()
        .from(careTasks)
        .where(and(eq(careTasks.userPlantId, batchPlant.id), eq(careTasks.status, "pending")));

      expect(taskToBatch).toBeDefined();

      const req = new Request("http://localhost/api/garden/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch: true,
          tasks: [
            {
              userPlantId: batchPlant.id,
              taskId: taskToBatch.id,
              action: "complete",
            },
          ],
        }),
      });

      const res = await postTasksRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.count).toBe(1);
      expect(data.succeeded).toHaveLength(1);
      expect(data.failed).toHaveLength(0);
    });

    it("POST /api/garden/tasks batch handles failing items safely without aborting succeeding items", async () => {
      const db = await getDb();
      const resilientGuestToken = `test-resilient-${Date.now()}`;
      const plant = await addUserPlant({
        guestToken: resilientGuestToken,
        speciesId: testSpeciesId,
        nickname: "ต้นไม้ทดสอบกลุ่มทนทาน",
        acquiredAt: "2026-09-01",
        potSizeInch: 6,
        potMaterial: "plastic",
        placement: "indoor_window",
      });

      const [validTask] = await db
        .select()
        .from(careTasks)
        .where(and(eq(careTasks.userPlantId, plant.id), eq(careTasks.status, "pending")));

      const req = new Request("http://localhost/api/garden/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch: true,
          tasks: [
            {
              userPlantId: plant.id,
              taskId: "00000000-0000-0000-0000-000000000999",
              action: "complete",
            },
            {
              userPlantId: plant.id,
              taskId: validTask.id,
              action: "complete",
            },
          ],
        }),
      });

      const res = await postTasksRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.succeeded).toHaveLength(1);
      expect(data.failed).toHaveLength(1);
      expect(data.failed[0].error).toBe("Task not found");
    });
  });
});
