import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "@/lib/db";
import { userPlants, species, aftercareCheckins, inquiries } from "@/db/schema";
import {
  generateAftercareCheckins,
  getDueCheckins,
  answerCheckin,
} from "@/lib/services/aftercareService";
import { getRepotNudge, getFertilizerNudge } from "@/lib/care/supplies";
import { formatDate } from "@/lib/care/scheduler";
import { eq } from "drizzle-orm";

describe("Milestone 4: Aftercare Check-ins (F06) & Supplies Nudges (F08)", () => {
  let testPlantId: string;
  let testSpeciesId: string;
  let testUserId: string;

  beforeAll(async () => {
    const db = await getDb();
    const [sp] = await db.select().from(species).limit(1);
    testSpeciesId = sp.id;

    // Create a plant acquired from shop 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const [plant] = await db
      .insert(userPlants)
      .values({
        speciesId: testSpeciesId,
        nickname: "ต้นมอนสเตอร่าหลังการขาย",
        acquiredAt: formatDate(threeDaysAgo),
        acquiredFrom: "shop",
        potSizeInch: "8",
        potMaterial: "plastic",
        placement: "indoor_window",
      })
      .returning();

    testPlantId = plant.id;
  });

  it("generates 3, 14, and 30 day check-ins for plants acquired from shop", async () => {
    const db = await getDb();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    await generateAftercareCheckins({
      userPlantId: testPlantId,
      acquiredAt: formatDate(threeDaysAgo),
      acquiredFrom: "shop",
    });

    const checkins = await db
      .select()
      .from(aftercareCheckins)
      .where(eq(aftercareCheckins.userPlantId, testPlantId));

    expect(checkins.length).toBe(3);
    const dayMarks = checkins.map((c) => c.dayMark).sort((a, b) => a - b);
    expect(dayMarks).toEqual([3, 14, 30]);
  });

  it("answers checkin as good and returns shop advice", async () => {
    const db = await getDb();
    const [checkin] = await db
      .select()
      .from(aftercareCheckins)
      .where(eq(aftercareCheckins.userPlantId, testPlantId))
      .limit(1);

    const result = await answerCheckin({
      checkinId: checkin.id,
      answer: "good",
    });

    expect(result.success).toBe(true);
    expect(result.answer).toBe("good");
    expect(result.shopNote).toBeDefined();
    expect(result.inquiry).toBeNull();
  });

  it("answers checkin as bad, creates inquiry with ref code and rich context payload", async () => {
    const db = await getDb();
    // Get the second checkin
    const checkins = await db
      .select()
      .from(aftercareCheckins)
      .where(eq(aftercareCheckins.userPlantId, testPlantId));

    const checkin = checkins[1];

    const result = await answerCheckin({
      checkinId: checkin.id,
      answer: "bad",
      symptoms: ["ใบเหลืองจากโคน", "ดินแฉะระบายช้า"],
    });

    expect(result.success).toBe(true);
    expect(result.answer).toBe("bad");
    expect(result.inquiry).not.toBeNull();
    expect(result.inquiry?.refCode).toMatch(/^TFL-[A-Z0-9]{4}$/);
    expect(result.inquiry?.lineUrl).toContain("line.me");

    // Verify inquiry record in DB
    const [inq] = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.refCode, result.inquiry!.refCode));

    expect(inq).toBeDefined();
    expect(inq.intent).toBe("care_help");
    expect((inq.payload as any).symptoms).toEqual(["ใบเหลืองจากโคน", "ดินแฉะระบายช้า"]);
    expect((inq.payload as any).potSizeInch).toBe("8");
  });

  it("calculates repot supplies nudge with pot upsize and soil mix recommendations", () => {
    const nudge = getRepotNudge({
      currentPotInch: 8,
      speciesName: "มอนสเตอร่า",
      soilMix: "กาบมะพร้าวสับ + เพอร์ไลต์",
      ageDays: 180,
    });

    expect(nudge.shouldShow).toBe(true);
    expect(nudge.suggestedPotInch).toBe(10);
    expect(nudge.inquiryPayload.suggestedPotInch).toBe(10);
    expect(nudge.messageTh).toContain("10\"");
  });
});
