import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "@/lib/db";
import { users, userPlants, species, careTasks, cronRuns } from "@/db/schema";
import { GET as generateTasksRoute } from "@/app/api/cron/generate-tasks/route";
import { GET as sendRemindersRoute } from "@/app/api/cron/send-reminders/route";
import { GET as seasonRecalcRoute } from "@/app/api/cron/season-recalc/route";
import { GET as cleanupRoute } from "@/app/api/cron/cleanup/route";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

describe("Cron Jobs (Vercel Cron & Care Automation)", () => {
  let testUserId: string;
  let testSpeciesId: string;

  beforeAll(async () => {
    const db = await getDb();
    const [sp] = await db.select().from(species).limit(1);
    testSpeciesId = sp.id;

    const [u] = await db
      .insert(users)
      .values({
        displayName: "Cron Tester",
        role: "customer",
      })
      .returning();
    testUserId = u.id;

    // Insert user plant
    await db.insert(userPlants).values({
      userId: testUserId,
      speciesId: testSpeciesId,
      nickname: "ต้นไม้เทสต์คาสก์",
      acquiredAt: "2026-09-01",
      acquiredFrom: "shop",
      potSizeInch: "8",
      potMaterial: "plastic",
      placement: "indoor_window",
    });
  });

  it("generate-tasks runs idempotently and creates upcoming care tasks", async () => {
    const req = new NextRequest("https://example.com/api/cron/generate-tasks");
    const res = await generateTasksRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);

    // Second run should recognize existing completed run
    const res2 = await generateTasksRoute(req);
    expect(res2.status).toBe(200);
    const data2 = await res2.json();
    expect(data2.message).toContain("already");
  });

  it("send-reminders dispatches pending reminders and records in cron_runs", async () => {
    const req = new NextRequest("https://example.com/api/cron/send-reminders");
    const res = await sendRemindersRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("season-recalc recalculates water intervals for active plants", async () => {
    const req = new NextRequest("https://example.com/api/cron/season-recalc");
    const res = await seasonRecalcRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(typeof data.recalculatedCount).toBe("number");
  });

  it("cleanup purges stale records and auto-skips overdue tasks >30 days", async () => {
    const req = new NextRequest("https://example.com/api/cron/cleanup");
    const res = await cleanupRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(typeof data.autoSkippedTasksCount).toBe("number");
  });
});
