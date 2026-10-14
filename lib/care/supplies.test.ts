import { describe, it, expect } from "vitest";
import { getRepotNudge, getFertilizerNudge } from "@/lib/care/supplies";

describe("F08: Supplies Nudges (Pot & Fertilizer recommendations)", () => {
  it("suggests pot size + 2 inches up to maximum of 16 inches", () => {
    const nudge8 = getRepotNudge({
      currentPotInch: 8,
      speciesName: "มอนสเตอร่า",
      soilMix: "กาบมะพร้าวสับ + เพอร์ไลต์",
    });
    expect(nudge8.shouldShow).toBe(true);
    expect(nudge8.suggestedPotInch).toBe(10);
    expect(nudge8.messageTh).toContain('8" → แนะนำ 10"');
    expect(nudge8.messageTh).toContain("กาบมะพร้าวสับ");

    const nudge15 = getRepotNudge({
      currentPotInch: 15,
      speciesName: "ไทรใบสัก",
    });
    expect(nudge15.suggestedPotInch).toBe(16);

    const nudge16 = getRepotNudge({
      currentPotInch: 16,
      speciesName: "ยางอินเดีย",
    });
    expect(nudge16.suggestedPotInch).toBe(16);
  });

  it("suppresses nudge when nudgeDismissedAt is set", () => {
    const dismissed = getRepotNudge({
      currentPotInch: 8,
      speciesName: "มอนสเตอร่า",
      nudgeDismissedAt: new Date(),
    });
    expect(dismissed.shouldShow).toBe(false);

    const dismissedFert = getFertilizerNudge({
      currentPotInch: 8,
      speciesName: "มอนสเตอร่า",
      nudgeDismissedAt: new Date(),
    });
    expect(dismissedFert.shouldShow).toBe(false);
  });

  it("provides fertilizer recommendations with shop note", () => {
    const fert = getFertilizerNudge({
      currentPotInch: 6,
      speciesName: "กวักมรกต",
      fertilizerNote: "ออสโมโค้ท สูตร 13-13-13 ทุก 3 เดือน",
    });
    expect(fert.shouldShow).toBe(true);
    expect(fert.messageTh).toContain("ออสโมโค้ท");
  });
});
